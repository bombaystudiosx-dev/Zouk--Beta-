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
  status?: ConnectorStatus;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  healthCheck: () => Promise<ConnectorStatus>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

async function defaultHealth(): Promise<ConnectorStatus> {
  return 'disconnected';
}

export const CONNECTOR_REGISTRY: Connector[] = [
  {
    id: 'github',
    name: 'GitHub',
    icon: '🐙',
    description: 'Source control and CI/CD pipelines.',
    authType: 'oauth',
    docsUrl: 'https://docs.github.com',
    category: 'infra',
    connect: noop,
    disconnect: noop,
    reconnect: noop,
    healthCheck: defaultHealth,
  },
  {
    id: 'vercel',
    name: 'Vercel',
    icon: '▲',
    description: 'Deploy and host frontend apps instantly.',
    authType: 'token',
    docsUrl: 'https://vercel.com/docs',
    category: 'hosting',
    connect: noop,
    disconnect: noop,
    reconnect: noop,
    healthCheck: defaultHealth,
  },
  {
    id: 'supabase',
    name: 'Supabase',
    icon: '⚡',
    description: 'Open-source Postgres with auth and storage.',
    authType: 'apikey',
    docsUrl: 'https://supabase.com/docs',
    category: 'database',
    connect: noop,
    disconnect: noop,
    reconnect: noop,
    healthCheck: defaultHealth,
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    icon: '🤖',
    description: 'Access 200+ AI models via a single API.',
    authType: 'apikey',
    docsUrl: 'https://openrouter.ai/docs',
    category: 'ai',
    connect: noop,
    disconnect: noop,
    reconnect: noop,
    healthCheck: defaultHealth,
  },
  {
    id: 'netlify',
    name: 'Netlify',
    icon: '🌐',
    description: 'Deploy, host, and manage web projects.',
    authType: 'token',
    docsUrl: 'https://docs.netlify.com',
    category: 'hosting',
    connect: noop,
    disconnect: noop,
    reconnect: noop,
    healthCheck: defaultHealth,
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    icon: '☁️',
    description: 'Edge network, CDN, and Workers runtime.',
    authType: 'apikey',
    docsUrl: 'https://developers.cloudflare.com',
    category: 'infra',
    connect: noop,
    disconnect: noop,
    reconnect: noop,
    healthCheck: defaultHealth,
  },
  {
    id: 'railway',
    name: 'Railway',
    icon: '🚂',
    description: 'Deploy backends and databases in seconds.',
    authType: 'token',
    docsUrl: 'https://docs.railway.app',
    category: 'hosting',
    connect: noop,
    disconnect: noop,
    reconnect: noop,
    healthCheck: defaultHealth,
  },
  {
    id: 'render',
    name: 'Render',
    icon: '🔷',
    description: 'Cloud hosting for apps and databases.',
    authType: 'apikey',
    docsUrl: 'https://render.com/docs',
    category: 'hosting',
    connect: noop,
    disconnect: noop,
    reconnect: noop,
    healthCheck: defaultHealth,
  },
  {
    id: 'neon',
    name: 'Neon',
    icon: '🌿',
    description: 'Serverless Postgres with branching.',
    authType: 'apikey',
    docsUrl: 'https://neon.tech/docs',
    category: 'database',
    connect: noop,
    disconnect: noop,
    reconnect: noop,
    healthCheck: defaultHealth,
  },
  {
    id: 'upstash',
    name: 'Upstash',
    icon: '🔴',
    description: 'Serverless Redis and Kafka at the edge.',
    authType: 'token',
    docsUrl: 'https://upstash.com/docs',
    category: 'database',
    connect: noop,
    disconnect: noop,
    reconnect: noop,
    healthCheck: defaultHealth,
  },
  {
    id: 'clerk',
    name: 'Clerk',
    icon: '🔐',
    description: 'Authentication and user management.',
    authType: 'apikey',
    docsUrl: 'https://clerk.com/docs',
    category: 'auth',
    connect: noop,
    disconnect: noop,
    reconnect: noop,
    healthCheck: defaultHealth,
  },
  {
    id: 'resend',
    name: 'Resend',
    icon: '✉️',
    description: 'Email API built for developers.',
    authType: 'apikey',
    docsUrl: 'https://resend.com/docs',
    category: 'email',
    connect: noop,
    disconnect: noop,
    reconnect: noop,
    healthCheck: defaultHealth,
  },
];
