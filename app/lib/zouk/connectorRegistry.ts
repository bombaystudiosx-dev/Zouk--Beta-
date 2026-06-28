export type AuthType = 'oauth' | 'apikey' | 'token';
export type ConnectorStatus = 'connected' | 'disconnected' | 'error' | 'pending';

export interface Connector {
  id: string;
  name: string;
  icon: string;
  description: string;
  authType: AuthType;
  docsUrl?: string;
  category: 'hosting' | 'database' | 'ai' | 'auth' | 'infra' | 'email';

  /** If true, this connector has a real verify endpoint at /api/connector/verify */
  verifiable?: boolean;

  /** Beta note shown in the setup modal instead of OAuth flow */
  betaNote?: string;
}

export const CONNECTOR_REGISTRY: Connector[] = [
  {
    id: 'github',
    name: 'GitHub',
    icon: '🐙',
    description: 'Source control and CI/CD pipelines.',

    // PAT-based for beta — real GitHub App OAuth is a future backend pass
    authType: 'token',
    docsUrl: 'https://docs.github.com',
    category: 'infra',
    verifiable: true,
  },
  {
    id: 'vercel',
    name: 'Vercel',
    icon: '▲',
    description: 'Deploy and host frontend apps instantly.',
    authType: 'token',
    docsUrl: 'https://vercel.com/docs',
    category: 'hosting',
    verifiable: true,
  },
  {
    id: 'supabase',
    name: 'Supabase',
    icon: '⚡',
    description: 'Open-source Postgres with auth and storage.',
    authType: 'apikey',
    docsUrl: 'https://supabase.com/docs',
    category: 'database',
    verifiable: true,
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    icon: '🤖',
    description: 'Access 200+ AI models via a single API.',
    authType: 'apikey',
    docsUrl: 'https://openrouter.ai/docs',
    category: 'ai',
    verifiable: true,
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    icon: '☁️',
    description: 'Edge network, CDN, and Workers runtime.',
    authType: 'apikey',
    docsUrl: 'https://developers.cloudflare.com',
    category: 'infra',
    verifiable: true,
  },
  {
    id: 'netlify',
    name: 'Netlify',
    icon: '🌐',
    description: 'Deploy, host, and manage web projects.',
    authType: 'token',
    docsUrl: 'https://docs.netlify.com',
    category: 'hosting',
  },
  {
    id: 'railway',
    name: 'Railway',
    icon: '🚂',
    description: 'Deploy backends and databases in seconds.',
    authType: 'token',
    docsUrl: 'https://docs.railway.app',
    category: 'hosting',
  },
  {
    id: 'render',
    name: 'Render',
    icon: '🔷',
    description: 'Cloud hosting for apps and databases.',
    authType: 'apikey',
    docsUrl: 'https://render.com/docs',
    category: 'hosting',
  },
  {
    id: 'neon',
    name: 'Neon',
    icon: '🌿',
    description: 'Serverless Postgres with branching.',
    authType: 'apikey',
    docsUrl: 'https://neon.tech/docs',
    category: 'database',
  },
  {
    id: 'upstash',
    name: 'Upstash',
    icon: '🔴',
    description: 'Serverless Redis and Kafka at the edge.',
    authType: 'token',
    docsUrl: 'https://upstash.com/docs',
    category: 'database',
  },
  {
    id: 'clerk',
    name: 'Clerk',
    icon: '🔐',
    description: 'Authentication and user management.',
    authType: 'apikey',
    docsUrl: 'https://clerk.com/docs',
    category: 'auth',
  },
  {
    id: 'resend',
    name: 'Resend',
    icon: '✉️',
    description: 'Email API built for developers.',
    authType: 'apikey',
    docsUrl: 'https://resend.com/docs',
    category: 'email',
  },
];
