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
      data?: { label?: string; limit?: number; limit_remaining?: number; usage?: number };
    };
    const d = data?.data ?? {};

    return {
      ok: true,
      account: {
        name: d.label ?? 'OpenRouter key',
        balance: typeof d.limit_remaining === 'number' ? d.limit_remaining : undefined,
        currency: 'credits',
        extra:
          typeof d.limit === 'number'
            ? `${(d.limit_remaining ?? 0).toFixed(4)} / ${d.limit.toFixed(4)} credits remaining`
            : undefined,
      },
    };
  } catch (err) {
    return { ok: false, error: `Network error: ${err instanceof Error ? err.message : String(err)}` };
  }
}

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
      return { ok: false, error: 'Invalid token — create one at github.com/settings/tokens' };
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

async function verifyVercel(credential: string): Promise<VerifyResult> {
  try {
    const res = await fetch('https://api.vercel.com/v2/user', {
      headers: { Authorization: `Bearer ${credential}` },
    });

    if (res.status === 403 || res.status === 401) {
      return { ok: false, error: 'Invalid token — generate one at vercel.com/account/tokens' };
    }

    if (!res.ok) {
      return { ok: false, error: `Vercel returned ${res.status}` };
    }

    const data = (await res.json()) as { user?: { username?: string; name?: string; email?: string } };
    const u = data?.user ?? {};

    return {
      ok: true,
      account: {
        login: u.username,
        name: u.name ?? u.username,
        email: u.email,
      },
    };
  } catch (err) {
    return { ok: false, error: `Network error: ${err instanceof Error ? err.message : String(err)}` };
  }
}

async function verifySupabase(credential: string, extra?: string): Promise<VerifyResult> {
  // extra = project URL passed as a second field
  const projectUrl = extra?.trim().replace(/\/$/, '');

  if (!projectUrl) {
    return { ok: false, error: 'Project URL is required (e.g. https://xxxx.supabase.co)' };
  }

  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(projectUrl)) {
    return { ok: false, error: 'URL must match https://your-project.supabase.co' };
  }

  try {
    const res = await fetch(`${projectUrl}/rest/v1/?apikey=${credential}`, {
      headers: {
        apikey: credential,
        Authorization: `Bearer ${credential}`,
      },
    });

    if (res.status === 401 || res.status === 403) {
      return { ok: false, error: 'Invalid anon key — copy it from Project Settings → API' };
    }

    // Supabase returns 200 or 400 for a schema request — either means the key is valid
    if (res.ok || res.status === 400) {
      const host = new URL(projectUrl).hostname;
      const projectRef = host.split('.')[0];

      return {
        ok: true,
        account: {
          name: `Supabase: ${projectRef}`,
          extra: projectUrl,
        },
      };
    }

    return { ok: false, error: `Supabase returned ${res.status} — check URL and key` };
  } catch (err) {
    return { ok: false, error: `Network error: ${err instanceof Error ? err.message : String(err)}` };
  }
}

async function verifyCloudflare(credential: string): Promise<VerifyResult> {
  try {
    const res = await fetch('https://api.cloudflare.com/client/v4/user/tokens/verify', {
      headers: { Authorization: `Bearer ${credential}` },
    });

    if (res.status === 401 || res.status === 403) {
      return { ok: false, error: 'Invalid token — create one at dash.cloudflare.com/profile/api-tokens' };
    }

    const data = (await res.json()) as { result?: { id?: string; status?: string }; success?: boolean };

    if (!data.success) {
      return { ok: false, error: 'Token verification failed at Cloudflare' };
    }

    return {
      ok: true,
      account: {
        name: `Cloudflare token`,
        extra: `Status: ${data.result?.status ?? 'active'}`,
      },
    };
  } catch (err) {
    return { ok: false, error: `Network error: ${err instanceof Error ? err.message : String(err)}` };
  }
}

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

  // For OpenRouter: also accept key already stored in cookie
  let resolvedCredential = credential.trim();

  if (!resolvedCredential && connector === 'openrouter') {
    const cookieHeader = request.headers.get('Cookie');
    const apiKeys = getApiKeysFromCookie(cookieHeader);
    resolvedCredential = apiKeys.OpenRouter ?? '';
  }

  if (!resolvedCredential) {
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

    default:
      return json({ ok: false, error: `No verifier for connector: ${connector}` }, { status: 400 });
  }

  return json(result);
};
