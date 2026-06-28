import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { getApiKeysFromCookie } from '~/lib/api/cookies';

export interface RepoTreeEntry {
  path: string;
  type: 'blob' | 'tree';
  size?: number;
}

export type RepoTreeResponse = { ok: true; tree: RepoTreeEntry[]; truncated: boolean } | { ok: false; error: string };

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const owner = url.searchParams.get('owner');
  const repo = url.searchParams.get('repo');
  const branch = url.searchParams.get('branch') ?? 'main';

  if (!owner || !repo) {
    return json<RepoTreeResponse>({ ok: false, error: 'Missing owner or repo' }, { status: 400 });
  }

  const apiKeys = getApiKeysFromCookie(request.headers.get('Cookie') ?? '');
  const token = apiKeys?.github;

  if (!token) {
    return json<RepoTreeResponse>(
      { ok: false, error: 'GitHub token not found. Connect GitHub in Connectors.' },
      { status: 401 },
    );
  }

  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`;

  const res = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!res.ok) {
    const body = await res.text();

    if (res.status === 401) {
      return json<RepoTreeResponse>(
        { ok: false, error: 'GitHub token is invalid or expired. Re-connect in Connectors.' },
        { status: 401 },
      );
    }

    if (res.status === 404) {
      return json<RepoTreeResponse>(
        { ok: false, error: `Repository ${owner}/${repo} not found or branch "${branch}" does not exist.` },
        { status: 404 },
      );
    }

    return json<RepoTreeResponse>({ ok: false, error: `GitHub API error ${res.status}: ${body}` }, { status: 502 });
  }

  const data = (await res.json()) as { tree: RepoTreeEntry[]; truncated: boolean };

  return json<RepoTreeResponse>({
    ok: true,
    tree: data.tree,
    truncated: data.truncated ?? false,
  });
}
