import type { Knex } from 'knex';

interface ChatSession {
  id: string;
  verticalSlug: string;
  countryCode: string;
  verticalName: string;
  countryName: string;
  formFields: FormField[];
  currentFieldIndex: number;
  collectedData: Record<string, string>;
  consentTextShown: string;
  consentGiven: boolean;
  status: 'greeting' | 'collecting' | 'consent' | 'complete' | 'expired';
  messages: ChatMessage[];
  createdAt: number;
}

interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
}

interface ChatMessage {
  role: 'bot' | 'user';
  text: string;
  timestamp: number;
}

interface ChatResponse {
  session_id: string;
  message: string;
  status: ChatSession['status'];
  field?: FormField | null;
  options?: string[];
  progress?: { current: number; total: number };
}

// In-memory store (use Redis in production via REDIS_URL)
const sessions = new Map<string, ChatSession>();

// Clean up expired sessions every 30 minutes
setInterval(() => {
  const cutoff = Date.now() - 60 * 60 * 1000; // 1 hour TTL
  for (const [id, session] of sessions) {
    if (session.createdAt < cutoff) sessions.delete(id);
  }
}, 30 * 60 * 1000);

function generateSessionId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'cs_';
  for (let i = 0; i < 24; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function generateGreeting(verticalName: string, countryName: string): string {
  const greetings = [
    `Hi there! I am the Leadova assistant for ${verticalName} in ${countryName}. I will ask you a few quick questions to connect you with the right service providers. Ready to get started?`,
    `Welcome! I can help you find great ${verticalName} services in ${countryName}. I just need to ask a few questions to match you with verified providers. Let us begin!`,
    `Hello! Looking for ${verticalName} services in ${countryName}? I will gather some details to connect you with trusted professionals. It only takes a minute.`,
  ];
  return greetings[Math.floor(Math.random() * greetings.length)];
}

function generateFieldQuestion(field: FormField, verticalName: string): string {
  const { label, type, options, name } = field;

  // Natural phrasing for common field names
  const naturalQuestions: Record<string, string[]> = {
    full_name: [
      'What is your full name?',
      'May I have your name, please?',
      'First, could you tell me your full name?',
    ],
    email: [
      'What is the best email address to reach you?',
      'What email should we use to contact you?',
      'Could you share your email address?',
    ],
    phone: [
      'What phone number can we reach you at?',
      'Could you share your phone number?',
      'What is the best phone number to contact you?',
    ],
    address: [
      'What is your property address?',
      'Could you provide your address?',
    ],
  };

  if (naturalQuestions[name]) {
    return naturalQuestions[name][Math.floor(Math.random() * naturalQuestions[name].length)];
  }

  if (type === 'select' && options && options.length > 0) {
    return `For ${label.toLowerCase()}, which of these best describes your situation? Your options are: ${options.join(', ')}.`;
  }

  return `What is your ${label.toLowerCase()}?`;
}

function validateFieldValue(field: FormField, value: string): { valid: boolean; error?: string } {
  const trimmed = value.trim();

  if (field.required && !trimmed) {
    return { valid: false, error: `${field.label} is required. Could you please provide it?` };
  }

  if (!trimmed && !field.required) {
    return { valid: true };
  }

  if (field.type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return { valid: false, error: 'That does not look like a valid email address. Could you try again?' };
    }
  }

  if (field.type === 'tel') {
    const cleaned = trimmed.replace(/[\s\-\(\)\+]/g, '');
    if (cleaned.length < 7 || !/^\d+$/.test(cleaned)) {
      return { valid: false, error: 'That does not seem like a valid phone number. Please enter a number with at least 7 digits.' };
    }
  }

  if (field.type === 'select' && field.options && field.options.length > 0) {
    const match = field.options.find(
      opt => opt.toLowerCase() === trimmed.toLowerCase()
    );
    if (!match) {
      return {
        valid: false,
        error: `Please choose one of: ${field.options.join(', ')}.`,
      };
    }
  }

  if (field.type === 'number') {
    if (isNaN(Number(trimmed))) {
      return { valid: false, error: 'Please enter a valid number.' };
    }
  }

  return { valid: true };
}

function normalizeSelectValue(field: FormField, value: string): string {
  if (field.type === 'select' && field.options) {
    const match = field.options.find(
      opt => opt.toLowerCase() === value.trim().toLowerCase()
    );
    return match || value.trim();
  }
  return value.trim();
}

function generateTransition(prevField: FormField | null, nextField: FormField | null): string {
  const acks = [
    'Got it!',
    'Thanks!',
    'Perfect.',
    'Great, thank you.',
    'Noted.',
    'Alright!',
  ];
  return acks[Math.floor(Math.random() * acks.length)];
}

export class ChatbotService {
  private db: Knex;

  constructor(db: Knex) {
    this.db = db;
  }

  async startSession(verticalSlug: string, countryCode: string): Promise<ChatResponse> {
    const vertical = await this.db('verticals').where('slug', verticalSlug).first();
    if (!vertical) throw new Error('Vertical not found');

    const country = await this.db('countries').where('code', countryCode.toUpperCase()).first();
    if (!country) throw new Error('Country not found');

    const vc = await this.db('vertical_countries')
      .where({ vertical_id: vertical.id, country_id: country.id })
      .first();
    if (!vc) throw new Error('This vertical is not available in this country');
    if (vc.status !== 'active') throw new Error('This vertical is not yet active in this country');

    const rawFields = vc.form_fields_override || vertical.form_fields;
    const formFields: FormField[] = typeof rawFields === 'string'
      ? JSON.parse(rawFields)
      : (rawFields || []);

    const sessionId = generateSessionId();
    const greeting = generateGreeting(vertical.name, country.name);

    const consentText = `I consent to having my information collected and shared with verified service providers for ${vertical.name} services in ${country.name}. I understand I can withdraw consent at any time by contacting privacy@leadova.com.`;

    const session: ChatSession = {
      id: sessionId,
      verticalSlug,
      countryCode: countryCode.toUpperCase(),
      verticalName: vertical.name,
      countryName: country.name,
      formFields,
      currentFieldIndex: 0,
      collectedData: {},
      consentTextShown: consentText,
      consentGiven: false,
      status: 'collecting',
      messages: [{ role: 'bot', text: greeting, timestamp: Date.now() }],
      createdAt: Date.now(),
    };

    // Add the first question immediately after greeting
    const firstField = formFields[0];
    let fullMessage = greeting;
    if (firstField) {
      const question = generateFieldQuestion(firstField, vertical.name);
      fullMessage += '\n\n' + question;
      session.messages.push({ role: 'bot', text: question, timestamp: Date.now() });
    }

    sessions.set(sessionId, session);

    return {
      session_id: sessionId,
      message: fullMessage,
      status: session.status,
      field: firstField || null,
      options: firstField?.options,
      progress: { current: 0, total: formFields.length },
    };
  }

  async processMessage(sessionId: string, userMessage: string): Promise<ChatResponse> {
    const session = sessions.get(sessionId);
    if (!session) throw new Error('Session not found or expired');
    if (session.status === 'complete') throw new Error('This session is already complete');
    if (session.status === 'expired') throw new Error('This session has expired');

    // Record user message
    session.messages.push({ role: 'user', text: userMessage, timestamp: Date.now() });

    // Handle consent phase
    if (session.status === 'consent') {
      return this.handleConsent(session, userMessage);
    }

    // Handle data collection
    if (session.status === 'collecting') {
      return this.handleFieldCollection(session, userMessage);
    }

    return {
      session_id: sessionId,
      message: 'Something went wrong. Please start a new session.',
      status: session.status,
    };
  }

  private async handleFieldCollection(session: ChatSession, userMessage: string): Promise<ChatResponse> {
    const currentField = session.formFields[session.currentFieldIndex];

    // Allow skipping optional fields
    const isSkip = userMessage.trim().toLowerCase() === 'skip' && !currentField.required;

    if (!isSkip) {
      // Validate the answer
      const validation = validateFieldValue(currentField, userMessage);
      if (!validation.valid) {
        const errMsg = validation.error || 'That does not seem right. Could you try again?';
        session.messages.push({ role: 'bot', text: errMsg, timestamp: Date.now() });
        return {
          session_id: session.id,
          message: errMsg,
          status: 'collecting',
          field: currentField,
          options: currentField.options,
          progress: { current: session.currentFieldIndex, total: session.formFields.length },
        };
      }

      // Store the value
      session.collectedData[currentField.name] = normalizeSelectValue(currentField, userMessage);
    }

    // Move to next field
    session.currentFieldIndex++;

    // Check if we have more fields
    if (session.currentFieldIndex < session.formFields.length) {
      const nextField = session.formFields[session.currentFieldIndex];
      const ack = generateTransition(currentField, nextField);
      const question = generateFieldQuestion(nextField, session.verticalName);
      const fullMsg = `${ack} ${question}`;

      session.messages.push({ role: 'bot', text: fullMsg, timestamp: Date.now() });

      return {
        session_id: session.id,
        message: fullMsg,
        status: 'collecting',
        field: nextField,
        options: nextField.options,
        progress: { current: session.currentFieldIndex, total: session.formFields.length },
      };
    }

    // All fields collected -- move to consent
    session.status = 'consent';
    const consentMsg = `Thank you for providing all the details! Before I submit your information, I need your consent.\n\n"${session.consentTextShown}"\n\nDo you agree? Please type "yes" to confirm or "no" to cancel.`;

    session.messages.push({ role: 'bot', text: consentMsg, timestamp: Date.now() });

    return {
      session_id: session.id,
      message: consentMsg,
      status: 'consent',
      progress: { current: session.formFields.length, total: session.formFields.length },
    };
  }

  private async handleConsent(session: ChatSession, userMessage: string): Promise<ChatResponse> {
    const normalized = userMessage.trim().toLowerCase();
    const affirmatives = ['yes', 'yeah', 'yep', 'y', 'sure', 'ok', 'okay', 'agree', 'i agree', 'confirmed', 'i consent'];
    const negatives = ['no', 'nope', 'n', 'cancel', 'decline', 'disagree', 'refuse'];

    if (affirmatives.includes(normalized)) {
      session.consentGiven = true;
      session.status = 'complete';

      // Submit the lead to the database
      try {
        const vertical = await this.db('verticals').where('slug', session.verticalSlug).first();
        const country = await this.db('countries').where('code', session.countryCode).first();

        if (vertical && country) {
          await this.db('leads').insert({
            vertical_id: vertical.id,
            country_id: country.id,
            custom_fields: JSON.stringify(session.collectedData),
            consent_method: 'chatbot',
            consent_timestamp: new Date(),
            consent_text_shown: session.consentTextShown,
            source: 'chatbot',
            status: 'new',
          });
        }
      } catch (err) {
        console.error('Failed to save chatbot lead:', err);
      }

      const successMsg = `Your information has been submitted successfully! A verified ${session.verticalName} provider in ${session.countryName} will be in touch with you shortly. Thank you for using Leadova!`;
      session.messages.push({ role: 'bot', text: successMsg, timestamp: Date.now() });

      return {
        session_id: session.id,
        message: successMsg,
        status: 'complete',
      };
    }

    if (negatives.includes(normalized)) {
      session.status = 'expired';
      const cancelMsg = 'No problem. Your information has not been submitted and will be discarded. If you change your mind, feel free to start a new conversation anytime.';
      session.messages.push({ role: 'bot', text: cancelMsg, timestamp: Date.now() });

      sessions.delete(session.id);

      return {
        session_id: session.id,
        message: cancelMsg,
        status: 'expired',
      };
    }

    // Unclear response
    const clarifyMsg = 'I need a clear answer for consent. Please type "yes" to agree or "no" to cancel.';
    session.messages.push({ role: 'bot', text: clarifyMsg, timestamp: Date.now() });

    return {
      session_id: session.id,
      message: clarifyMsg,
      status: 'consent',
    };
  }

  getSession(sessionId: string): ChatSession | undefined {
    return sessions.get(sessionId);
  }

  getSessionState(sessionId: string): object | null {
    const session = sessions.get(sessionId);
    if (!session) return null;

    return {
      session_id: session.id,
      vertical: session.verticalName,
      country: session.countryName,
      status: session.status,
      progress: {
        current: session.currentFieldIndex,
        total: session.formFields.length,
      },
      messages: session.messages,
      collected_fields: Object.keys(session.collectedData),
    };
  }
}
