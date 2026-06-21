import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Seed countries
  const countries = [
    { code: 'PH', name: 'Philippines', flag_emoji: '\ud83c\uddf5\ud83c\udded', currency_code: 'PHP', currency_symbol: '\u20b1', privacy_jurisdiction: 'RA 10173' },
    { code: 'US', name: 'United States', flag_emoji: '\ud83c\uddfa\ud83c\uddf8', currency_code: 'USD', currency_symbol: '$', privacy_jurisdiction: 'TCPA/CCPA' },
    { code: 'AE', name: 'United Arab Emirates', flag_emoji: '\ud83c\udde6\ud83c\uddea', currency_code: 'AED', currency_symbol: 'AED', privacy_jurisdiction: 'PDPL' },
    { code: 'SG', name: 'Singapore', flag_emoji: '\ud83c\uddf8\ud83c\uddec', currency_code: 'SGD', currency_symbol: 'S$', privacy_jurisdiction: 'PDPA' },
    { code: 'AU', name: 'Australia', flag_emoji: '\ud83c\udde6\ud83c\uddfa', currency_code: 'AUD', currency_symbol: 'A$', privacy_jurisdiction: 'APPs' },
    { code: 'CA', name: 'Canada', flag_emoji: '\ud83c\udde8\ud83c\udde6', currency_code: 'CAD', currency_symbol: 'C$', privacy_jurisdiction: 'PIPEDA' },
    { code: 'GB', name: 'United Kingdom', flag_emoji: '\ud83c\uddec\ud83c\udde7', currency_code: 'GBP', currency_symbol: '\u00a3', privacy_jurisdiction: 'UK GDPR' },
    { code: 'JP', name: 'Japan', flag_emoji: '\ud83c\uddef\ud83c\uddf5', currency_code: 'JPY', currency_symbol: '\u00a5', privacy_jurisdiction: 'APPI' },
    { code: 'KR', name: 'South Korea', flag_emoji: '\ud83c\uddf0\ud83c\uddf7', currency_code: 'KRW', currency_symbol: '\u20a9', privacy_jurisdiction: 'PIPA' },
    { code: 'SA', name: 'Saudi Arabia', flag_emoji: '\ud83c\uddf8\ud83c\udde6', currency_code: 'SAR', currency_symbol: 'SAR', privacy_jurisdiction: 'PDPL' },
  ];
  await knex('countries').insert(countries);

  // Seed verticals
  const verticals = [
    {
      slug: 'ofw',
      name: 'OFW Services',
      description: 'Connect overseas Filipino workers with remittance, insurance, and financial services.',
      icon: 'globe',
      form_fields: JSON.stringify([
        { name: 'full_name', label: 'Full Name', type: 'text', required: true },
        { name: 'email', label: 'Email Address', type: 'email', required: true },
        { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
        { name: 'country_of_work', label: 'Country of Work', type: 'text', required: true },
        { name: 'service_needed', label: 'Service Needed', type: 'select', required: true, options: ['Remittance', 'Insurance', 'Loans', 'Investment', 'Housing', 'Other'] },
      ]),
      filter_fields: JSON.stringify([
        { name: 'country_of_work', label: 'Country of Work', type: 'text' },
        { name: 'service_needed', label: 'Service Needed', type: 'select', options: ['Remittance', 'Insurance', 'Loans', 'Investment', 'Housing', 'Other'] },
      ]),
      status: 'active',
    },
    {
      slug: 'local-jobs',
      name: 'Local Jobs',
      description: 'Job seekers looking for local employment opportunities across industries.',
      icon: 'briefcase',
      form_fields: JSON.stringify([
        { name: 'full_name', label: 'Full Name', type: 'text', required: true },
        { name: 'email', label: 'Email Address', type: 'email', required: true },
        { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
        { name: 'job_type', label: 'Job Type', type: 'select', required: true, options: ['Full-time', 'Part-time', 'Contract', 'Freelance'] },
        { name: 'industry', label: 'Preferred Industry', type: 'text', required: false },
        { name: 'experience_years', label: 'Years of Experience', type: 'number', required: false },
      ]),
      filter_fields: JSON.stringify([
        { name: 'job_type', label: 'Job Type', type: 'select', options: ['Full-time', 'Part-time', 'Contract', 'Freelance'] },
        { name: 'industry', label: 'Industry', type: 'text' },
      ]),
      status: 'active',
    },
    {
      slug: 'roofing',
      name: 'Roofing',
      description: 'Homeowners seeking roofing repair, replacement, and inspection services.',
      icon: 'home',
      form_fields: JSON.stringify([
        { name: 'full_name', label: 'Full Name', type: 'text', required: true },
        { name: 'email', label: 'Email Address', type: 'email', required: true },
        { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
        { name: 'address', label: 'Property Address', type: 'text', required: true },
        { name: 'service_type', label: 'Service Needed', type: 'select', required: true, options: ['Repair', 'Replacement', 'Inspection', 'New Installation', 'Emergency'] },
        { name: 'roof_type', label: 'Roof Type', type: 'select', required: false, options: ['Asphalt Shingle', 'Metal', 'Tile', 'Flat', 'Other'] },
      ]),
      filter_fields: JSON.stringify([
        { name: 'service_type', label: 'Service Needed', type: 'select', options: ['Repair', 'Replacement', 'Inspection', 'New Installation', 'Emergency'] },
        { name: 'roof_type', label: 'Roof Type', type: 'select', options: ['Asphalt Shingle', 'Metal', 'Tile', 'Flat', 'Other'] },
      ]),
      status: 'active',
    },
    {
      slug: 'real-estate',
      name: 'Real Estate',
      description: 'Buyers, sellers, and renters looking for property and real estate services.',
      icon: 'building',
      form_fields: JSON.stringify([
        { name: 'full_name', label: 'Full Name', type: 'text', required: true },
        { name: 'email', label: 'Email Address', type: 'email', required: true },
        { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
        { name: 'intent', label: 'Looking to', type: 'select', required: true, options: ['Buy', 'Sell', 'Rent', 'Invest'] },
        { name: 'property_type', label: 'Property Type', type: 'select', required: false, options: ['House', 'Condo', 'Townhouse', 'Land', 'Commercial'] },
        { name: 'budget', label: 'Budget Range', type: 'text', required: false },
      ]),
      filter_fields: JSON.stringify([
        { name: 'intent', label: 'Intent', type: 'select', options: ['Buy', 'Sell', 'Rent', 'Invest'] },
        { name: 'property_type', label: 'Property Type', type: 'select', options: ['House', 'Condo', 'Townhouse', 'Land', 'Commercial'] },
      ]),
      status: 'active',
    },
    {
      slug: 'insurance',
      name: 'Insurance',
      description: 'Individuals and families looking for life, health, auto, and property insurance.',
      icon: 'shield',
      form_fields: JSON.stringify([
        { name: 'full_name', label: 'Full Name', type: 'text', required: true },
        { name: 'email', label: 'Email Address', type: 'email', required: true },
        { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
        { name: 'insurance_type', label: 'Insurance Type', type: 'select', required: true, options: ['Life', 'Health', 'Auto', 'Property', 'Travel', 'Business'] },
        { name: 'coverage_amount', label: 'Desired Coverage', type: 'text', required: false },
      ]),
      filter_fields: JSON.stringify([
        { name: 'insurance_type', label: 'Insurance Type', type: 'select', options: ['Life', 'Health', 'Auto', 'Property', 'Travel', 'Business'] },
      ]),
      status: 'active',
    },
    {
      slug: 'solar',
      name: 'Solar Energy',
      description: 'Homeowners and businesses interested in solar panel installation and renewable energy.',
      icon: 'sun',
      form_fields: JSON.stringify([
        { name: 'full_name', label: 'Full Name', type: 'text', required: true },
        { name: 'email', label: 'Email Address', type: 'email', required: true },
        { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
        { name: 'address', label: 'Property Address', type: 'text', required: true },
        { name: 'property_ownership', label: 'Property Ownership', type: 'select', required: true, options: ['Own', 'Rent', 'Other'] },
        { name: 'monthly_bill', label: 'Monthly Electric Bill', type: 'text', required: false },
      ]),
      filter_fields: JSON.stringify([
        { name: 'property_ownership', label: 'Ownership', type: 'select', options: ['Own', 'Rent', 'Other'] },
      ]),
      status: 'active',
    },
    {
      slug: 'education',
      name: 'Education',
      description: 'Students and professionals seeking educational programs, certifications, and training.',
      icon: 'book',
      form_fields: JSON.stringify([
        { name: 'full_name', label: 'Full Name', type: 'text', required: true },
        { name: 'email', label: 'Email Address', type: 'email', required: true },
        { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
        { name: 'program_interest', label: 'Program Interest', type: 'select', required: true, options: ['Undergraduate', 'Graduate', 'Vocational', 'Online Course', 'Certification', 'Language'] },
        { name: 'field_of_study', label: 'Field of Study', type: 'text', required: false },
      ]),
      filter_fields: JSON.stringify([
        { name: 'program_interest', label: 'Program Interest', type: 'select', options: ['Undergraduate', 'Graduate', 'Vocational', 'Online Course', 'Certification', 'Language'] },
      ]),
      status: 'active',
    },
    {
      slug: 'legal',
      name: 'Legal Services',
      description: 'Individuals and businesses seeking legal representation and advisory services.',
      icon: 'scale',
      form_fields: JSON.stringify([
        { name: 'full_name', label: 'Full Name', type: 'text', required: true },
        { name: 'email', label: 'Email Address', type: 'email', required: true },
        { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
        { name: 'legal_area', label: 'Area of Law', type: 'select', required: true, options: ['Family', 'Criminal', 'Immigration', 'Corporate', 'Real Estate', 'Personal Injury', 'Labor', 'Other'] },
        { name: 'urgency', label: 'Urgency', type: 'select', required: false, options: ['Immediate', 'Within a week', 'Within a month', 'Just exploring'] },
      ]),
      filter_fields: JSON.stringify([
        { name: 'legal_area', label: 'Area of Law', type: 'select', options: ['Family', 'Criminal', 'Immigration', 'Corporate', 'Real Estate', 'Personal Injury', 'Labor', 'Other'] },
        { name: 'urgency', label: 'Urgency', type: 'select', options: ['Immediate', 'Within a week', 'Within a month', 'Just exploring'] },
      ]),
      status: 'active',
    },
  ];
  await knex('verticals').insert(verticals);

  // Get IDs for FK references
  const countryRows = await knex('countries').select('id', 'code');
  const verticalRows = await knex('verticals').select('id', 'slug');
  const cMap: Record<string, number> = {};
  const vMap: Record<string, number> = {};
  for (const c of countryRows) cMap[c.code] = c.id;
  for (const v of verticalRows) vMap[v.slug] = v.id;

  // Seed vertical_countries -- active combos with landing_page_config
  const verticalCountries = [
    // OFW -- PH, AE, SG, SA, JP, KR
    {
      vertical_id: vMap['ofw'], country_id: cMap['PH'], status: 'active', price: 2500, currency_code: 'PHP',
      seo_title: 'OFW Services Philippines | Leadova',
      seo_description: 'Connect with remittance, insurance, and financial services for overseas Filipino workers.',
      landing_page_config: JSON.stringify({
        hero_title: 'Services for Overseas Filipino Workers',
        hero_subtitle: 'Find the best remittance rates, insurance, loans, and investment services tailored for OFWs.',
        features: ['Remittance comparison', 'OFW insurance plans', 'Housing loan assistance', 'Investment advisory'],
        trust_badges: ['RA 10173 Compliant', 'Verified Providers', 'Trusted by 10,000+ OFWs'],
        cta_text: 'Get Free Consultation',
      }),
    },
    {
      vertical_id: vMap['ofw'], country_id: cMap['AE'], status: 'active', price: 99, currency_code: 'USD',
      seo_title: 'OFW Services UAE | Leadova',
      seo_description: 'Financial and remittance services for Filipino workers in the UAE.',
      landing_page_config: JSON.stringify({
        hero_title: 'OFW Services in the UAE',
        hero_subtitle: 'Remittance, insurance, and financial planning for Filipinos working in the Emirates.',
        features: ['UAE-PH remittance', 'Insurance plans', 'Savings programs', 'Housing assistance'],
        trust_badges: ['PDPL Compliant', 'Licensed Providers'],
        cta_text: 'Get Started',
      }),
    },
    {
      vertical_id: vMap['ofw'], country_id: cMap['SG'], status: 'active', price: 139, currency_code: 'SGD',
      seo_title: 'OFW Services Singapore | Leadova',
      seo_description: 'Financial services for overseas Filipino workers in Singapore.',
      landing_page_config: JSON.stringify({
        hero_title: 'OFW Services in Singapore',
        hero_subtitle: 'Connect with the best financial services for Filipinos in Singapore.',
        features: ['Remittance services', 'Insurance products', 'Investment options'],
        trust_badges: ['PDPA Compliant', 'Verified Partners'],
        cta_text: 'Get Free Quote',
      }),
    },
    {
      vertical_id: vMap['ofw'], country_id: cMap['SA'], status: 'coming_soon', price: 99, currency_code: 'USD',
      seo_title: 'OFW Services Saudi Arabia | Leadova',
      seo_description: 'Coming soon: OFW services in Saudi Arabia.',
      landing_page_config: JSON.stringify({
        hero_title: 'OFW Services in Saudi Arabia',
        hero_subtitle: 'We are expanding to Saudi Arabia. Join the waitlist to be notified.',
        features: [], trust_badges: [], cta_text: 'Join Waitlist',
      }),
    },
    // Local Jobs -- PH, US
    {
      vertical_id: vMap['local-jobs'], country_id: cMap['PH'], status: 'active', price: 2500, currency_code: 'PHP',
      seo_title: 'Local Jobs Philippines | Leadova',
      seo_description: 'Find qualified job seekers in the Philippines for your open positions.',
      landing_page_config: JSON.stringify({
        hero_title: 'Find Your Next Opportunity',
        hero_subtitle: 'Connect with top employers across the Philippines. Submit your profile and get matched.',
        features: ['Direct employer connections', 'Verified job listings', 'Fast matching', 'Free for job seekers'],
        trust_badges: ['RA 10173 Compliant', 'Verified Employers', '50,000+ Jobs Matched'],
        cta_text: 'Submit Your Profile',
      }),
    },
    {
      vertical_id: vMap['local-jobs'], country_id: cMap['US'], status: 'active', price: 99, currency_code: 'USD',
      seo_title: 'Local Jobs United States | Leadova',
      seo_description: 'Connect job seekers with local employment opportunities in the US.',
      landing_page_config: JSON.stringify({
        hero_title: 'Find Local Jobs Near You',
        hero_subtitle: 'Submit your profile and connect with employers in your area.',
        features: ['Local matching', 'All industries', 'Free submissions', 'Privacy protected'],
        trust_badges: ['TCPA Compliant', 'CCPA Compliant'],
        cta_text: 'Find Jobs Now',
      }),
    },
    // Roofing -- US
    {
      vertical_id: vMap['roofing'], country_id: cMap['US'], status: 'active', price: 149, currency_code: 'USD',
      seo_title: 'Roofing Leads United States | Leadova',
      seo_description: 'Get matched with qualified homeowners looking for roofing services.',
      landing_page_config: JSON.stringify({
        hero_title: 'Get Your Roof Fixed Right',
        hero_subtitle: 'Connect with trusted, licensed roofing contractors in your area. Free quotes, no obligation.',
        features: ['Licensed contractors', 'Free estimates', 'All roof types', 'Emergency service available'],
        trust_badges: ['TCPA Compliant', 'Licensed & Insured', 'BBB Accredited Partners'],
        cta_text: 'Get Free Quote',
      }),
    },
    // Real Estate -- PH, US, AE, SG
    {
      vertical_id: vMap['real-estate'], country_id: cMap['PH'], status: 'active', price: 4500, currency_code: 'PHP',
      seo_title: 'Real Estate Leads Philippines | Leadova',
      seo_description: 'Qualified real estate leads in the Philippines for agents and brokers.',
      landing_page_config: JSON.stringify({
        hero_title: 'Find Your Dream Property',
        hero_subtitle: 'Whether buying, selling, or renting, connect with verified real estate professionals.',
        features: ['Verified agents', 'All property types', 'Nationwide coverage', 'Free consultation'],
        trust_badges: ['RA 10173 Compliant', 'Licensed Brokers'],
        cta_text: 'Start Your Search',
      }),
    },
    {
      vertical_id: vMap['real-estate'], country_id: cMap['US'], status: 'active', price: 199, currency_code: 'USD',
      seo_title: 'Real Estate Leads US | Leadova',
      seo_description: 'High-intent real estate leads for US agents and brokers.',
      landing_page_config: JSON.stringify({
        hero_title: 'Your Real Estate Journey Starts Here',
        hero_subtitle: 'Connect with expert real estate agents in your area.',
        features: ['Buyer and seller leads', 'All property types', 'Verified agents', 'Market insights'],
        trust_badges: ['TCPA Compliant', 'NAR Partners'],
        cta_text: 'Get Matched',
      }),
    },
    // Insurance -- PH, US
    {
      vertical_id: vMap['insurance'], country_id: cMap['PH'], status: 'active', price: 2500, currency_code: 'PHP',
      seo_title: 'Insurance Leads Philippines | Leadova',
      seo_description: 'Connect with people looking for insurance coverage in the Philippines.',
      landing_page_config: JSON.stringify({
        hero_title: 'Find the Right Insurance Coverage',
        hero_subtitle: 'Compare plans from top insurance providers. Get a free quote in minutes.',
        features: ['Life insurance', 'Health insurance', 'Auto insurance', 'Property insurance'],
        trust_badges: ['RA 10173 Compliant', 'IC Licensed Providers'],
        cta_text: 'Get Free Quote',
      }),
    },
    {
      vertical_id: vMap['insurance'], country_id: cMap['US'], status: 'active', price: 149, currency_code: 'USD',
      seo_title: 'Insurance Leads US | Leadova',
      seo_description: 'High-quality insurance leads for US agents and agencies.',
      landing_page_config: JSON.stringify({
        hero_title: 'Compare Insurance Plans',
        hero_subtitle: 'Get quotes from multiple providers. Find the best coverage at the best price.',
        features: ['All insurance types', 'Instant quotes', 'Licensed agents', 'No obligation'],
        trust_badges: ['TCPA Compliant', 'State Licensed'],
        cta_text: 'Compare Now',
      }),
    },
    // Solar -- US, AU
    {
      vertical_id: vMap['solar'], country_id: cMap['US'], status: 'active', price: 199, currency_code: 'USD',
      seo_title: 'Solar Leads US | Leadova',
      seo_description: 'Homeowners interested in solar panel installation in the United States.',
      landing_page_config: JSON.stringify({
        hero_title: 'Go Solar and Save',
        hero_subtitle: 'Get free solar quotes from certified installers in your area. Cut your electricity bill.',
        features: ['Free site assessment', 'Federal tax credit', 'Certified installers', 'Financing available'],
        trust_badges: ['TCPA Compliant', 'NABCEP Certified Partners'],
        cta_text: 'Get Solar Quote',
      }),
    },
    {
      vertical_id: vMap['solar'], country_id: cMap['AU'], status: 'coming_soon', price: 199, currency_code: 'AUD',
      seo_title: 'Solar Leads Australia | Leadova',
      seo_description: 'Coming soon: Solar leads in Australia.',
      landing_page_config: JSON.stringify({
        hero_title: 'Solar Energy in Australia',
        hero_subtitle: 'We are launching solar leads in Australia soon. Join the waitlist.',
        features: [], trust_badges: [], cta_text: 'Join Waitlist',
      }),
    },
    // Education -- PH, US, SG
    {
      vertical_id: vMap['education'], country_id: cMap['PH'], status: 'active', price: 2500, currency_code: 'PHP',
      seo_title: 'Education Leads Philippines | Leadova',
      seo_description: 'Students and professionals looking for educational programs in the Philippines.',
      landing_page_config: JSON.stringify({
        hero_title: 'Invest in Your Future',
        hero_subtitle: 'Find the right program, school, or certification to advance your career.',
        features: ['All program levels', 'Vocational training', 'Online courses', 'Scholarship info'],
        trust_badges: ['RA 10173 Compliant', 'CHED & TESDA Partners'],
        cta_text: 'Explore Programs',
      }),
    },
    {
      vertical_id: vMap['education'], country_id: cMap['US'], status: 'coming_soon', price: 149, currency_code: 'USD',
      seo_title: 'Education Leads US | Leadova',
      seo_description: 'Coming soon: Education leads in the United States.',
      landing_page_config: JSON.stringify({
        hero_title: 'Education Opportunities in the US',
        hero_subtitle: 'We are expanding education leads to the US. Join the waitlist.',
        features: [], trust_badges: [], cta_text: 'Join Waitlist',
      }),
    },
    // Legal -- PH, US
    {
      vertical_id: vMap['legal'], country_id: cMap['PH'], status: 'active', price: 4500, currency_code: 'PHP',
      seo_title: 'Legal Leads Philippines | Leadova',
      seo_description: 'People looking for legal services in the Philippines.',
      landing_page_config: JSON.stringify({
        hero_title: 'Find the Right Lawyer',
        hero_subtitle: 'Connect with verified attorneys across all areas of law. Free initial consultation.',
        features: ['All practice areas', 'Verified lawyers', 'Free consultation', 'Nationwide coverage'],
        trust_badges: ['RA 10173 Compliant', 'IBP Verified'],
        cta_text: 'Get Legal Help',
      }),
    },
    {
      vertical_id: vMap['legal'], country_id: cMap['US'], status: 'coming_soon', price: 199, currency_code: 'USD',
      seo_title: 'Legal Leads US | Leadova',
      seo_description: 'Coming soon: Legal service leads in the United States.',
      landing_page_config: JSON.stringify({
        hero_title: 'Legal Services in the US',
        hero_subtitle: 'We are expanding legal leads to the US. Join the waitlist.',
        features: [], trust_badges: [], cta_text: 'Join Waitlist',
      }),
    },
  ];
  await knex('vertical_countries').insert(verticalCountries);
}

export async function down(knex: Knex): Promise<void> {
  await knex('vertical_countries').del();
  await knex('verticals').del();
  await knex('countries').del();
}
