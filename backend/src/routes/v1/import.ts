import { Router } from 'express';
import { z } from 'zod';
import type { Knex } from 'knex';
import { requireAuth, requireRole } from './auth.js';

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };

  // Parse header row
  const headers = parseCsvLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length === 0 || (values.length === 1 && !values[0])) continue;

    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] || '';
    }
    rows.push(row);
  }

  return { headers, rows };
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}

export function importRoutes(db: Knex): Router {
  const router = Router();

  // CSV import via multipart (expects JSON body with csv_text for simplicity,
  // or can accept the parsed rows directly with column_mapping)
  router.post('/import/csv', requireAuth, async (req: any, res, next) => {
    try {
      const data = z.object({
        csv_text: z.string().optional(),
        rows: z.array(z.record(z.string())).optional(),
        vertical_slug: z.string().min(1),
        country_code: z.string().length(2),
        consent_text: z.string().min(1),
        column_mapping: z.record(z.string()).optional(),
      }).refine(d => d.csv_text || d.rows, {
        message: 'Either csv_text or rows must be provided',
      }).parse(req.body);

      // Verify role: subscriber or admin
      if (req.session.role !== 'admin' && req.session.role !== 'subscriber') {
        return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Only subscribers and admins can import leads' } });
      }

      const vertical = await db('verticals').where('slug', data.vertical_slug).first();
      if (!vertical) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Vertical not found' } });
      }

      const country = await db('countries').where('code', data.country_code).first();
      if (!country) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Country not found' } });
      }

      const vc = await db('vertical_countries')
        .where({ vertical_id: vertical.id, country_id: country.id })
        .first();
      if (!vc) {
        return res.status(400).json({ success: false, error: { code: 'NOT_ACTIVE', message: 'Vertical not active in this country' } });
      }

      // Get form field definitions
      const rawFields = vc.form_fields_override || vertical.form_fields;
      const formFields = typeof rawFields === 'string' ? JSON.parse(rawFields) : (rawFields || []);
      const requiredFieldNames = formFields.filter((f: any) => f.required).map((f: any) => f.name);
      const allFieldNames = formFields.map((f: any) => f.name);

      // Parse CSV if text provided
      let rows: Record<string, string>[];
      if (data.csv_text) {
        const parsed = parseCSV(data.csv_text);
        rows = parsed.rows;
      } else {
        rows = data.rows || [];
      }

      if (rows.length === 0) {
        return res.status(400).json({ success: false, error: { code: 'EMPTY_CSV', message: 'No data rows found in CSV' } });
      }

      if (rows.length > 5000) {
        return res.status(400).json({ success: false, error: { code: 'TOO_MANY_ROWS', message: 'Maximum 5000 rows per import' } });
      }

      // Apply column mapping if provided
      const mapping = data.column_mapping || {};

      const results = {
        total: rows.length,
        imported: 0,
        skipped: 0,
        errors: [] as { row: number; message: string }[],
      };

      for (let i = 0; i < rows.length; i++) {
        const rawRow = rows[i];

        // Apply column mapping
        const mappedRow: Record<string, string> = {};
        for (const [csvCol, value] of Object.entries(rawRow)) {
          const targetField = mapping[csvCol] || csvCol;
          mappedRow[targetField] = value;
        }

        // Validate required fields
        const missingFields: string[] = [];
        for (const required of requiredFieldNames) {
          if (!mappedRow[required] || !mappedRow[required].trim()) {
            missingFields.push(required);
          }
        }

        if (missingFields.length > 0) {
          results.errors.push({ row: i + 2, message: `Missing required fields: ${missingFields.join(', ')}` });
          results.skipped++;
          continue;
        }

        // Check for duplicates by email + phone
        const email = mappedRow.email?.trim().toLowerCase();
        const phone = mappedRow.phone?.trim();

        if (email || phone) {
          let dupeQuery = db('leads')
            .where('vertical_id', vertical.id)
            .where('country_id', country.id)
            .whereNull('deleted_at');

          if (email && phone) {
            dupeQuery = dupeQuery.where(function () {
              this.whereRaw("custom_fields->>'email' ILIKE ?", [email])
                .andWhereRaw("custom_fields->>'phone' = ?", [phone]);
            });
          } else if (email) {
            dupeQuery = dupeQuery.whereRaw("custom_fields->>'email' ILIKE ?", [email]);
          }

          const existing = await dupeQuery.first();
          if (existing) {
            results.errors.push({ row: i + 2, message: `Duplicate: ${email || phone} already exists` });
            results.skipped++;
            continue;
          }
        }

        // Filter to only known fields
        const cleanRow: Record<string, string> = {};
        for (const fieldName of allFieldNames) {
          if (mappedRow[fieldName] !== undefined) {
            cleanRow[fieldName] = mappedRow[fieldName].trim();
          }
        }

        try {
          await db('leads').insert({
            vertical_id: vertical.id,
            country_id: country.id,
            custom_fields: JSON.stringify(cleanRow),
            consent_method: 'web_form',
            consent_timestamp: new Date(),
            consent_text_shown: data.consent_text,
            source: 'csv',
            ip_address: req.ip,
            status: 'new',
          });
          results.imported++;
        } catch (err: any) {
          results.errors.push({ row: i + 2, message: err.message || 'Database error' });
          results.skipped++;
        }
      }

      res.status(201).json({ success: true, data: results });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
