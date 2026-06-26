import React, { useState } from 'react';

interface SkillAgent {
  name: string;
  type: 'skill' | 'agent';
  category: string;
  description: string;
}

const DEMO_ITEMS: SkillAgent[] = [
  {
    name: 'Ad Copy Writer',
    type: 'skill',
    category: 'Marketing',
    description: 'Writes high-converting ad copy for Meta, Google, and TikTok campaigns.',
  },
  {
    name: 'Campaign Planner',
    type: 'agent',
    category: 'Marketing',
    description: 'Plans end-to-end campaign structures with timelines and budgets.',
  },
  {
    name: 'SEO Optimizer',
    type: 'skill',
    category: 'Content',
    description: 'Analyzes and optimizes content for search engine ranking.',
  },
  {
    name: 'Email Automator',
    type: 'agent',
    category: 'Automation',
    description: 'Builds automated email sequences based on user behavior triggers.',
  },
];

const FILTERS = ['all', 'skills', 'agents'] as const;

interface Props {
  onUseInChat: (prompt: string) => void;
}

export function SkillsAgentsScreen({ onUseInChat }: Props) {
  const [filter, setFilter] = useState<'all' | 'skills' | 'agents'>('all');
  const [items, setItems] = useState<SkillAgent[]>(DEMO_ITEMS);

  const displayed = items.filter(
    (i) => filter === 'all' || (filter === 'skills' ? i.type === 'skill' : i.type === 'agent'),
  );

  const handleDelete = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const tabStyle = (active: boolean) =>
    ({
      padding: '10px 16px',
      background: active ? 'rgba(236,29,46,0.12)' : '#1a1a1a',
      border: `1px solid ${active ? '#ec1d2e' : '#2a2a2a'}`,
      borderRadius: 8,
      color: active ? '#ec1d2e' : '#b5b5b5',
      fontWeight: 500,
      cursor: 'pointer',
      fontSize: 13,
    }) as React.CSSProperties;

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
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Skills &amp; Agents</h2>
        <p style={{ color: '#b5b5b5', marginBottom: 28 }}>
          Create, upload, and manage markdown-based skills and agents
        </p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={tabStyle(filter === f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button
            onClick={() =>
              setItems((prev) => [
                { name: 'New Skill', type: 'skill', category: 'General', description: 'Edit this skill description.' },
                ...prev,
              ])
            }
            style={tabStyle(false)}
          >
            + Create Skill
          </button>
          <button
            onClick={() =>
              setItems((prev) => [
                { name: 'New Agent', type: 'agent', category: 'General', description: 'Edit this agent description.' },
                ...prev,
              ])
            }
            style={tabStyle(false)}
          >
            + Create Agent
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {displayed.map((item, idx) => (
            <div
              key={idx}
              style={{
                background: '#0a0a0a',
                border: '1px solid #1a1a1a',
                borderRadius: 12,
                padding: 16,
                animation: 'fadeIn .3s ease-out',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}
              >
                <div>
                  <p style={{ fontWeight: 600, color: '#fff', marginBottom: 4 }}>{item.name}</p>
                  <p style={{ fontSize: 12, color: '#6a6a6a' }}>
                    {item.type === 'skill' ? 'Skill' : 'Agent'} · {item.category}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => handleDelete(idx)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: '#1a1a1a',
                      border: 'none',
                      color: '#b5b5b5',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#9a9a9a', marginBottom: 12, lineHeight: 1.4 }}>{item.description}</p>
              <button
                onClick={() => onUseInChat(`Use the ${item.name} ${item.type} to `)}
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
                Use in Chat
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
