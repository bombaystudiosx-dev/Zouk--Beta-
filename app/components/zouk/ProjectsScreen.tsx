import React, { useState } from 'react';

interface Project {
  name: string;
  description: string;
  updatedAt: string;
}

const DEMO_PROJECTS: Project[] = [
  {
    name: 'Q3 Meta Campaign',
    description: 'Multi-platform ad campaign targeting 25-44 demographics across Meta properties.',
    updatedAt: '2 hours ago',
  },
  {
    name: 'Landing Page Redesign',
    description: 'New homepage with improved CTA placement and video hero section.',
    updatedAt: 'Yesterday',
  },
  {
    name: 'Email Drip Sequence',
    description: 'Onboarding email automation for new SaaS trial users.',
    updatedAt: '3 days ago',
  },
];

interface Props {
  onOpen: (projectName: string) => void;
}

export function ProjectsScreen({ onOpen }: Props) {
  const [projects, setProjects] = useState<Project[]>(DEMO_PROJECTS);

  const createNew = () => {
    const name = `New Project ${projects.length + 1}`;
    setProjects((prev) => [{ name, description: 'Describe your project...', updatedAt: 'Just now' }, ...prev]);
    onOpen(name);
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
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Projects</h2>
            <p style={{ color: '#b5b5b5' }}>Your projects and campaigns</p>
          </div>
          <button
            onClick={createNew}
            style={{
              padding: '10px 18px',
              background: 'rgba(236,29,46,0.12)',
              border: '1px solid #ec1d2e',
              borderRadius: 8,
              color: '#ec1d2e',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            + New Project
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16,
          }}
        >
          {projects.map((proj, i) => (
            <div
              key={i}
              style={{
                background: '#0a0a0a',
                border: '1px solid #1a1a1a',
                borderRadius: 12,
                padding: 16,
                animation: 'fadeIn .3s ease-out',
              }}
            >
              <p style={{ fontWeight: 600, color: '#fff', marginBottom: 8, fontSize: 15 }}>{proj.name}</p>
              <p style={{ fontSize: 13, color: '#9a9a9a', marginBottom: 12, lineHeight: 1.4 }}>{proj.description}</p>
              <p style={{ fontSize: 11, color: '#6a6a6a', marginBottom: 14 }}>Updated {proj.updatedAt}</p>
              <button
                onClick={() => onOpen(proj.name)}
                style={{
                  width: '100%',
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
                Open
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
