export interface ParsedRepoUrl {
  owner: string;
  repo: string;
  branch: string;
  repoUrl: string;
}

export interface ImportedGitHubMeta {
  owner: string;
  repo: string;
  branch: string;
  repoUrl: string;
  importedAt: string;
}

export function validateGitHubRepoUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    const parts = u.pathname.split('/').filter(Boolean);

    return u.hostname === 'github.com' && parts.length >= 2;
  } catch {
    return false;
  }
}

export function parseGitHubRepoUrl(url: string, branch = 'main'): ParsedRepoUrl | null {
  if (!validateGitHubRepoUrl(url)) {
    return null;
  }

  try {
    const u = new URL(url.trim());
    const parts = u.pathname.split('/').filter(Boolean);
    const owner = parts[0];
    const repo = parts[1].replace(/\.git$/, '');
    const repoUrl = `https://github.com/${owner}/${repo}`;

    return { owner, repo, branch: branch.trim() || 'main', repoUrl };
  } catch {
    return null;
  }
}

export interface ImportedProject {
  name: string;
  description: string;
  updatedAt: string;
  type: 'github-repo';
  githubMeta: ImportedGitHubMeta;
}

export function createImportedProject(parsed: ParsedRepoUrl): ImportedProject {
  return {
    name: `${parsed.owner}/${parsed.repo}`,
    description: `GitHub repository on branch "${parsed.branch}". Connect GitHub to load files and begin building.`,
    updatedAt: 'Just imported',
    type: 'github-repo',
    githubMeta: {
      owner: parsed.owner,
      repo: parsed.repo,
      branch: parsed.branch,
      repoUrl: parsed.repoUrl,
      importedAt: new Date().toISOString(),
    },
  };
}

export function buildRepoWorkspacePrompt(project: ImportedProject): string {
  const m = project.githubMeta;
  return [
    `I want to work on the GitHub repository at ${m.repoUrl} (branch: ${m.branch}).`,
    `Repo: ${m.owner}/${m.repo}.`,
    `Please help me understand this project and suggest what we can build, improve, or fix.`,
  ].join(' ');
}
