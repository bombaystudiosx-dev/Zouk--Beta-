import React, { useEffect, useState } from 'react';

interface Project {
  name: string;
  description: string;
  updatedAt: string;
  type: 'app' | 'website' | 'campaign' | 'automation';
}

const STORAGE_KEY = 'zouk_beta_projects_v1';

const STARTER_PROJECTS: Project[] = [
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

const TYPE_LABEL: Record<Project['type'], string> = {
  app: 'App',
  website: 'Website',
  campaign: 'Campaign',
  automation: 'Automation',
};

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

interface Props {
  onOpen: (projectName: string) => void;
}

export function ProjectsScreen({ onOpen }: Props) {
  const [projects, setProjects] = useState<Project[]>(readProjects);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<Project['type']>('app');

  useEffect(() => {
    writeProjects(projects);
  }, [projects]);

  const createNew = () => {
    const name = newName.trim() || `New Zouk Project ${projects.length + 1}`;
    const project: Project = {
      name,
      description: 'Describe the build goal, target users, and what Zouk should generate next.',
      updatedAt: 'Just now',
      type: newType,
    };

    setProjects((prev) => [project, ...prev]);
    setNewName('');
    onOpen(name);
  };

  const deleteProject = (name: string) => {
    setProjects((prev) => prev.filter((project) => project.name !== name));
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
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 20,
            marginBottom: 28,
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
              onChange={(event) => setNewName(event.target.value)}
              placeholder="Name the next project..."
              style={{
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
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <select
                value={newType}
                onChange={(event) => setNewType(event.target.value as Project['type'])}
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
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16,
          }}
        >
          {projects.map((project) => (
            <div
              key={project.name}
              style={{
                background: '#0a0a0a',
                border: '1px solid #1a1a1a',
                borderRadius: 12,
                padding: 16,
                animation: 'fadeIn .3s ease-out',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                <p style={{ fontWeight: 600, color: '#fff', fontSize: 15 }}>{project.name}</p>
                <span
                  style={{
                    height: 22,
                    padding: '3px 8px',
                    borderRadius: 999,
                    background: 'rgba(236,29,46,0.10)',
                    color: '#ec1d2e',
                    fontSize: 10,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {TYPE_LABEL[project.type]}
                </span>
              </div>
              <p style={{ fontSize: 13, color: '#9a9a9a', marginBottom: 12, lineHeight: 1.4 }}>{project.description}</p>
              <p style={{ fontSize: 11, color: '#6a6a6a', marginBottom: 14 }}>Updated {project.updatedAt}</p>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
