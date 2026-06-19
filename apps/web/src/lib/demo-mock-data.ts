export interface MockUrl {
  id: string;
  url: string;
  label: string;
  competitorName: string;
  category: string;
  status: string;
  checkFrequency: string;
  lastCheckedAt: string;
  lastChangedAt: string;
  analysisText?: string;
  analysisStatus: string;
}

export interface MockChange {
  id: string;
  urlId: string;
  competitorName: string;
  pageLabel: string;
  changePercent: number;
  impactLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  impactScore: number;
  createdAt: string;
  aiStatus: string;
  aiSummary: string;
  aiKeyChanges: string[];
  aiBusinessImpact: string;
  aiRecommendation: string;
  beforeContent: string;
  afterContent: string;
}

export const MOCK_URLS: MockUrl[] = [
  {
    id: 'url-alpha-pricing',
    url: 'https://alphacloud.io/pricing',
    label: 'Pricing Page',
    competitorName: 'Alpha Cloud',
    category: 'PRICING',
    status: 'ACTIVE',
    checkFrequency: 'ONE_HOUR',
    lastCheckedAt: '10 minutes ago',
    lastChangedAt: '2 hours ago',
    analysisStatus: 'DONE',
    analysisText: 'Alpha Cloud is a major competitor specializing in distributed hosting. Their current pricing targets developers and enterprise teams, with frequent tests on limits and entry tiers.',
  },
  {
    id: 'url-beta-features',
    url: 'https://betaflow.com/features',
    label: 'Features List',
    competitorName: 'BetaFlow Automation',
    category: 'FEATURES',
    status: 'ACTIVE',
    checkFrequency: 'SIX_HOURS',
    lastCheckedAt: '1 hour ago',
    lastChangedAt: '1 day ago',
    analysisStatus: 'DONE',
    analysisText: 'BetaFlow specializes in workflow automation. Their feature page showcases built-in integrations, syncing frequencies, and support channels.',
  },
  {
    id: 'url-gamma-home',
    url: 'https://gammasec.com/homepage',
    label: 'Landing Page',
    competitorName: 'Gamma Security',
    category: 'LANDING',
    status: 'ACTIVE',
    checkFrequency: 'DAILY',
    lastCheckedAt: '4 hours ago',
    lastChangedAt: '3 days ago',
    analysisStatus: 'DONE',
    analysisText: 'Gamma Security focuses on enterprise compliance. Their homepage contains key security certification highlights and zero-trust sales copy.',
  },
];

export const MOCK_CHANGES: MockChange[] = [
  {
    id: 'change-alpha-pricing-1',
    urlId: 'url-alpha-pricing',
    competitorName: 'Alpha Cloud',
    pageLabel: 'Pricing Page',
    changePercent: 18.5,
    impactLevel: 'HIGH',
    impactScore: 88,
    createdAt: '2 hours ago',
    aiStatus: 'DONE',
    aiSummary: 'Alpha Cloud has discontinued their entry-level Starter Plan ($29/month) and introduced a new Creator Plan priced at $39/month. Along with the $10 price hike, the high-speed storage limit was reduced from 100GB to 50GB.',
    aiKeyChanges: [
      'Discontinued $29/mo Starter Plan',
      'Introduced $39/mo Creator Plan',
      'Reduced Starter tier storage limit from 100GB to 50GB',
      'Added Enterprise Add-ons option to contact sales',
    ],
    aiBusinessImpact: 'Direct opportunity to capture budget-sensitive users. Since Alpha Cloud raised their entry pricing by 34% while lowering storage limits, we can run targeted comparison campaigns highlighting OutScout\'s stable rates.',
    aiRecommendation: 'Launch a social media ad campaign highlighting our $29/mo plan benefits compared to Alpha Cloud\'s new limits.',
    beforeContent: `Alpha Cloud Hosting Plans
Starter Plan — $29/month
- 100GB High-speed Storage
- 10 Active Projects
- 24/7 Support
Professional Plan — $99/month
- Unlimited Storage
- 50 Projects
- Dedicated Support`,
    afterContent: `Alpha Cloud Hosting Plans
Creator Plan — $39/month
- 50GB High-speed Storage
- 10 Active Projects
- Standard Email Support
Professional Plan — $99/month
- Unlimited Storage
- 50 Projects
- Dedicated Support
Enterprise Add-ons
- Contact sales for customized SSO & SAML configs`,
  },
  {
    id: 'change-beta-features-1',
    urlId: 'url-beta-features',
    competitorName: 'BetaFlow Automation',
    pageLabel: 'Features List',
    changePercent: 8.2,
    impactLevel: 'MEDIUM',
    impactScore: 62,
    createdAt: '1 day ago',
    aiStatus: 'DONE',
    aiSummary: 'BetaFlow has released a native Slack notification integration and added a new "Export to CSV" utility directly within their standard feature list.',
    aiKeyChanges: [
      'Launched native Slack integration',
      'Added CSV export functionality to dashboards',
      'Upgraded Basic support to Standard email support',
    ],
    aiBusinessImpact: 'BetaFlow matches our integration offering. However, they lack custom webhook configurations which we include in our core features.',
    aiRecommendation: 'Update our product landing page to emphasize our multi-webhook automation and custom JSON payloads.',
    beforeContent: `BetaFlow Automation Features
- 10 Active Workflows
- E-Mail Alerts
- Basic Dashboard & Reports
- Sync Frequencies: Daily`,
    afterContent: `BetaFlow Automation Features
- 10 Active Workflows
- E-Mail & Slack Alerts [NEW]
- Basic Dashboard & CSV Exports [NEW]
- Sync Frequencies: Daily & Six-hour intervals`,
  },
  {
    id: 'change-gamma-home-1',
    urlId: 'url-gamma-home',
    competitorName: 'Gamma Security',
    pageLabel: 'Landing Page',
    changePercent: 4.8,
    impactLevel: 'LOW',
    impactScore: 35,
    createdAt: '3 days ago',
    aiStatus: 'DONE',
    aiSummary: 'Gamma Security added a SOC2 compliance badge to their homepage footer and updated text to mention their Zero-Trust access model.',
    aiKeyChanges: [
      'Added SOC2 Type II compliance badge',
      'Updated hero subtext with Zero-Trust network copy',
    ],
    aiBusinessImpact: 'Slightly strengthens their enterprise positioning, though no immediate product changes were launched.',
    aiRecommendation: 'Monitor their enterprise pricing routes for any upcoming premium tier increases.',
    beforeContent: `Gamma Security
Next-Gen compliance monitoring for modern companies.
Our software ensures your remote staff remains secure.`,
    afterContent: `Gamma Security
Next-Gen compliance monitoring for modern companies.
Our software ensures your remote staff remains secure with Zero-Trust access.
[SOC2 Type II Certified]`,
  },
];

export const MOCK_STATS = {
  totalUrls: 3,
  activeUrls: 3,
  totalChanges30d: 14,
  highImpact30d: 3,
};
