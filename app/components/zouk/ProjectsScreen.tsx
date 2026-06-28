import React, { useEffect, useRef, useState } from 'react';
import type { RepoTreeResponse, RepoTreeEntry } from '~/routes/api.github-repo-tree';
import {
  validateGitHubRepoUrl,
  parseGitHubRepoUrl,
  createImportedProject,
  buildRepoWorkspacePrompt,
  type ImportedProject,
} from '~/lib/zouk/githubImport';
import { useConnectorState } from '~/lib/zouk/connectorState';
import { CONNECTOR_REGISTRY } from '~/lib/zouk/connectorRegistry';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LocalProject {
  name: string;
  description: string;
  updatedAt: string;
  type: 'app' | 'website' | 'campaign' | 'automation';
}

type Project = LocalProject | ImportedProject;

function isGitHubProject(p: Project): p is ImportedProject {
  return p.type === 'github-repo';
}

// ─── Storage ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'zouk_beta_projects_v1';

const STARTER_PROJECTS: LocalProject[] = [
  {
    name: 'Zouk Builder Demo',
    description: 'Desktop AI app builder workspace with connectors, model routing, and deploy-ready workflows.',
    updatedAt: 'Seeded for beta',
    type: 'app',
  },
  {
    name: 'Landing Page Build',
    description: 'Generate a polished website, hero copy, sections, and deploy plan from one prompt.',
    updatedAt: 'Seeded for beta',
    type: 'website',
  },
  {
    name: 'Connector Setup Pass',
    description: 'Wire GitHub, Vercel, Supabase, OpenRouter, and Cloudflare into the Zouk workspace.',
    updatedAt: 'Seeded for beta',
    type: 'automation',
  },
];

function readProjects(): Project[] {
  if (typeof window === 'undefined') {
    return STARTER_PROJECTS;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Project[]) : STARTER_PROJECTS;
  } catch {
    return STARTER_PROJECTS;
  }
}

function writeProjects(projects: Project[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

// ─── Type label ───────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<string, string> = {
  app: 'App',
  website: 'Website',
  campaign: 'Campaign',
  automation: 'Automation',
  'github-repo': 'GitHub Repo',
};

// ─── Repo Workspace Overlay ───────────────────────────────────────────────────

function FileTree({ entries }: { entries: RepoTreeEntry[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const dirs = new Set(entries.filter((e) => e.type === 'tree').map((e) => e.path));
  const rootEntries = entries.filter((e) => !e.path.includes('/'));
  const childrenOf = (dir: string) =>
    entries.filter((e) => {
      const rel = e.path.slice(dir.length + 1);
      return e.path.startsWith(dir + '/') && !rel.includes('/');
    });

  const toggle = (path: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);

      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }

      return next;
    });

  const renderEntry = (entry: RepoTreeEntry, depth = 0): React.ReactNode => {
    const isDir = dirs.has(entry.path);
    const name = entry.path.split('/').pop() ?? entry.path;
    const open = expanded.has(entry.path);

    return (
      <div key={entry.path}>
        <div
          onClick={() => isDir && toggle(entry.path)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 8px',
            paddingLeft: 8 + depth * 16,
            cursor: isDir ? 'pointer' : 'default',
            borderRadius: 4,
            color: isDir ? '#b5b5b5' : '#777',
            fontSize: 12,
          }}
        >
          <span style={{ flexShrink: 0, fontSize: 11 }}>{isDir ? (open ? '▾' : '▸') : '·'}</span>
          <span style={{ fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {name}
          </span>
          {!isDir && entry.size !== undefined && (
            <span style={{ marginLeft: 'auto', color: '#3a3a3a', fontSize: 10, flexShrink: 0 }}>
              {entry.size < 1024 ? `${entry.size}B` : `${(entry.size / 1024).toFixed(1)}KB`}
            </span>
          )}
        </div>
        {isDir && open && childrenOf(entry.path).map((child) => renderEntry(child, depth + 1))}
      </div>
    );
  };

  return <div>{rootEntries.map((e) => renderEntry(e, 0))}</div>;
}

function RepoWorkspace({
  project,
  onClose,
  onAskZouk,
  githubConnected,
}: {
  project: ImportedProject;
  onClose: () => void;
  onAskZouk: (prompt: string) => void;
  githubConnected: boolean;
}) {
  const m = project.githubMeta;
  const importedDate = new Date(m.importedAt).toLocaleString();
  const [treeState, setTreeState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [tree, setTree] = useState<RepoTreeEntry[]>([]);
  const [treeError, setTreeError] = useState('');
  const [truncated, setTruncated] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!githubConnected || fetchedRef.current) {
      return undefined;
    }

    fetchedRef.current = true;
    setTreeState('loading');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    fetch(
      `/api/github-repo-tree?owner=${encodeURIComponent(m.owner)}&repo=${encodeURIComponent(m.repo)}&branch=${encodeURIComponent(m.branch)}`,
      { signal: controller.signal },
    )
      .then((r) => r.json() as Promise<RepoTreeResponse>)
      .then((data) => {
        if (data.ok) {
          setTree(data.tree);
          setTruncated(data.truncated);
          setTreeState('done');
        } else {
          setTreeError(data.error);
          setTreeState('error');
        }
      })
      .catch((err: Error) => {
        setTreeError(err.name === 'AbortError' ? 'Request timed out' : err.message);
        setTreeState('error');
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [githubConnected, m.owner, m.repo, m.branch]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.82)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          width: '100%',
          maxWidth: 640,
          background: '#0a0a0a',
          border: '1px solid #1e1e1e',
          borderRadius: 14,
          boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
          overflow: 'hidden',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid #1a1a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>🐙</span>
            <div>
              <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: 0 }}>
                {m.owner}/{m.repo}
              </h3>
              <p style={{ color: '#555', fontSize: 12, margin: '3px 0 0' }}>Repo Workspace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              fontSize: 20,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
          {/* Metadata */}
          <div
            style={{
              background: '#060606',
              border: '1px solid #1a1a1a',
              borderRadius: 10,
              padding: '14px 16px',
              marginBottom: 16,
              display: 'flex',
              gap: 24,
              flexWrap: 'wrap',
            }}
          >
            {[
              { label: 'REPOSITORY', value: `${m.owner}/${m.repo}` },
              { label: 'BRANCH', value: m.branch },
              { label: 'IMPORTED', value: importedDate },
            ].map((item) => (
              <div key={item.label}>
                <span
                  style={{
                    fontSize: 10,
                    color: '#444',
                    display: 'block',
                    marginBottom: 3,
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                  }}
                >
                  {item.label}
                </span>
                <span style={{ fontSize: 12, color: '#b5b5b5', fontWeight: 500 }}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* Repo URL */}
          <div
            style={{
              background: '#060606',
              border: '1px solid #1a1a1a',
              borderRadius: 8,
              padding: '10px 14px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 12, color: '#777', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {m.repoUrl}
            </span>
            <button
              onClick={() => navigator.clipboard.writeText(m.repoUrl).catch(() => {})}
              style={{
                padding: '4px 10px',
                background: '#111',
                border: '1px solid #2a2a2a',
                borderRadius: 6,
                color: '#9a9a9a',
                fontSize: 11,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              Copy URL
            </button>
          </div>

          {/* File tree */}
          <div
            style={{
              background: '#060606',
              border: '1px solid #1a1a1a',
              borderRadius: 10,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ color: '#444', fontSize: 13 }}>📁</span>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#777', margin: 0 }}>Repository Files</p>
              {treeState === 'done' && (
                <span style={{ marginLeft: 'auto', fontSize: 11, color: '#555' }}>
                  {tree.filter((e) => e.type === 'blob').length} files
                  {truncated ? ' (truncated)' : ''}
                </span>
              )}
            </div>
            {!githubConnected && (
              <p style={{ fontSize: 12, color: '#555', lineHeight: 1.5, margin: 0 }}>
                Connect GitHub in Connectors to load the file tree.
              </p>
            )}
            {githubConnected && treeState === 'idle' && (
              <p style={{ fontSize: 12, color: '#555', margin: 0 }}>Waiting to load…</p>
            )}
            {githubConnected && treeState === 'loading' && (
              <p style={{ fontSize: 12, color: '#6a6a6a', margin: 0 }}>Loading file tree…</p>
            )}
            {githubConnected && treeState === 'error' && (
              <p style={{ fontSize: 12, color: '#ef4444', lineHeight: 1.5, margin: 0 }}>{treeError}</p>
            )}
            {githubConnected && treeState === 'done' && tree.length === 0 && (
              <p style={{ fontSize: 12, color: '#555', margin: 0 }}>Repository appears to be empty.</p>
            )}
            {githubConnected && treeState === 'done' && tree.length > 0 && (
              <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                <FileTree entries={tree} />
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => {
                onClose();
                onAskZouk(buildRepoWorkspacePrompt(project));
              }}
              style={{
                flex: 1,
                padding: '10px 12px',
                background: 'rgba(236,29,46,0.12)',
                border: '1px solid #ec1d2e',
                borderRadius: 8,
                color: '#ec1d2e',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Ask Zouk About This Repo
            </button>
            {!githubConnected && (
              <button
                onClick={() => alert('Navigate to Connectors → GitHub to connect your account.')}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: '#111',
                  border: '1px solid #2a2a2a',
                  borderRadius: 8,
                  color: '#9a9a9a',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Connect GitHub
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Import Panel ─────────────────────────────────────────────────────────────

function GitHubImportPanel({
  onImport,
  onCancel,
}: {
  onImport: (project: ImportedProject) => void;
  onCancel: () => void;
}) {
  const [url, setUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [error, setError] = useState('');

  const urlValid = validateGitHubRepoUrl(url);

  const handleImport = () => {
    const parsed = parseGitHubRepoUrl(url, branch);

    if (!parsed) {
      setError('Invalid GitHub URL. Use https://github.com/owner/repo');
      return;
    }

    setError('');
    onImport(createImportedProject(parsed));
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    background: '#060606',
    border: `1px solid ${error ? 'rgba(239,68,68,0.4)' : '#242424'}`,
    borderRadius: 8,
    color: '#e8e8e8',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div
      style={{
        background: '#0a0a0a',
        border: '1px solid rgba(236,29,46,0.2)',
        borderRadius: 12,
        padding: 20,
        marginBottom: 28,
      }}
    >
      <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Import from GitHub</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <label style={{ display: 'block', color: '#b5b5b5', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
            Repository URL
          </label>
          <input
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError('');
            }}
            placeholder="https://github.com/owner/repo"
            style={inputStyle}
            autoFocus
          />
          {error && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 4 }}>{error}</p>}
          {url && !urlValid && !error && (
            <p style={{ color: '#555', fontSize: 11, marginTop: 4 }}>Must start with https://github.com/</p>
          )}
        </div>
        <div>
          <label style={{ display: 'block', color: '#b5b5b5', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
            Branch
          </label>
          <input
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="main"
            style={{ ...inputStyle, border: '1px solid #242424' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button
            onClick={onCancel}
            style={{
              padding: '9px 16px',
              background: '#111',
              border: '1px solid #2a2a2a',
              borderRadius: 8,
              color: '#777',
              fontSize: 13,
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Cancel
          </button>
          <button
            disabled={!urlValid}
            onClick={handleImport}
            style={{
              flex: 1,
              padding: '9px 16px',
              background: urlValid ? 'rgba(236,29,46,0.12)' : '#111',
              border: `1px solid ${urlValid ? '#ec1d2e' : '#1e1e1e'}`,
              borderRadius: 8,
              color: urlValid ? '#ec1d2e' : '#333',
              fontSize: 13,
              fontWeight: 600,
              cursor: urlValid ? 'pointer' : 'not-allowed',
            }}
          >
            Import Repo
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

interface Props {
  onOpen: (projectName: string) => void;
}

export function ProjectsScreen({ onOpen }: Props) {
  const [projects, setProjects] = useState<Project[]>(readProjects);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<LocalProject['type']>('app');
  const [showImport, setShowImport] = useState(false);
  const [repoWorkspace, setRepoWorkspace] = useState<ImportedProject | null>(null);

  const { getStatus } = useConnectorState(CONNECTOR_REGISTRY);
  const githubConnected = getStatus('github') === 'connected';

  useEffect(() => {
    writeProjects(projects);
  }, [projects]);

  const createNew = () => {
    const name = newName.trim() || `New Zouk Project ${projects.length + 1}`;
    const project: LocalProject = {
      name,
      description: 'Describe the build goal, target users, and what Zouk should generate next.',
      updatedAt: 'Just now',
      type: newType,
    };
    setProjects((prev) => [project, ...prev]);
    setNewName('');
    onOpen(name);
  };

  const handleImport = (project: ImportedProject) => {
    setProjects((prev) => [project, ...prev]);
    setShowImport(false);
  };

  const deleteProject = (name: string) => {
    setProjects((prev) => {
      const idx = prev.findIndex((p) => p.name === name);
      return idx === -1 ? prev : prev.filter((_, i) => i !== idx);
    });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    background: '#060606',
    border: '1px solid #242424',
    borderRadius: 8,
    color: '#e8e8e8',
    fontSize: 13,
    outline: 'none',
    marginBottom: 10,
    boxSizing: 'border-box',
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#060606',
        overflowY: 'auto',
        zIndex: 2,
        padding: 32,
      }}
    >
      <div style={{ maxWidth: 1400 }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 20,
            marginBottom: showImport ? 16 : 28,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Projects</h2>
            <p style={{ color: '#b5b5b5', marginBottom: 6 }}>
              Saved beta workspaces for builds, campaigns, and automations.
            </p>
            <p style={{ color: '#6a6a6a', fontSize: 12 }}>
              Stored locally for beta. Backend sync can replace this later.
            </p>
          </div>

          <div
            style={{
              minWidth: 320,
              background: '#0a0a0a',
              border: '1px solid #1a1a1a',
              borderRadius: 12,
              padding: 14,
            }}
          >
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name the next project..."
              style={inputStyle}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as LocalProject['type'])}
                style={{
                  flex: 1,
                  background: '#060606',
                  border: '1px solid #242424',
                  borderRadius: 8,
                  color: '#b5b5b5',
                  padding: '9px 10px',
                  fontSize: 12,
                }}
              >
                <option value="app">App</option>
                <option value="website">Website</option>
                <option value="campaign">Campaign</option>
                <option value="automation">Automation</option>
              </select>
              <button
                onClick={createNew}
                style={{
                  padding: '9px 14px',
                  background: 'rgba(236,29,46,0.12)',
                  border: '1px solid #ec1d2e',
                  borderRadius: 8,
                  color: '#ec1d2e',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                + New
              </button>
              <button
                onClick={() => setShowImport((v) => !v)}
                style={{
                  padding: '9px 14px',
                  background: showImport ? 'rgba(88,166,255,0.12)' : '#111',
                  border: `1px solid ${showImport ? 'rgba(88,166,255,0.4)' : '#2a2a2a'}`,
                  borderRadius: 8,
                  color: showImport ? '#58a6ff' : '#9a9a9a',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 12,
                  whiteSpace: 'nowrap',
                }}
              >
                🐙 Import
              </button>
            </div>
          </div>
        </div>

        {/* GitHub import panel */}
        {showImport && <GitHubImportPanel onImport={handleImport} onCancel={() => setShowImport(false)} />}

        {/* Project grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16,
          }}
        >
          {projects.map((project) => {
            const isGH = isGitHubProject(project);

            return (
              <div
                key={project.name}
                style={{
                  background: '#0a0a0a',
                  border: `1px solid ${isGH ? 'rgba(88,166,255,0.2)' : '#1a1a1a'}`,
                  borderRadius: 12,
                  padding: 16,
                  animation: 'fadeIn .3s ease-out',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                  <p style={{ fontWeight: 600, color: '#fff', fontSize: 15, wordBreak: 'break-word' }}>
                    {isGH ? (
                      <>
                        <span style={{ color: '#555' }}>🐙 </span>
                        {project.name}
                      </>
                    ) : (
                      project.name
                    )}
                  </p>
                  <span
                    style={{
                      height: 22,
                      padding: '3px 8px',
                      borderRadius: 999,
                      background: isGH ? 'rgba(88,166,255,0.12)' : 'rgba(236,29,46,0.10)',
                      color: isGH ? '#58a6ff' : '#ec1d2e',
                      border: isGH ? '1px solid rgba(88,166,255,0.25)' : 'none',
                      fontSize: 10,
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {TYPE_LABEL[project.type] ?? project.type}
                  </span>
                </div>

                <p style={{ fontSize: 13, color: '#9a9a9a', marginBottom: 12, lineHeight: 1.4 }}>
                  {project.description}
                </p>
                <p style={{ fontSize: 11, color: '#6a6a6a', marginBottom: 14 }}>Updated {project.updatedAt}</p>

                {/* Actions */}
                {isGH ? (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => onOpen(buildRepoWorkspacePrompt(project as ImportedProject))}
                      style={{
                        flex: 1,
                        padding: 8,
                        background: 'rgba(236,29,46,0.12)',
                        border: '1px solid #ec1d2e',
                        borderRadius: 6,
                        color: '#ec1d2e',
                        fontWeight: 500,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      Open in Chat
                    </button>
                    <button
                      onClick={() => setRepoWorkspace(project as ImportedProject)}
                      style={{
                        flex: 1,
                        padding: 8,
                        background: 'rgba(88,166,255,0.08)',
                        border: '1px solid rgba(88,166,255,0.3)',
                        borderRadius: 6,
                        color: '#58a6ff',
                        fontWeight: 500,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      Repo Workspace
                    </button>
                    <button
                      onClick={() => deleteProject(project.name)}
                      style={{
                        padding: '8px 12px',
                        background: '#111',
                        border: '1px solid #242424',
                        borderRadius: 6,
                        color: '#555',
                        fontWeight: 500,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => onOpen(project.name)}
                      style={{
                        flex: 1,
                        padding: 8,
                        background: 'rgba(236,29,46,0.12)',
                        border: '1px solid #ec1d2e',
                        borderRadius: 6,
                        color: '#ec1d2e',
                        fontWeight: 500,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      Open in Chat
                    </button>
                    <button
                      onClick={() => deleteProject(project.name)}
                      style={{
                        padding: '8px 12px',
                        background: '#111',
                        border: '1px solid #242424',
                        borderRadius: 6,
                        color: '#777',
                        fontWeight: 500,
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Repo Workspace modal */}
      {repoWorkspace && (
        <RepoWorkspace
          project={repoWorkspace}
          onClose={() => setRepoWorkspace(null)}
          onAskZouk={(prompt) => onOpen(prompt)}
          githubConnected={githubConnected}
        />
      )}
    </div>
  );
}
