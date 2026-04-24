require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Starting seed...');

    // Hash password for demo user
    const passwordHash = await bcrypt.hash('password123', 10);

    // Users
    await client.query(`DELETE FROM users WHERE email = 'demo@pmcopilot.com'`);
    await client.query(
      `INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4)`,
      ['demo@pmcopilot.com', passwordHash, 'Demo User', 'admin']
    );
    console.log('Users seeded');

    // Roadmap Items
    await client.query('TRUNCATE roadmap_items RESTART IDENTITY CASCADE');
    const roadmapItems = [
      ['AI-Powered Search', 'Implement intelligent search with NLP capabilities for better content discovery', 'In Progress', 'High', 'Q1 2026', 'Core Platform', 'Sarah Chen', 65, '2026-01-15', '2026-03-30'],
      ['Mobile App Redesign', 'Complete overhaul of the mobile application with modern UI/UX patterns', 'In Progress', 'High', 'Q1 2026', 'Mobile', 'James Wilson', 40, '2026-02-01', '2026-04-15'],
      ['Enterprise SSO Integration', 'Add SAML and OIDC support for enterprise single sign-on', 'Planned', 'High', 'Q2 2026', 'Security', 'Maria Garcia', 10, '2026-04-01', '2026-05-30'],
      ['Real-time Collaboration', 'Enable simultaneous editing and live cursors for team workspaces', 'Planned', 'Medium', 'Q2 2026', 'Collaboration', 'Alex Kim', 0, '2026-04-15', '2026-06-30'],
      ['Advanced Analytics Dashboard', 'Build comprehensive analytics with custom reports and visualizations', 'In Progress', 'High', 'Q1 2026', 'Analytics', 'David Park', 75, '2026-01-01', '2026-03-15'],
      ['API V3 Launch', 'Release next-generation REST and GraphQL API with improved performance', 'Planned', 'Medium', 'Q2 2026', 'Platform', 'Rachel Lee', 5, '2026-05-01', '2026-07-15'],
      ['Automated Workflow Engine', 'No-code workflow automation builder for business processes', 'Discovery', 'Medium', 'Q3 2026', 'Automation', 'Tom Brown', 0, '2026-07-01', '2026-09-30'],
      ['Data Export & Migration Tools', 'Self-service data export in multiple formats with migration wizards', 'Completed', 'Low', 'Q1 2026', 'Data', 'Lisa Wang', 100, '2025-11-01', '2026-01-31'],
      ['Accessibility Compliance (WCAG 2.1)', 'Achieve full WCAG 2.1 AA compliance across all interfaces', 'In Progress', 'High', 'Q1 2026', 'UX', 'Nina Patel', 55, '2026-01-15', '2026-03-30'],
      ['Notification Center Revamp', 'Redesign notification system with smart grouping and preferences', 'Planned', 'Low', 'Q2 2026', 'UX', 'Kevin Liu', 0, '2026-04-01', '2026-05-15'],
      ['Multi-language Support', 'Internationalization for 12 additional languages', 'Discovery', 'Medium', 'Q3 2026', 'Platform', 'Emma Scott', 0, '2026-07-15', '2026-10-30'],
      ['Performance Optimization Sprint', 'Reduce page load times by 40% and improve Core Web Vitals', 'Completed', 'High', 'Q1 2026', 'Engineering', 'Ryan Chen', 100, '2025-12-01', '2026-02-15'],
      ['Customer Health Score', 'ML-based customer health scoring for proactive retention', 'Planned', 'Medium', 'Q2 2026', 'Analytics', 'Sophie Turner', 15, '2026-04-15', '2026-06-30'],
      ['Webhook Management Console', 'Self-service webhook configuration and monitoring dashboard', 'In Progress', 'Low', 'Q1 2026', 'Platform', 'Mike Johnson', 80, '2026-01-15', '2026-03-15'],
      ['Dark Mode', 'System-wide dark mode support with automatic switching', 'Planned', 'Low', 'Q2 2026', 'UX', 'Anna Lee', 0, '2026-05-01', '2026-06-15'],
      ['Audit Log & Compliance', 'Comprehensive audit logging for SOC2 and GDPR compliance', 'In Progress', 'High', 'Q1 2026', 'Security', 'Chris Davis', 50, '2026-02-01', '2026-04-30'],
    ];
    for (const item of roadmapItems) {
      await client.query(
        `INSERT INTO roadmap_items (title, description, status, priority, quarter, category, owner, progress, start_date, end_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        item
      );
    }
    console.log('Roadmap items seeded');

    // Features
    await client.query('TRUNCATE features RESTART IDENTITY CASCADE');
    const features = [
      ['Smart Search Autocomplete', 'AI-driven search suggestions based on user behavior and content relevance', 'In Development', 'High', 'Medium', 'High', 8.5, 'Search', 'Sarah Chen'],
      ['Two-Factor Authentication', 'TOTP and SMS-based 2FA for enhanced account security', 'Released', 'Critical', 'Low', 'High', 9.2, 'Security', 'Maria Garcia'],
      ['Drag-and-Drop Dashboard Builder', 'Visual dashboard creation with customizable widgets', 'In Development', 'High', 'High', 'High', 7.8, 'Analytics', 'David Park'],
      ['Bulk Import via CSV', 'Import records in bulk through CSV file upload with validation', 'Released', 'Medium', 'Low', 'Medium', 6.5, 'Data', 'Lisa Wang'],
      ['Custom Email Templates', 'User-configurable email notification templates with variables', 'Backlog', 'Low', 'Medium', 'Low', 4.2, 'Communication', 'Kevin Liu'],
      ['Role-Based Access Control', 'Granular permissions system with custom roles', 'In Development', 'Critical', 'High', 'High', 8.8, 'Security', 'Maria Garcia'],
      ['Interactive Onboarding Wizard', 'Step-by-step guided setup for new users', 'Testing', 'High', 'Medium', 'High', 7.5, 'UX', 'Nina Patel'],
      ['Scheduled Reports', 'Automated report generation and delivery on configurable schedules', 'Backlog', 'Medium', 'Medium', 'Medium', 6.0, 'Analytics', 'Sophie Turner'],
      ['In-App Chat Support', 'Real-time chat widget for customer support within the application', 'Discovery', 'Medium', 'High', 'Medium', 5.5, 'Support', 'Tom Brown'],
      ['Kanban Board View', 'Visual kanban boards for project and task management', 'Released', 'High', 'Medium', 'High', 8.0, 'Productivity', 'James Wilson'],
      ['API Rate Limiting Dashboard', 'Visual monitoring of API usage and rate limit status', 'Backlog', 'Low', 'Low', 'Low', 3.8, 'Platform', 'Rachel Lee'],
      ['Offline Mode', 'Progressive web app support for basic offline functionality', 'Discovery', 'Medium', 'High', 'Medium', 5.0, 'Mobile', 'James Wilson'],
      ['Advanced Filtering System', 'Multi-criteria filtering with saved filter presets', 'Testing', 'High', 'Medium', 'High', 7.2, 'UX', 'Alex Kim'],
      ['Webhook Retry Logic', 'Automatic retry with exponential backoff for failed webhooks', 'In Development', 'Medium', 'Low', 'Medium', 6.8, 'Platform', 'Mike Johnson'],
      ['Data Visualization Library', 'Embeddable charts and graphs for user-facing analytics', 'Backlog', 'Medium', 'High', 'High', 6.2, 'Analytics', 'David Park'],
      ['Single Sign-On (SAML)', 'Enterprise SAML-based single sign-on integration', 'In Development', 'Critical', 'Medium', 'High', 9.0, 'Security', 'Maria Garcia'],
    ];
    for (const f of features) {
      await client.query(
        `INSERT INTO features (title, description, status, priority, effort, impact, score, category, assignee) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        f
      );
    }
    console.log('Features seeded');

    // Sprints
    await client.query('TRUNCATE sprints RESTART IDENTITY CASCADE');
    const sprints = [
      ['Sprint 23 - Foundation', 'Establish core architecture and CI/CD pipeline', 'Completed', '2025-12-02', '2025-12-15', 40, 38],
      ['Sprint 24 - Auth & Security', 'Implement authentication system and security infrastructure', 'Completed', '2025-12-16', '2025-12-29', 42, 40],
      ['Sprint 25 - Data Layer', 'Build data models, migrations, and API endpoints', 'Completed', '2026-01-06', '2026-01-19', 38, 36],
      ['Sprint 26 - Search & Discovery', 'AI search features and content discovery engine', 'Completed', '2026-01-20', '2026-02-02', 44, 42],
      ['Sprint 27 - Analytics Core', 'Analytics pipeline and basic dashboard', 'Completed', '2026-02-03', '2026-02-16', 40, 39],
      ['Sprint 28 - Mobile First', 'Mobile app redesign phase 1', 'Completed', '2026-02-17', '2026-03-02', 36, 34],
      ['Sprint 29 - Integration', 'Third-party integrations and webhook system', 'Active', '2026-03-03', '2026-03-16', 42, null],
      ['Sprint 30 - Polish', 'Bug fixes, performance, and UX improvements', 'Planning', '2026-03-17', '2026-03-30', 40, null],
      ['Sprint 31 - SSO & Enterprise', 'Enterprise SSO and compliance features', 'Planning', '2026-03-31', '2026-04-13', 44, null],
      ['Sprint 32 - Collaboration', 'Real-time collaboration features', 'Future', '2026-04-14', '2026-04-27', 40, null],
      ['Sprint 33 - API V3 Alpha', 'API V3 alpha release preparation', 'Future', '2026-04-28', '2026-05-11', 42, null],
      ['Sprint 34 - Notifications', 'Notification center redesign', 'Future', '2026-05-12', '2026-05-25', 38, null],
      ['Sprint 35 - Automation', 'Workflow automation engine phase 1', 'Future', '2026-05-26', '2026-06-08', 40, null],
      ['Sprint 36 - Testing', 'Comprehensive testing and QA sprint', 'Future', '2026-06-09', '2026-06-22', 36, null],
      ['Sprint 37 - Launch Prep', 'Final preparations for major release', 'Future', '2026-06-23', '2026-07-06', 44, null],
    ];
    for (const s of sprints) {
      await client.query(
        `INSERT INTO sprints (name, goal, status, start_date, end_date, capacity, velocity) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        s
      );
    }
    console.log('Sprints seeded');

    // User Stories
    await client.query('TRUNCATE user_stories RESTART IDENTITY CASCADE');
    const stories = [
      ['User can search with natural language queries', 'As a user, I want to search using natural language so that I can find content without knowing exact keywords', 'Given a natural language query, when I submit the search, then relevant results appear ranked by relevance', 5, 'High', 'In Progress', 7, 1],
      ['Admin can configure SSO provider', 'As an admin, I want to configure SAML SSO so that my team can use corporate credentials', 'Given admin access, when I configure SSO settings, then users can authenticate via the identity provider', 8, 'Critical', 'Backlog', 9, 16],
      ['User receives real-time notifications', 'As a user, I want real-time notifications so that I stay informed about important updates', 'Given I am logged in, when an event occurs, then I receive a notification within 2 seconds', 3, 'Medium', 'Done', 6, null],
      ['User can create custom dashboard', 'As a user, I want to create custom dashboards so that I can monitor my key metrics', 'Given dashboard builder access, when I drag widgets, then they snap to grid and display data', 8, 'High', 'In Progress', 7, 3],
      ['User can export data to CSV', 'As a user, I want to export my data to CSV so that I can analyze it in spreadsheets', 'Given exportable data, when I click export, then a CSV file downloads with all selected records', 3, 'Medium', 'Done', 5, 4],
      ['User can enable 2FA on account', 'As a user, I want to enable two-factor authentication so that my account is more secure', 'Given account settings, when I enable 2FA, then I must provide a TOTP code on next login', 5, 'Critical', 'Done', 4, 2],
      ['Admin can assign roles to users', 'As an admin, I want to assign roles so that I can control access to features', 'Given admin panel, when I assign a role, then the user permissions update immediately', 5, 'High', 'In Progress', 7, 6],
      ['User can filter results by multiple criteria', 'As a user, I want advanced filtering so that I can narrow down results precisely', 'Given a list view, when I apply multiple filters, then results update to match all criteria', 5, 'High', 'Testing', 7, 13],
      ['System retries failed webhooks', 'As a developer, I want webhook retries so that transient failures do not cause data loss', 'Given a failed webhook, when retry is triggered, then it uses exponential backoff up to 3 attempts', 3, 'Medium', 'In Progress', 7, 14],
      ['User sees onboarding tutorial', 'As a new user, I want a guided onboarding so that I can learn the product quickly', 'Given first login, when onboarding starts, then 5 interactive steps guide through key features', 5, 'High', 'Testing', 7, 7],
      ['User can schedule recurring reports', 'As a user, I want to schedule reports so that I receive them automatically', 'Given report builder, when I set a schedule, then the report is emailed at the specified frequency', 8, 'Medium', 'Backlog', null, 8],
      ['Mobile user can access offline', 'As a mobile user, I want offline access so that I can view data without internet', 'Given cached data, when offline, then I can view previously loaded screens', 13, 'Medium', 'Discovery', null, 12],
      ['User can save filter presets', 'As a user, I want to save filter presets so that I can reapply them quickly', 'Given an active filter, when I save it, then it appears in my saved filters list', 3, 'Medium', 'Backlog', 8, 13],
      ['Admin can view audit logs', 'As an admin, I want audit logs so that I can track all system changes', 'Given admin access, when I view audit logs, then all actions show user, timestamp, and details', 8, 'High', 'In Progress', 7, null],
      ['User can switch to dark mode', 'As a user, I want dark mode so that I can reduce eye strain in low light', 'Given settings page, when I toggle dark mode, then all UI elements switch to dark theme', 3, 'Low', 'Backlog', null, null],
      ['API consumer can view rate limit status', 'As an API consumer, I want to see rate limit status so that I can manage my API usage', 'Given API dashboard, when I view usage, then current limits and usage percentages are displayed', 2, 'Low', 'Backlog', null, 11],
    ];
    for (const s of stories) {
      await client.query(
        `INSERT INTO user_stories (title, description, acceptance_criteria, story_points, priority, status, sprint_id, feature_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        s
      );
    }
    console.log('User stories seeded');

    // Stakeholders
    await client.query('TRUNCATE stakeholders RESTART IDENTITY CASCADE');
    const stakeholders = [
      ['Jennifer Martinez', 'VP of Product', 'Product', 'High', 'High', 'jennifer.martinez@company.com', 'Weekly standup', 'Executive sponsor for the platform initiative'],
      ['Robert Thompson', 'CTO', 'Engineering', 'High', 'High', 'robert.thompson@company.com', 'Bi-weekly review', 'Technical decision maker, focused on scalability'],
      ['Amanda Foster', 'Head of Design', 'Design', 'High', 'High', 'amanda.foster@company.com', 'Daily standup', 'Owns design system and UX standards'],
      ['Michael Chang', 'Engineering Manager', 'Engineering', 'High', 'High', 'michael.chang@company.com', 'Daily standup', 'Manages backend and infrastructure teams'],
      ['Sarah O\'Brien', 'Director of Sales', 'Sales', 'Medium', 'High', 'sarah.obrien@company.com', 'Monthly update', 'Provides enterprise customer feedback and requirements'],
      ['David Nakamura', 'Head of Customer Success', 'Customer Success', 'Medium', 'High', 'david.nakamura@company.com', 'Weekly sync', 'Voice of the customer, tracks satisfaction metrics'],
      ['Lisa Rodriguez', 'CFO', 'Finance', 'High', 'Low', 'lisa.rodriguez@company.com', 'Quarterly review', 'Budget approval and ROI oversight'],
      ['Kevin Walsh', 'Security Lead', 'Engineering', 'Medium', 'Medium', 'kevin.walsh@company.com', 'As needed', 'Reviews security implications of all features'],
      ['Priya Sharma', 'Data Science Lead', 'Data', 'Medium', 'High', 'priya.sharma@company.com', 'Weekly sync', 'Owns ML models and data pipeline strategy'],
      ['Thomas Anderson', 'QA Manager', 'Quality', 'Medium', 'Medium', 'thomas.anderson@company.com', 'Daily standup', 'Testing strategy and release quality gates'],
      ['Emily Watson', 'Head of Marketing', 'Marketing', 'Medium', 'Medium', 'emily.watson@company.com', 'Bi-weekly update', 'Go-to-market strategy and feature messaging'],
      ['James Park', 'DevOps Lead', 'Engineering', 'Low', 'High', 'james.park@company.com', 'Weekly sync', 'Infrastructure, CI/CD, and deployment strategy'],
      ['Rachel Green', 'Legal Counsel', 'Legal', 'Low', 'Low', 'rachel.green@company.com', 'As needed', 'Compliance, privacy, and terms of service'],
      ['Mark Stevens', 'Enterprise Account Manager', 'Sales', 'Low', 'High', 'mark.stevens@company.com', 'Monthly update', 'Represents top 10 enterprise accounts needs'],
      ['Diana Kim', 'Product Designer', 'Design', 'Medium', 'High', 'diana.kim@company.com', 'Daily standup', 'Lead designer for the mobile experience'],
    ];
    for (const s of stakeholders) {
      await client.query(
        `INSERT INTO stakeholders (name, role, department, influence, interest, email, communication_preference, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        s
      );
    }
    console.log('Stakeholders seeded');

    // Market Research
    await client.query('TRUNCATE market_research RESTART IDENTITY CASCADE');
    const research = [
      ['SaaS Project Management Market 2026', 'Comprehensive analysis of the global SaaS project management tools market', '$12.8B', '13.4%', 'AI integration, remote-first features, low-code customization, real-time collaboration', 'Mid-market B2B', 'Gartner Research', 'Completed'],
      ['Enterprise Collaboration Tools Landscape', 'Review of enterprise collaboration tools adoption and satisfaction trends', '$18.2B', '11.7%', 'Async communication, knowledge management, cross-tool integration', 'Enterprise 500+', 'Forrester Wave', 'Completed'],
      ['AI-Powered Productivity Tools', 'Emerging market for AI assistants in professional productivity', '$5.4B', '28.3%', 'Generative AI, workflow automation, predictive analytics, smart suggestions', 'All segments', 'McKinsey Digital', 'In Progress'],
      ['Developer Experience Platform Market', 'Analysis of developer-focused platforms and tooling', '$8.9B', '16.2%', 'API-first design, developer portals, internal tooling, observability', 'Tech companies', 'IDC Worldwide', 'Completed'],
      ['Customer Success Software Trends', 'Market dynamics of customer success and retention platforms', '$2.1B', '22.5%', 'Health scoring, automated playbooks, expansion revenue tracking', 'B2B SaaS', 'CB Insights', 'In Progress'],
      ['No-Code/Low-Code Platform Analysis', 'Assessment of the no-code movement impact on enterprise software', '$21.2B', '25.6%', 'Citizen development, visual builders, pre-built templates', 'SMB to Enterprise', 'Gartner Magic Quadrant', 'Completed'],
      ['Cybersecurity in SaaS Products', 'Security requirements and compliance trends for SaaS products', '$7.3B', '14.8%', 'Zero trust, SOC2 compliance, data residency, encryption standards', 'Regulated industries', 'Deloitte Insights', 'In Progress'],
      ['Mobile-First B2B Applications', 'Adoption patterns of mobile-first strategies in B2B software', '$4.6B', '18.1%', 'Progressive web apps, offline capability, mobile-native experiences', 'Field workers, executives', 'App Annie', 'Planned'],
      ['Product Analytics Market Overview', 'Deep dive into product analytics and behavioral tracking tools', '$3.2B', '21.3%', 'Event-based tracking, cohort analysis, feature adoption metrics', 'Product-led growth', 'G2 Market Report', 'Completed'],
      ['Vertical SaaS Opportunities', 'Analysis of industry-specific SaaS opportunities', '$15.7B', '19.4%', 'Healthcare, fintech, edtech, construction tech', 'Vertical markets', 'Bessemer Cloud Index', 'Planned'],
      ['Remote Work Technology Stack', 'Technology stack evolution for distributed teams', '$6.8B', '15.9%', 'Virtual offices, async video, distributed databases, edge computing', 'Remote-first companies', 'Buffer State of Remote', 'Completed'],
      ['API Economy Growth Report', 'The expanding role of APIs in digital transformation', '$11.4B', '23.7%', 'API monetization, marketplace models, composable architecture', 'Platform businesses', 'ProgrammableWeb', 'In Progress'],
      ['Data Privacy Compliance Market', 'GDPR, CCPA, and emerging privacy regulation impact on SaaS', '$3.8B', '20.1%', 'Consent management, data mapping, privacy by design', 'Global B2B', 'IAPP Survey', 'Completed'],
      ['PLG SaaS Benchmarks 2026', 'Product-led growth benchmarks and best practices', '$9.1B', '17.5%', 'Free-to-paid conversion, time-to-value, viral loops, expansion revenue', 'PLG companies', 'OpenView Partners', 'In Progress'],
      ['Workflow Automation Platforms', 'Integration and automation platform market dynamics', '$13.5B', '24.2%', 'iPaaS, RPA, event-driven architecture, AI orchestration', 'All segments', 'Zapier Industry Report', 'Planned'],
    ];
    for (const r of research) {
      await client.query(
        `INSERT INTO market_research (title, description, market_size, growth_rate, key_trends, target_segment, source, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        r
      );
    }
    console.log('Market research seeded');

    // Competitors
    await client.query('TRUNCATE competitors RESTART IDENTITY CASCADE');
    const competitors = [
      ['ProductBoard', 'Product management platform focused on customer-driven prioritization', 'https://productboard.com', '12%', 'Strong customer feedback integration, intuitive UI, good Jira sync', 'Limited analytics, expensive enterprise tier, slow API', '$20-80/user/mo', 'High'],
      ['Aha!', 'Strategic product roadmapping and portfolio management', 'https://aha.io', '15%', 'Comprehensive roadmapping, strong strategy tools, good reporting', 'Steep learning curve, complex UI, limited integrations', '$59-149/user/mo', 'High'],
      ['Jira Product Discovery', 'Atlassian product for idea management and prioritization', 'https://atlassian.com', '18%', 'Deep Jira integration, large ecosystem, enterprise trust', 'Complex setup, poor standalone experience, Atlassian lock-in', '$10-17/user/mo', 'High'],
      ['Linear', 'Modern issue tracking with focus on speed and developer experience', 'https://linear.app', '8%', 'Best-in-class UX, fast performance, keyboard-first design', 'Limited PM features, no roadmapping, small team focus', '$8-16/user/mo', 'Medium'],
      ['Notion', 'All-in-one workspace used for product management', 'https://notion.so', '10%', 'Flexible, great documentation, large template library', 'Not purpose-built for PM, performance issues at scale', '$8-18/user/mo', 'Medium'],
      ['Asana', 'Work management platform with portfolio and goals features', 'https://asana.com', '9%', 'Strong task management, good goal tracking, wide adoption', 'Limited product-specific features, complex pricing', '$10.99-24.99/user/mo', 'Medium'],
      ['Monday.com', 'Visual work OS with product management templates', 'https://monday.com', '7%', 'Visual interface, automation features, marketplace', 'Generic platform, not PM-specific, data model limitations', '$9-19/user/mo', 'Medium'],
      ['Pendo', 'Product analytics and in-app guidance platform', 'https://pendo.io', '6%', 'Excellent product analytics, in-app guides, NPS', 'Not a full PM tool, expensive, limited planning features', 'Custom pricing', 'Low'],
      ['Amplitude', 'Product analytics for growth and engagement', 'https://amplitude.com', '5%', 'Deep behavioral analytics, experimentation, CDP', 'Analytics-only, no roadmapping or planning', 'Free-$49+/mo', 'Low'],
      ['Shortcut (formerly Clubhouse)', 'Project management for software teams', 'https://shortcut.com', '3%', 'Clean UI, good API, developer-friendly', 'Small market share, limited roadmap features', '$8.50-16/user/mo', 'Low'],
      ['Airfocus', 'Modular product management platform', 'https://airfocus.com', '2%', 'Flexible prioritization, modular approach, good roadmaps', 'Smaller ecosystem, fewer integrations, newer player', '$19-89/user/mo', 'Medium'],
      ['Craft.io', 'End-to-end product management platform', 'https://craft.io', '2%', 'Comprehensive features, capacity planning, OKR tracking', 'Dated UI, smaller community, limited AI features', '$39-99/user/mo', 'Low'],
      ['Productplan', 'Visual roadmapping tool for product teams', 'https://productplan.com', '3%', 'Easy roadmap sharing, clean visualization, quick setup', 'Roadmap-only focus, limited depth, basic analytics', '$39-79/user/mo', 'Low'],
      ['Dragonboat', 'Portfolio product management platform', 'https://dragonboat.io', '1%', 'Portfolio view, outcome-driven, good enterprise features', 'Complex, smaller user base, steep learning curve', 'Custom pricing', 'Low'],
      ['Zeda.io', 'AI-powered product discovery and strategy platform', 'https://zeda.io', '1%', 'AI insights, customer feedback analysis, emerging features', 'Very new, limited track record, small team', '$49-199/user/mo', 'Medium'],
    ];
    for (const c of competitors) {
      await client.query(
        `INSERT INTO competitors (name, description, website, market_share, strengths, weaknesses, pricing, threat_level) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        c
      );
    }
    console.log('Competitors seeded');

    // Product Metrics
    await client.query('TRUNCATE product_metrics RESTART IDENTITY CASCADE');
    const metrics = [
      ['Monthly Active Users', 'Unique users active in the last 30 days', '24,500', '30,000', 'users', 'Growth', 'up', '2026-03-15'],
      ['Daily Active Users', 'Unique users active in the last 24 hours', '8,200', '12,000', 'users', 'Growth', 'up', '2026-03-15'],
      ['Customer Churn Rate', 'Percentage of customers lost per month', '2.8%', '2.0%', 'percent', 'Retention', 'down', '2026-03-01'],
      ['Net Promoter Score', 'Customer satisfaction and loyalty metric', '42', '50', 'score', 'Satisfaction', 'up', '2026-02-28'],
      ['Average Session Duration', 'Mean time spent per user session', '12.3', '15.0', 'minutes', 'Engagement', 'up', '2026-03-15'],
      ['Feature Adoption Rate', 'Percentage of users adopting new features within 30 days', '34%', '45%', 'percent', 'Engagement', 'stable', '2026-03-10'],
      ['Time to First Value', 'Average time for new users to reach aha moment', '4.2', '3.0', 'days', 'Onboarding', 'down', '2026-03-01'],
      ['API Uptime', 'Percentage availability of API services', '99.95%', '99.99%', 'percent', 'Reliability', 'stable', '2026-03-15'],
      ['Average Response Time', 'Mean API response latency', '145', '100', 'ms', 'Performance', 'down', '2026-03-15'],
      ['Support Ticket Resolution Time', 'Average time to resolve customer support tickets', '4.8', '3.0', 'hours', 'Support', 'down', '2026-03-10'],
      ['Monthly Recurring Revenue', 'Total MRR from subscriptions', '$485,000', '$600,000', 'USD', 'Revenue', 'up', '2026-03-01'],
      ['Customer Acquisition Cost', 'Average cost to acquire a new customer', '$320', '$250', 'USD', 'Revenue', 'down', '2026-02-28'],
      ['Free-to-Paid Conversion', 'Percentage of free users converting to paid', '4.2%', '6.0%', 'percent', 'Revenue', 'up', '2026-03-01'],
      ['Page Load Time (P95)', '95th percentile page load time', '2.8', '2.0', 'seconds', 'Performance', 'down', '2026-03-15'],
      ['Error Rate', 'Percentage of requests resulting in errors', '0.12%', '0.05%', 'percent', 'Reliability', 'down', '2026-03-15'],
      ['Weekly Active Teams', 'Number of teams with weekly engagement', '1,850', '2,500', 'teams', 'Growth', 'up', '2026-03-15'],
    ];
    for (const m of metrics) {
      await client.query(
        `INSERT INTO product_metrics (name, description, current_value, target_value, unit, category, trend, last_updated) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        m
      );
    }
    console.log('Product metrics seeded');

    // Customer Feedback
    await client.query('TRUNCATE customer_feedback RESTART IDENTITY CASCADE');
    const feedback = [
      ['In-app survey', 'TechCorp Inc.', 'The search functionality is much improved but still lacks filtering by date range. Would love to see this added.', 'positive', 'Search', 'Medium', 'Open', 'Date range filter for search results'],
      ['Support ticket', 'StartupXYZ', 'Cannot export reports to PDF format. This is critical for our board meetings and executive reviews.', 'negative', 'Reporting', 'High', 'In Review', 'PDF export for reports'],
      ['NPS survey', 'Global Systems Ltd', 'Absolutely love the new dashboard! The drag-and-drop feature is intuitive and saves us hours every week.', 'positive', 'Dashboard', 'Low', 'Closed', null],
      ['Feature request', 'DataFlow Analytics', 'We need Slack integration for notifications. Our team lives in Slack and email notifications get lost.', 'neutral', 'Integrations', 'High', 'Open', 'Slack notification integration'],
      ['Customer call', 'Enterprise Solutions Co', 'The onboarding process was confusing. Took our team 3 weeks to fully set up. Need better documentation and guided setup.', 'negative', 'Onboarding', 'High', 'In Progress', 'Improved onboarding wizard'],
      ['App Store review', 'Mobile User', 'Mobile app crashes frequently when switching between projects. Please fix stability issues.', 'negative', 'Mobile', 'Critical', 'In Progress', 'Mobile app stability fix'],
      ['Social media', 'DevTools Pro', 'Just discovered the API - it is well-documented and easy to integrate. Great developer experience!', 'positive', 'API', 'Low', 'Closed', null],
      ['Support ticket', 'FinanceHub', 'SSO login fails intermittently during peak hours. This affects 200+ users in our organization.', 'negative', 'Authentication', 'Critical', 'In Progress', 'SSO reliability improvement'],
      ['In-app survey', 'Creative Agency', 'The collaboration features are good but we need real-time editing. Currently changes overwrite each other.', 'neutral', 'Collaboration', 'High', 'Open', 'Real-time collaborative editing'],
      ['Customer call', 'HealthTech Solutions', 'We need HIPAA compliance documentation and audit logs. Without this we cannot recommend to healthcare clients.', 'neutral', 'Compliance', 'High', 'In Review', 'HIPAA compliance and audit logs'],
      ['NPS survey', 'RetailMax', 'Product is good overall but the pricing feels steep for small teams. Consider a startup-friendly tier.', 'neutral', 'Pricing', 'Medium', 'Open', 'Startup pricing tier'],
      ['Feature request', 'AI Dynamics', 'Would be great to have AI-powered insights on our product metrics. Auto-detect anomalies and trends.', 'positive', 'Analytics', 'Medium', 'Open', 'AI-powered metric insights'],
      ['Support ticket', 'LogiChain', 'Bulk import fails for files over 10MB. We have datasets with 50k+ rows that need importing.', 'negative', 'Data', 'High', 'In Review', 'Large file bulk import support'],
      ['In-app survey', 'EduTech Partners', 'Dark mode would be very appreciated. Working late nights with bright screens is straining.', 'neutral', 'UX', 'Low', 'Open', 'Dark mode theme'],
      ['Customer call', 'CloudScale Inc', 'Your API rate limits are too restrictive for our use case. We need higher limits or a dedicated tier.', 'negative', 'API', 'High', 'In Review', 'Higher API rate limits'],
      ['App Store review', 'Productivity Fan', 'Love the Kanban view! It has replaced three other tools for our team. The keyboard shortcuts are a nice touch.', 'positive', 'Productivity', 'Low', 'Closed', null],
    ];
    for (const f of feedback) {
      await client.query(
        `INSERT INTO customer_feedback (source, customer_name, feedback_text, sentiment, category, priority, status, feature_request) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        f
      );
    }
    console.log('Customer feedback seeded');

    // Releases
    await client.query('TRUNCATE releases RESTART IDENTITY CASCADE');
    const releases = [
      ['1.0.0', 'Genesis', 'Initial public release with core product management features', 'Released', '2025-06-15', 12, 0, 'First GA release. Includes roadmapping, feature tracking, and basic analytics.'],
      ['1.1.0', 'Discovery', 'Enhanced search and discovery capabilities', 'Released', '2025-07-30', 8, 15, 'Improved search relevance by 40%. Added saved searches and recent history.'],
      ['1.2.0', 'Fortify', 'Security hardening and authentication improvements', 'Released', '2025-09-10', 6, 22, '2FA support, session management, and security audit fixes.'],
      ['1.3.0', 'Insight', 'Analytics dashboard and reporting features', 'Released', '2025-10-25', 10, 18, 'Custom dashboards, scheduled reports, and export functionality.'],
      ['1.4.0', 'Connect', 'Integration framework and webhook system', 'Released', '2025-12-05', 7, 12, 'Webhook support, Slack integration, and API v2 improvements.'],
      ['1.5.0', 'Velocity', 'Performance optimization release', 'Released', '2026-01-20', 4, 35, 'Page load improvements of 40%, database query optimization, CDN rollout.'],
      ['2.0.0', 'Nova', 'Major release with AI-powered features and new mobile app', 'In Development', '2026-03-30', 15, 8, 'AI search, AI copilot, mobile redesign, and collaboration features.'],
      ['2.1.0', 'Shield', 'Enterprise security and compliance release', 'Planned', '2026-05-15', 9, 5, 'SAML SSO, audit logging, SOC2 compliance, and RBAC enhancements.'],
      ['2.2.0', 'Flow', 'Workflow automation and productivity release', 'Planned', '2026-07-01', 11, 0, 'No-code workflow builder, automation rules, and smart notifications.'],
      ['2.3.0', 'Horizon', 'API V3 and platform expansion', 'Planned', '2026-08-15', 8, 0, 'GraphQL support, improved REST API, and developer portal.'],
      ['2.4.0', 'Bridge', 'Integration marketplace launch', 'Planned', '2026-10-01', 12, 0, 'Third-party integration marketplace with 50+ connectors.'],
      ['2.5.0', 'Mosaic', 'Internationalization and accessibility release', 'Planned', '2026-11-15', 6, 10, 'WCAG 2.1 AA compliance, 12 new languages, RTL support.'],
      ['3.0.0', 'Quantum', 'Next-generation platform with advanced AI', 'Planned', '2027-02-01', 20, 0, 'Advanced AI copilot, predictive analytics, and platform redesign.'],
      ['1.4.1', 'Connect Patch', 'Critical bug fix for webhook reliability', 'Released', '2025-12-12', 0, 5, 'Fixed webhook delivery failures and added retry mechanism.'],
      ['1.5.1', 'Velocity Patch', 'Hot fix for database connection pooling', 'Released', '2026-01-28', 0, 3, 'Resolved connection pool exhaustion under high load.'],
    ];
    for (const r of releases) {
      await client.query(
        `INSERT INTO releases (version, name, description, status, release_date, features_count, bug_fixes_count, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        r
      );
    }
    console.log('Releases seeded');

    // A/B Tests
    await client.query('TRUNCATE ab_tests RESTART IDENTITY CASCADE');
    const abtests = [
      ['Onboarding Flow Simplification', 'Reducing onboarding steps from 7 to 4 will increase completion rate by 20%', 'Original 7-step onboarding wizard', 'Simplified 4-step onboarding with progressive disclosure', 'Onboarding completion rate', 'Completed', '2026-01-15', '2026-02-15', 'Variant B', 'Variant B: 78% completion vs Variant A: 61%. 28% improvement.'],
      ['CTA Button Color Test', 'Changing the primary CTA from blue to green will increase click-through rate', 'Blue CTA button (#2563EB)', 'Green CTA button (#16A34A)', 'Click-through rate', 'Completed', '2026-01-20', '2026-02-03', 'Variant A', 'No significant difference. Blue: 3.2%, Green: 3.1%. Keep original.'],
      ['Pricing Page Layout', 'Horizontal pricing cards will convert better than vertical stack', 'Vertical stacked pricing cards', 'Horizontal side-by-side pricing cards', 'Free-to-paid conversion', 'Running', '2026-03-01', '2026-03-31', null, 'Preliminary: Variant B leading by 8% (not yet significant)'],
      ['Search Results Ranking', 'ML-ranked results will improve search satisfaction vs keyword match', 'Keyword-based search ranking', 'ML-powered relevance ranking', 'Search result click-through rate', 'Completed', '2026-02-01', '2026-03-01', 'Variant B', 'ML ranking: 45% CTR vs keyword: 32% CTR. Shipping ML ranking.'],
      ['Dashboard Default View', 'Starting with a pre-configured dashboard will improve activation', 'Empty dashboard with setup prompt', 'Pre-configured template dashboard', 'Day-7 retention rate', 'Running', '2026-03-05', '2026-04-05', null, 'Early signal: Template dashboard showing 12% better retention'],
      ['Email Notification Frequency', 'Daily digest will reduce unsubscribes compared to individual notifications', 'Individual email per event', 'Daily digest summary email', 'Email unsubscribe rate', 'Completed', '2025-12-01', '2026-01-01', 'Variant B', 'Daily digest: 1.2% unsub vs individual: 4.5% unsub. Major improvement.'],
      ['Mobile Navigation Pattern', 'Bottom tab navigation will increase engagement vs hamburger menu', 'Hamburger menu navigation', 'Bottom tab bar navigation', 'Pages per session (mobile)', 'Running', '2026-03-10', '2026-04-10', null, 'Not enough data yet. Need 2 more weeks.'],
      ['Trial Length Optimization', '21-day trial will convert better than 14-day trial', '14-day free trial', '21-day free trial', 'Trial-to-paid conversion rate', 'Completed', '2025-11-01', '2025-12-31', 'Variant B', '21-day: 12.5% conversion vs 14-day: 9.8%. Extending trial period.'],
      ['Feature Discovery Tooltip', 'Contextual tooltips will increase feature adoption', 'No feature discovery hints', 'Contextual tooltip hints on hover', 'Feature adoption rate', 'Planned', '2026-04-01', '2026-05-01', null, null],
      ['Checkout Flow Steps', 'Single-page checkout will reduce cart abandonment', 'Multi-step checkout (3 pages)', 'Single-page checkout', 'Checkout completion rate', 'Planned', '2026-04-15', '2026-05-15', null, null],
      ['Social Proof on Landing Page', 'Showing customer logos will increase sign-up rate', 'Landing page without social proof', 'Landing page with customer logos and testimonials', 'Sign-up conversion rate', 'Completed', '2026-01-10', '2026-02-10', 'Variant B', 'Social proof: 5.8% conversion vs control: 4.1%. Significant at p<0.01.'],
      ['In-App Help Format', 'Video tutorials will be more effective than text documentation', 'Text-based help articles', 'Short video tutorials (2-3 min)', 'Help article completion rate', 'Running', '2026-03-01', '2026-03-31', null, 'Video: 72% completion vs text: 58%. Trending toward significance.'],
      ['Upgrade Prompt Timing', 'Showing upgrade prompt after value moment vs after 7 days', 'Upgrade prompt on day 7', 'Upgrade prompt after first value milestone', 'Upgrade click rate', 'Planned', '2026-04-01', '2026-05-01', null, null],
      ['Report Sharing Format', 'Interactive shared reports will drive more engagement than PDF', 'Shared PDF reports', 'Interactive web-based shared reports', 'Report view duration', 'Planned', '2026-05-01', '2026-06-01', null, null],
      ['Empty State Design', 'Illustrated empty states will encourage first actions', 'Plain text empty state messages', 'Illustrated empty states with action buttons', 'First action completion rate', 'Completed', '2026-02-01', '2026-03-01', 'Variant B', 'Illustrated: 65% first action vs plain: 48%. Rolling out illustrations.'],
    ];
    for (const t of abtests) {
      await client.query(
        `INSERT INTO ab_tests (name, hypothesis, variant_a, variant_b, metric, status, start_date, end_date, winner, results) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        t
      );
    }
    console.log('A/B tests seeded');

    // Requirements
    await client.query('TRUNCATE requirements RESTART IDENTITY CASCADE');
    const requirements = [
      ['System shall support SAML 2.0 SSO', 'The system must integrate with SAML 2.0 identity providers for enterprise single sign-on authentication', 'Functional', 'Critical', 'Approved', 'SSO login redirects to IdP, authenticates, and returns with valid session', 'Robert Thompson', 'Enterprise customers'],
      ['API response time under 200ms', 'All API endpoints must respond within 200ms at the 95th percentile under normal load', 'Non-Functional', 'High', 'Approved', 'P95 latency < 200ms with 1000 concurrent users', 'Michael Chang', 'Performance audit'],
      ['Support WCAG 2.1 AA compliance', 'All user-facing interfaces must meet WCAG 2.1 AA accessibility standards', 'Non-Functional', 'High', 'In Progress', 'Pass automated accessibility scan with zero critical violations', 'Amanda Foster', 'Compliance requirement'],
      ['Real-time collaborative editing', 'Multiple users can edit the same document simultaneously with conflict resolution', 'Functional', 'High', 'Draft', 'Two users editing same doc see changes within 500ms without data loss', 'Alex Kim', 'Customer feedback'],
      ['Data export in CSV, JSON, PDF', 'Users can export any data view in CSV, JSON, or PDF format', 'Functional', 'Medium', 'Approved', 'Export completes within 30s for up to 100k records in selected format', 'Lisa Wang', 'Customer request'],
      ['Role-based access control with custom roles', 'Admins can create custom roles with granular permissions for features and data', 'Functional', 'Critical', 'Approved', 'Custom role created, assigned to user, permissions enforced across all endpoints', 'Maria Garcia', 'Enterprise requirement'],
      ['System uptime 99.99%', 'The system must maintain 99.99% uptime measured monthly', 'Non-Functional', 'Critical', 'Approved', 'Monthly uptime >= 99.99% excluding planned maintenance windows', 'James Park', 'SLA requirement'],
      ['Webhook delivery with retry', 'Webhooks must be delivered reliably with automatic retry on failure', 'Functional', 'Medium', 'Approved', 'Failed webhooks retry 3 times with exponential backoff, delivery logged', 'Mike Johnson', 'Integration partners'],
      ['Full-text search with relevance ranking', 'Search must support full-text queries with ML-based relevance ranking', 'Functional', 'High', 'In Progress', 'Search returns relevant results within 500ms, top result is relevant 90% of time', 'Sarah Chen', 'Product strategy'],
      ['Audit log for all data mutations', 'Every create, update, and delete operation must be logged with user and timestamp', 'Functional', 'High', 'Approved', 'Audit log entry exists for every mutation with user_id, action, timestamp, diff', 'Kevin Walsh', 'SOC2 compliance'],
      ['Support 10,000 concurrent users', 'The system must handle 10,000 concurrent active users without degradation', 'Non-Functional', 'High', 'Draft', 'Load test with 10k virtual users shows < 5% error rate and < 500ms P95', 'Michael Chang', 'Scale projection'],
      ['Mobile offline data sync', 'Mobile app must cache data locally and sync when connectivity is restored', 'Functional', 'Medium', 'Draft', 'Offline changes queued and synced within 30s of reconnection without conflicts', 'James Wilson', 'Mobile users'],
      ['GDPR data deletion compliance', 'Users can request complete deletion of their data within 72 hours', 'Non-Functional', 'Critical', 'Approved', 'Data deletion request processed within 72h, all PII removed from all systems', 'Rachel Green', 'Legal requirement'],
      ['In-app notification center', 'Centralized notification center with categorization and mark-as-read', 'Functional', 'Medium', 'Approved', 'Notifications grouped by type, sortable, with bulk mark-as-read capability', 'Kevin Liu', 'UX improvement'],
      ['Two-factor authentication support', 'Users can enable TOTP-based two-factor authentication for their accounts', 'Functional', 'High', 'Completed', 'TOTP setup with QR code, backup codes generated, 2FA enforced on login', 'Maria Garcia', 'Security audit'],
      ['Custom branding for enterprise', 'Enterprise customers can customize logo, colors, and domain', 'Functional', 'Low', 'Planned', 'Custom branding applied across all UI elements and email communications', 'Emily Watson', 'Enterprise sales'],
    ];
    for (const r of requirements) {
      await client.query(
        `INSERT INTO requirements (title, description, type, priority, status, acceptance_criteria, stakeholder, source) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        r
      );
    }
    console.log('Requirements seeded');

    // Risks
    await client.query('TRUNCATE risks RESTART IDENTITY CASCADE');
    const risks = [
      ['Data breach exposure', 'Unauthorized access to customer data through API vulnerability or insider threat', 'Low', 'Critical', 9.0, 'Regular penetration testing, encryption at rest and in transit, access logging', 'Kevin Walsh', 'Active', 'Security'],
      ['Key engineer departure', 'Loss of critical knowledge if senior engineers leave during major release', 'Medium', 'High', 7.5, 'Knowledge documentation, cross-training, competitive compensation review', 'Michael Chang', 'Active', 'Resource'],
      ['Competitor launches AI features', 'Major competitor releases AI-powered PM features before our Q1 release', 'High', 'Medium', 6.0, 'Accelerate AI feature development, differentiate on integration depth', 'Jennifer Martinez', 'Active', 'Market'],
      ['Database scaling limitations', 'PostgreSQL single-node hitting performance limits at projected growth rate', 'Medium', 'High', 7.0, 'Implement read replicas, evaluate distributed database options, query optimization', 'James Park', 'Monitoring', 'Technical'],
      ['Third-party API deprecation', 'Critical dependency on third-party APIs that may be deprecated or change terms', 'Medium', 'Medium', 5.0, 'Abstract integrations, maintain fallback options, monitor API changelogs', 'Mike Johnson', 'Active', 'Technical'],
      ['Scope creep on v2.0 release', 'Feature requests expanding v2.0 scope beyond capacity', 'High', 'High', 8.0, 'Strict change management process, MVP definition, stakeholder alignment', 'Jennifer Martinez', 'Active', 'Schedule'],
      ['GDPR compliance gaps', 'Incomplete data handling procedures may violate GDPR requirements', 'Low', 'Critical', 8.5, 'Privacy audit, data mapping exercise, DPO review, consent management', 'Rachel Green', 'Mitigated', 'Compliance'],
      ['Cloud provider outage', 'Extended AWS outage affecting service availability', 'Low', 'High', 5.5, 'Multi-AZ deployment, disaster recovery plan, status page communication plan', 'James Park', 'Active', 'Technical'],
      ['Mobile app store rejection', 'App update rejected by Apple or Google due to policy changes', 'Medium', 'Medium', 5.0, 'Stay current on store policies, pre-submission review, alternative distribution', 'James Wilson', 'Monitoring', 'Technical'],
      ['Budget overrun on infrastructure', 'Cloud costs exceeding projections due to growth or inefficiency', 'Medium', 'Medium', 5.5, 'Cost monitoring alerts, reserved instances, architecture optimization', 'Lisa Rodriguez', 'Active', 'Resource'],
      ['Customer data migration failure', 'Enterprise customer onboarding blocked by data migration issues', 'Medium', 'High', 6.5, 'Migration testing framework, rollback procedures, dedicated support', 'David Nakamura', 'Active', 'Technical'],
      ['Regulatory changes', 'New privacy or AI regulations impacting product features or data handling', 'Medium', 'High', 6.0, 'Regulatory monitoring, flexible architecture, legal advisory retainer', 'Rachel Green', 'Monitoring', 'External'],
      ['Open source dependency vulnerability', 'Critical CVE discovered in a key open source dependency', 'High', 'Medium', 6.0, 'Dependabot alerts, regular dependency updates, SCA tooling', 'Kevin Walsh', 'Active', 'Security'],
      ['Integration partner discontinuation', 'Key integration partner shutting down or being acquired', 'Low', 'Medium', 3.5, 'Diversify integration partners, maintain direct API access alternatives', 'Mike Johnson', 'Monitoring', 'Market'],
      ['Team burnout before launch', 'Extended crunch period leading to reduced quality and turnover', 'Medium', 'High', 7.0, 'Sustainable pace enforcement, workload monitoring, flex time policy', 'Michael Chang', 'Active', 'Resource'],
    ];
    for (const r of risks) {
      await client.query(
        `INSERT INTO risks (title, description, probability, impact, risk_score, mitigation, owner, status, category) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        r
      );
    }
    console.log('Risks seeded');

    // Team Capacity
    await client.query('TRUNCATE team_capacity RESTART IDENTITY CASCADE');
    const capacity = [
      ['Sarah Chen', 'Senior Frontend Engineer', 100, 7, 32, 'React, TypeScript, GraphQL, CSS', 'High', 'Leading AI search UI implementation'],
      ['James Wilson', 'Mobile Developer', 100, 7, 36, 'React Native, Swift, Kotlin', 'Overloaded', 'Mobile redesign primary developer'],
      ['Maria Garcia', 'Security Engineer', 80, 7, 28, 'OAuth, SAML, Cryptography, Pen Testing', 'Medium', 'On-call rotation reduces availability'],
      ['Alex Kim', 'Full Stack Developer', 100, 7, 34, 'Node.js, React, PostgreSQL, Redis', 'High', 'Working on real-time collaboration POC'],
      ['David Park', 'Data Engineer', 100, 7, 30, 'Python, SQL, Apache Spark, Airflow', 'Medium', 'Building analytics pipeline'],
      ['Rachel Lee', 'Backend Engineer', 100, 7, 36, 'Node.js, Go, gRPC, PostgreSQL', 'High', 'API V3 design and implementation'],
      ['Tom Brown', 'Senior Backend Engineer', 60, 7, 20, 'Python, Node.js, AWS, Terraform', 'Low', 'Partially allocated to DevOps tasks'],
      ['Lisa Wang', 'QA Engineer', 100, 7, 32, 'Selenium, Cypress, Jest, Performance Testing', 'Medium', 'Test automation for mobile and web'],
      ['Nina Patel', 'UX Designer', 100, 7, 30, 'Figma, User Research, Prototyping, A11y', 'High', 'Accessibility compliance lead'],
      ['Kevin Liu', 'Frontend Developer', 100, 7, 34, 'React, Vue, Storybook, Web Components', 'Medium', 'Notification center redesign'],
      ['Mike Johnson', 'Platform Engineer', 80, 7, 28, 'AWS, Docker, Kubernetes, CI/CD', 'Medium', 'Webhook system and infrastructure'],
      ['Sophie Turner', 'Data Scientist', 100, 7, 30, 'Python, TensorFlow, SQL, Statistics', 'Medium', 'ML models for search ranking and health scoring'],
      ['Ryan Chen', 'Performance Engineer', 100, 7, 32, 'Profiling, Load Testing, CDN, Caching', 'Low', 'Performance optimization sprint completed'],
      ['Emma Scott', 'Technical Writer', 100, 7, 24, 'Documentation, API Docs, Markdown, Swagger', 'Medium', 'API V3 documentation and i18n planning'],
      ['Chris Davis', 'Backend Developer', 100, 7, 36, 'Node.js, PostgreSQL, Elasticsearch, Redis', 'High', 'Audit logging and compliance features'],
    ];
    for (const c of capacity) {
      await client.query(
        `INSERT INTO team_capacity (member_name, role, availability_percent, sprint_id, allocated_hours, skills, current_load, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        c
      );
    }
    console.log('Team capacity seeded');

    // OKRs
    await client.query('TRUNCATE okrs RESTART IDENTITY CASCADE');
    const okrs = [
      ['Increase user engagement and retention', 'Achieve 30,000 monthly active users', 65, 'Jennifer Martinez', 'Q1 2026', 'On Track', 'Growth', '30000', '24500'],
      ['Increase user engagement and retention', 'Reduce monthly churn rate to below 2%', 40, 'David Nakamura', 'Q1 2026', 'At Risk', 'Retention', '2.0', '2.8'],
      ['Increase user engagement and retention', 'Increase average session duration to 15 minutes', 70, 'Amanda Foster', 'Q1 2026', 'On Track', 'Engagement', '15', '12.3'],
      ['Deliver AI-powered product experience', 'Launch AI search with 90% relevance accuracy', 75, 'Sarah Chen', 'Q1 2026', 'On Track', 'Product', '90', '82'],
      ['Deliver AI-powered product experience', 'Deploy AI copilot features to 50% of users', 30, 'Priya Sharma', 'Q1 2026', 'At Risk', 'Product', '50', '15'],
      ['Deliver AI-powered product experience', 'Achieve 40% adoption rate for AI features', 20, 'Jennifer Martinez', 'Q1 2026', 'Behind', 'Adoption', '40', '12'],
      ['Improve platform reliability and performance', 'Achieve 99.99% uptime SLA', 85, 'James Park', 'Q1 2026', 'On Track', 'Reliability', '99.99', '99.95'],
      ['Improve platform reliability and performance', 'Reduce P95 API latency to under 100ms', 60, 'Ryan Chen', 'Q1 2026', 'On Track', 'Performance', '100', '145'],
      ['Improve platform reliability and performance', 'Zero critical security vulnerabilities', 90, 'Kevin Walsh', 'Q1 2026', 'On Track', 'Security', '0', '0'],
      ['Grow revenue and expand market', 'Reach $600K monthly recurring revenue', 55, 'Sarah O\'Brien', 'Q1 2026', 'On Track', 'Revenue', '600000', '485000'],
      ['Grow revenue and expand market', 'Increase free-to-paid conversion to 6%', 45, 'Emily Watson', 'Q1 2026', 'At Risk', 'Revenue', '6.0', '4.2'],
      ['Grow revenue and expand market', 'Close 5 enterprise deals over $50K ARR', 40, 'Mark Stevens', 'Q1 2026', 'On Track', 'Revenue', '5', '2'],
      ['Build world-class product team', 'Hire 3 senior engineers by end of quarter', 66, 'Michael Chang', 'Q1 2026', 'On Track', 'Team', '3', '2'],
      ['Build world-class product team', 'Achieve team satisfaction score above 8/10', 80, 'Michael Chang', 'Q1 2026', 'On Track', 'Culture', '8', '7.8'],
      ['Build world-class product team', 'Complete 100% of planned training programs', 50, 'Michael Chang', 'Q1 2026', 'On Track', 'Development', '100', '50'],
      ['Establish enterprise readiness', 'Complete SOC2 Type II certification', 35, 'Kevin Walsh', 'Q2 2026', 'On Track', 'Compliance', '100', '35'],
    ];
    for (const o of okrs) {
      await client.query(
        `INSERT INTO okrs (objective, key_result, progress, owner, quarter, status, category, target_value, current_value) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        o
      );
    }
    console.log('OKRs seeded');

    console.log('\nSeed completed successfully!');
  } catch (err) {
    console.error('Seed error:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
