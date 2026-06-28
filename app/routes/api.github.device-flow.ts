import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';

const GITHUB_CLIENT_ID = 'Iv23lib11KjRK5qE5S0I';

interface StartBody {
  action: 'start';
}

interface PollBody {
  action: 'poll';
  deviceCode: string;
}

type RequestBody = StartBody | PollBody;

export async function action({ request }: ActionFunctionArgs) {
  const body = (await request.json()) as RequestBody;

  if (body.action === 'start') {
    const res = await fetch('https://github.com/login/device/code', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        scope: 'repo read:user',
      }),
    });

    const data = await res.json();

    return json(data);
  }

  if (body.action === 'poll') {
    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        device_code: body.deviceCode,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }),
    });

    const data = await res.json();

    return json(data);
  }

  return json({ error: 'Invalid action' }, { status: 400 });
}
