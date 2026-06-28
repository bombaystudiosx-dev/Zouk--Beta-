import { json } from '@remix-run/cloudflare';
import { getApiKeysFromCookie } from '~/lib/api/cookies';

interface VerifyResult {
  ok: boolean;
  account?: {
    name?: string;
    login?: string;
    email?: string;
    balance?: number;
    currency?: string;
    plan?: string;
    extra?: string;
  };
  error?: string;
}

// ─── OpenRouter ───────────────────────────────────────────────────────────────

async function verifyOpenRouter(credential: string): Promise<VerifyResult> {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
      headers: { Authorization: `Bearer ${credential}` },
    });

    if (res.status === 401) {
      return { ok: false, error: 'Invalid API key — check it at openrouter.ai/keys' };
    }

    if (!res.ok) {
      return { ok: false, error: `OpenRouter returned ${res.status}` };
    }

    const data = (await res.json()) as {
      data?: { label?: string; limit?: number; limit_remaining?: number };
    };
    const d = data?.data ?? {};

    return {
      ok: true,
      account: {
        name: d.label ?? 'OpenRouter key',
        extra:
          typeof d.limit === 'number'
            ? `${(d.limit_remaining ?? 0).toFixed(4)} / ${d.limit.toFixed(4)} credits remaining`
            : 'Key valid',
      },
    };
  } catch (err) {
    return { ok: false, error: `Network error: ${err instanceof Error ? err.message : String(err)}` };
  }
}

// ─── GitHub ───────────────────────────────────────────────────────────────────

async function verifyGitHub(credential: string): Promise<VerifyResult> {
  try {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${credential}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'zouk-beta',
      },
    });

    if (res.status === 401) {
      return { ok: false, error: 'Invalid token — create a PAT at github.com/settings/tokens' };
    }

    if (!res.ok) {
      return { ok: false, error: `GitHub returned ${res.status}` };
    }

    const user = (await res.json()) as { login: string; name?: string; email?: string; plan?: { name?: string } };

    return {
      ok: true,
      account: {
        login: user.login,
        name: user.name ?? user.login,
        email: user.email ?? undefined,
        plan: user.plan?.name,
      },
    };
  } catch (err) {
    return { ok: false, error: `Network error: ${err instanceof Error ? err.message : String(err)}` };
  }
}

// ─── Vercel ───────────────────────────────────────────────────────────────────

async function verifyVercel(credential: string): Promise<VerifyResult> {
  try {
    const res = await fetch('https://api.vercel.com/v2/user', {
      headers: { Authorization: `Bearer ${credential}` },
    });

    if (res.status === 401 || res.status === 403) {
      return { ok: false, error: 'Invalid token — generate one at vercel.com/account/tokens' };
    }

    if (!res.ok) {
      return { ok: false, error: `Vercel returned ${res.status}` };
    }

    const data = (await res.json()) as { user?: { username?: string; name?: string; email?: string } };
    const u = data?.user ?? {};

    return {
      ok: true,
      account: { login: u.username, name: u.name ?? u.username, email: u.email },
    };
  } catch (err) {
    return { ok: false, error: `Network error: ${err instanceof Error ? err.message : String(err)}` };
  }
}

// ─── Supabase ─────────────────────────────────────────────────────────────────

async function verifySupabase(credential: string, extra?: string): Promise<VerifyResult> {
  const projectUrl = extra?.trim().replace(/\/$/, '');

  if (!projectUrl) {
    return { ok: false, error: 'Project URL is required (e.g. https://xxxx.supabase.co)' };
  }

  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(projectUrl)) {
    return { ok: false, error: 'URL must be https://your-project.supabase.co' };
  }

  try {
    const res = await fetch(`${projectUrl}/rest/v1/`, {
      headers: { apikey: credential, Authorization: `Bearer ${credential}` },
    });

    if (res.status === 401 || res.status === 403) {
      return { ok: false, error: 'Invalid anon key — copy it from Project Settings → API' };
    }

    if (res.ok || res.status === 400) {
      const projectRef = new URL(projectUrl).hostname.split('.')[0];

      return { ok: true, account: { name: `Supabase: ${projectRef}`, extra: projectUrl } };
    }

    return { ok: false, error: `Supabase returned ${res.status}` };
  } catch (err) {
    return { ok: false, error: `Network error: ${err instanceof Error ? err.message : String(err)}` };
  }
}

// ─── Cloudflare ───────────────────────────────────────────────────────────────

async function verifyCloudflare(credential: string): Promise<VerifyResult> {
  try {
    const res = await fetch('https://api.cloudflare.com/client/v4/user/tokens/verify', {
      headers: { Authorization: `Bearer ${credential}` },
    });

    if (res.status === 401 || res.status === 403) {
      return { ok: false, error: 'Invalid token — create one at dash.cloudflare.com/profile/api-tokens' };
    }

    const data = (await res.json()) as { result?: { status?: string }; success?: boolean };

    if (!data.success) {
      return { ok: false, error: 'Token verification failed at Cloudflare' };
    }

    return { ok: true, account: { name: 'Cloudflare token', extra: `Status: ${data.result?.status ?? 'active'}` } };
  } catch (err) {
    return { ok: false, error: `Network error: ${err instanceof Error ? err.message : String(err)}` };
  }
}

// ─── Netlify ──────────────────────────────────────────────────────────────────

async function verifyNetlify(credential: string): Promise<VerifyResult> {
  try {
    const res = await fetch('https://api.netlify.com/api/v1/user', {
      headers: { Authorization: `Bearer ${credential}` },
    });

    if (res.status === 401) {
      return { ok: false, error: 'Invalid token — create one at app.netlify.com/user/applications' };
    }

    if (!res.ok) {
      return { ok: false, error: `Netlify returned ${res.status}` };
    }

    const user = (await res.json()) as { full_name?: string; email?: string; slug?: string };

    return {
      ok: true,
      account: { name: user.full_name ?? user.slug, login: user.slug, email: user.email },
    };
  } catch (err) {
    return { ok: false, error: `Network error: ${err instanceof Error ? err.message : String(err)}` };
  }
}

// ─── Railway ──────────────────────────────────────────────────────────────────

async function verifyRailway(credential: string): Promise<VerifyResult> {
  try {
    const res = await fetch('https://backboard.railway.app/graphql/v2', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${credential}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: '{ me { name email } }' }),
    });

    if (res.status === 401 || res.status === 403) {
      return { ok: false, error: 'Invalid token — create one at railway.app/account/tokens' };
    }

    if (!res.ok) {
      return { ok: false, error: `Railway returned ${res.status}` };
    }

    const data = (await res.json()) as { data?: { me?: { name?: string; email?: string } }; errors?: unknown[] };

    if (data.errors && !data.data?.me) {
      return { ok: false, error: 'Invalid token — Railway rejected the request' };
    }

    const me = data.data?.me ?? {};

    return { ok: true, account: { name: me.name, email: me.email } };
  } catch (err) {
    return { ok: false, error: `Network error: ${err instanceof Error ? err.message : String(err)}` };
  }
}

// ─── Render ───────────────────────────────────────────────────────────────────

async function verifyRender(credential: string): Promise<VerifyResult> {
  try {
    const res = await fetch('https://api.render.com/v1/owners?limit=1', {
      headers: { Authorization: `Bearer ${credential}`, Accept: 'application/json' },
    });

    if (res.status === 401 || res.status === 403) {
      return { ok: false, error: 'Invalid API key — create one at dashboard.render.com/u/account/api-keys' };
    }

    if (!res.ok) {
      return { ok: false, error: `Render returned ${res.status}` };
    }

    const data = (await res.json()) as Array<{ owner?: { name?: string; email?: string; type?: string } }>;
    const owner = data?.[0]?.owner ?? {};

    return { ok: true, account: { name: owner.name, email: owner.email, plan: owner.type } };
  } catch (err) {
    return { ok: false, error: `Network error: ${err instanceof Error ? err.message : String(err)}` };
  }
}

// ─── Neon ─────────────────────────────────────────────────────────────────────

async function verifyNeon(credential: string): Promise<VerifyResult> {
  try {
    const res = await fetch('https://console.neon.tech/api/v2/users/me', {
      headers: { Authorization: `Bearer ${credential}`, Accept: 'application/json' },
    });

    if (res.status === 401) {
      return { ok: false, error: 'Invalid API key — create one at console.neon.tech/app/settings/api-keys' };
    }

    if (!res.ok) {
      return { ok: false, error: `Neon returned ${res.status}` };
    }

    const user = (await res.json()) as { name?: string; email?: string; login?: string };

    return { ok: true, account: { name: user.name ?? user.login, email: user.email, login: user.login } };
  } catch (err) {
    return { ok: false, error: `Network error: ${err instanceof Error ? err.message : String(err)}` };
  }
}

// ─── Upstash ──────────────────────────────────────────────────────────────────

async function verifyUpstash(credential: string, extra?: string): Promise<VerifyResult> {
  // extra = Upstash account email (required for Basic auth: email:api_key)
  const email = extra?.trim();

  if (!email) {
    return { ok: false, error: 'Account email is required (used together with the API key)' };
  }

  try {
    const encoded = btoa(`${email}:${credential}`);
    const res = await fetch('https://api.upstash.com/v2/redis/database', {
      headers: { Authorization: `Basic ${encoded}`, Accept: 'application/json' },
    });

    if (res.status === 401 || res.status === 403) {
      return { ok: false, error: 'Invalid credentials — check email + API key at console.upstash.com' };
    }

    if (!res.ok) {
      return { ok: false, error: `Upstash returned ${res.status}` };
    }

    const dbs = (await res.json()) as Array<{ database_name?: string }>;
    const dbCount = Array.isArray(dbs) ? dbs.length : 0;

    return {
      ok: true,
      account: { name: email, extra: `${dbCount} Redis database${dbCount !== 1 ? 's' : ''} found` },
    };
  } catch (err) {
    return { ok: false, error: `Network error: ${err instanceof Error ? err.message : String(err)}` };
  }
}

// ─── Clerk ────────────────────────────────────────────────────────────────────

async function verifyClerk(credential: string): Promise<VerifyResult> {
  try {
    // Secret key starts with sk_test_ or sk_live_
    if (!credential.startsWith('sk_')) {
      return { ok: false, error: 'Key should start with sk_test_ or sk_live_' };
    }

    const res = await fetch('https://api.clerk.com/v1/users?limit=1', {
      headers: { Authorization: `Bearer ${credential}`, Accept: 'application/json' },
    });

    if (res.status === 401 || res.status === 403) {
      return { ok: false, error: 'Invalid secret key — copy it from dashboard.clerk.com → API Keys' };
    }

    if (!res.ok) {
      return { ok: false, error: `Clerk returned ${res.status}` };
    }

    const env = credential.startsWith('sk_live_') ? 'Production' : 'Development';

    return { ok: true, account: { name: `Clerk ${env}`, extra: `${env} secret key verified` } };
  } catch (err) {
    return { ok: false, error: `Network error: ${err instanceof Error ? err.message : String(err)}` };
  }
}

// ─── Resend ───────────────────────────────────────────────────────────────────

async function verifyResend(credential: string): Promise<VerifyResult> {
  try {
    const res = await fetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${credential}`, Accept: 'application/json' },
    });

    if (res.status === 401 || res.status === 403) {
      return { ok: false, error: 'Invalid API key — create one at resend.com/api-keys' };
    }

    if (!res.ok) {
      return { ok: false, error: `Resend returned ${res.status}` };
    }

    const data = (await res.json()) as { data?: Array<{ name?: string }> };
    const domainCount = data?.data?.length ?? 0;

    return {
      ok: true,
      account: { name: 'Resend account', extra: `${domainCount} domain${domainCount !== 1 ? 's' : ''} configured` },
    };
  } catch (err) {
    return { ok: false, error: `Network error: ${err instanceof Error ? err.message : String(err)}` };
  }
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const action = async ({ request }: { request: Request }) => {
  if (request.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed' }, { status: 405 });
  }

  let body: { connector?: string; credential?: string; extra?: string };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const { connector, credential = '', extra } = body;

  if (!connector) {
    return json({ ok: false, error: 'connector is required' }, { status: 400 });
  }

  let resolvedCredential = credential.trim();

  // For OpenRouter: also accept key already stored in cookie
  if (!resolvedCredential && connector === 'openrouter') {
    const cookieHeader = request.headers.get('Cookie');
    const apiKeys = getApiKeysFromCookie(cookieHeader);
    resolvedCredential = apiKeys.OpenRouter ?? '';
  }

  // Upstash needs email + key — credential can be empty until email is provided
  if (!resolvedCredential && connector !== 'upstash') {
    return json({ ok: false, error: 'No credential provided' }, { status: 400 });
  }

  let result: VerifyResult;

  switch (connector) {
    case 'openrouter':
      result = await verifyOpenRouter(resolvedCredential);
      break;
    case 'github':
      result = await verifyGitHub(resolvedCredential);
      break;
    case 'vercel':
      result = await verifyVercel(resolvedCredential);
      break;
    case 'supabase':
      result = await verifySupabase(resolvedCredential, extra);
      break;
    case 'cloudflare':
      result = await verifyCloudflare(resolvedCredential);
      break;
    case 'netlify':
      result = await verifyNetlify(resolvedCredential);
      break;
    case 'railway':
      result = await verifyRailway(resolvedCredential);
      break;
    case 'render':
      result = await verifyRender(resolvedCredential);
      break;
    case 'neon':
      result = await verifyNeon(resolvedCredential);
      break;
    case 'upstash':
      result = await verifyUpstash(resolvedCredential, extra);
      break;
    case 'clerk':
      result = await verifyClerk(resolvedCredential);
      break;
    case 'resend':
      result = await verifyResend(resolvedCredential);
      break;
    default:
      return json({ ok: false, error: `No verifier for connector: ${connector}` }, { status: 400 });
  }

  return json(result);
};
