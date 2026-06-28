import React, { useState } from 'react';
import {
  ACTION_CATEGORIES,
  PERMISSION_LEVEL_LABELS,
  RISK_LEVEL_COLORS,
  RISK_LEVEL_LABELS,
  loadPermissions,
  revokePermission,
  setPermission,
  type PermissionLevel,
} from '~/lib/zouk/agentPermissions';

type Tab = 'agents' | 'permissions';

interface AgentCard {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: 'not-wired' | 'beta-foundation' | 'connected';
  categoryId: string;
  riskLevel: 'low' | 'medium' | 'high';
  statusNote: string;
}

const AGENT_CARDS: AgentCard[] = [
  {
    id: 'browser-agent',
    name: 'Browser Agent',
    icon: '🌐',
    description: 'Navigates websites, reads page content, and prepares form-filling actions in a controlled session.',
    status: 'beta-foundation',
    categoryId: 'browser-navigation',
    riskLevel: 'medium',
    statusNote:
      'Backend action required — browser automation will be wired through a Playwright backend in a later pass.',
  },
  {
    id: 'github-builder',
    name: 'GitHub Builder Agent',
    icon: '🐙',
    description: 'Imports repositories, reads files, and prepares branch and commit actions for connected repos.',
    status: 'beta-foundation',
    categoryId: 'github-repo-import',
    riskLevel: 'low',
    statusNote: 'Repo import is wired. File loading and commit actions require GitHub API connection.',
  },
  {
    id: 'file-organizer',
    name: 'File Organizer',
    icon: '🗂️',
    description: 'Organizes files in Downloads, Desktop, and local project folders. Creates folders and renames files.',
    status: 'beta-foundation',
    categoryId: 'local-file-organization',
    riskLevel: 'medium',
    statusNote: 'Native desktop permissions required. Will be wired through the desktop/Electron layer.',
  },
  {
    id: 'deployment-agent',
    name: 'Deployment Agent',
    icon: '🚀',
    description: 'Deploys projects to Vercel, Netlify, Railway, and Render through connected accounts.',
    status: 'not-wired',
    categoryId: 'github-branch-commit',
    riskLevel: 'high',
    statusNote: 'Backend action required — deployment agent will be wired after connector integrations are complete.',
  },
  {
    id: 'desktop-agent',
    name: 'Desktop Agent',
    icon: '🖥️',
    description: 'Opens apps, manages windows, and performs desktop-level tasks with explicit permission.',
    status: 'not-wired',
    categoryId: 'system-settings',
    riskLevel: 'high',
    statusNote:
      'Native agent required — full desktop control requires native desktop permissions and the Electron layer.',
  },
];

const STATUS_LABELS: Record<AgentCard['status'], string> = {
  'not-wired': 'Not wired',
  'beta-foundation': 'Beta foundation',
  connected: 'Connected',
};

const STATUS_COLORS: Record<AgentCard['status'], string> = {
  'not-wired': '#3a3a3a',
  'beta-foundation': '#eab308',
  connected: '#22c55e',
};

const STATUS_BG: Record<AgentCard['status'], string> = {
  'not-wired': '#111',
  'beta-foundation': 'rgba(234,179,8,0.08)',
  connected: 'rgba(34,197,94,0.08)',
};

const LEVEL_OPTIONS: { value: PermissionLevel; label: string }[] = [
  { value: 'view-only', label: 'View Only' },
  { value: 'ask-every-time', label: 'Ask Every Time' },
  { value: 'allow-session', label: 'This Session' },
  { value: 'always-allow', label: 'Always Allow' },
];

export function AgentModeScreen() {
  const [tab, setTab] = useState<Tab>('agents');
  const [permissions, setPermissions] = useState(() => loadPermissions());

  const refreshPermissions = () => setPermissions(loadPermissions());

  const handleRevoke = (categoryId: string) => {
    revokePermission(categoryId);
    refreshPermissions();
  };

  const handleSetLevel = (categoryId: string, level: PermissionLevel) => {
    const cat = ACTION_CATEGORIES.find((c) => c.id === categoryId);

    if (cat?.alwaysRequireConfirmation && level === 'always-allow') {
      return; // blocked for high-risk
    }

    setPermission(categoryId, level);
    refreshPermissions();
  };

  const tabStyle = (t: Tab): React.CSSProperties => ({
    padding: '8px 16px',
    background: tab === t ? 'rgba(236,29,46,0.12)' : '#111',
    border: `1px solid ${tab === t ? '#ec1d2e' : '#1e1e1e'}`,
    borderRadius: 8,
    color: tab === t ? '#ec1d2e' : '#b5b5b5',
    fontWeight: 500,
    cursor: 'pointer',
    fontSize: 13,
  });

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
      <div style={{ maxWidth: 1100 }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'rgba(236,29,46,0.12)',
                border: '1px solid rgba(236,29,46,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}
            >
              🤖
            </div>
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: '#fff', margin: 0 }}>Agent Mode</h2>
              <p style={{ color: '#6a6a6a', fontSize: 12, margin: '2px 0 0' }}>
                Permission-based AI operators for browser, file, and GitHub tasks
              </p>
            </div>
          </div>
          <div
            style={{
              padding: '10px 14px',
              background: '#0d0d0d',
              border: '1px solid #1a1a1a',
              borderRadius: 8,
              fontSize: 12,
              color: '#6a6a6a',
              lineHeight: 1.5,
            }}
          >
            Agent Mode lets Zouk prepare and execute actions on your behalf — with your explicit permission at every
            step. Beta permissions are stored locally until backend account sync is added.
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          <button onClick={() => setTab('agents')} style={tabStyle('agents')}>
            Builder Agents
          </button>
          <button onClick={() => setTab('permissions')} style={tabStyle('permissions')}>
            Permissions
          </button>
        </div>

        {/* AGENTS TAB */}
        {tab === 'agents' && (
          <div style={{ animation: 'fadeIn .3s ease-out' }}>
            <p style={{ color: '#9a9a9a', fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
              Each agent handles a specific class of action. Agents marked{' '}
              <strong style={{ color: '#eab308' }}>Beta foundation</strong> have their permission and approval
              architecture wired — execution backends will be connected in later passes.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: 16,
                marginBottom: 32,
              }}
            >
              {AGENT_CARDS.map((agent) => (
                <div
                  key={agent.id}
                  style={{
                    background: '#0a0a0a',
                    border: '1px solid #1a1a1a',
                    borderRadius: 12,
                    padding: 18,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 24 }}>{agent.icon}</span>
                      <p style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>{agent.name}</p>
                    </div>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 999,
                        background: STATUS_BG[agent.status],
                        color: STATUS_COLORS[agent.status],
                        fontSize: 10,
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        border: `1px solid ${STATUS_COLORS[agent.status]}44`,
                        flexShrink: 0,
                      }}
                    >
                      {STATUS_LABELS[agent.status]}
                    </span>
                  </div>

                  <p style={{ fontSize: 13, color: '#9a9a9a', marginBottom: 12, lineHeight: 1.4 }}>
                    {agent.description}
                  </p>

                  <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                    <div>
                      <span
                        style={{
                          fontSize: 10,
                          color: '#555',
                          display: 'block',
                          marginBottom: 2,
                          fontWeight: 600,
                          letterSpacing: '0.5px',
                        }}
                      >
                        PERMISSION
                      </span>
                      <span style={{ fontSize: 11, color: '#b5b5b5' }}>
                        {PERMISSION_LEVEL_LABELS[permissions[agent.categoryId]?.level ?? 'ask-every-time']}
                      </span>
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: 10,
                          color: '#555',
                          display: 'block',
                          marginBottom: 2,
                          fontWeight: 600,
                          letterSpacing: '0.5px',
                        }}
                      >
                        RISK
                      </span>
                      <span style={{ fontSize: 11, color: RISK_LEVEL_COLORS[agent.riskLevel], fontWeight: 600 }}>
                        {RISK_LEVEL_LABELS[agent.riskLevel]}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '8px 10px',
                      background: '#060606',
                      border: '1px solid #1a1a1a',
                      borderRadius: 6,
                      fontSize: 11,
                      color: '#5a5a5a',
                      lineHeight: 1.4,
                    }}
                  >
                    {agent.statusNote}
                  </div>
                </div>
              ))}
            </div>

            {/* Architecture notes */}
            <div
              style={{
                background: '#0a0a0a',
                border: '1px solid #1a1a1a',
                borderRadius: 12,
                padding: 20,
              }}
            >
              <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Architecture Notes</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  'Full desktop control requires native desktop permissions and will be wired through the desktop/Electron layer.',
                  'Browser automation requires a browser automation backend such as Playwright and will be wired in a later pass.',
                  'GitHub file loading and commit actions require a verified GitHub connector with API access.',
                  'All agent actions go through the permission system — high-risk actions always require per-action confirmation.',
                ].map((note, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: '#ec1d2e', fontSize: 12, flexShrink: 0, marginTop: 1 }}>→</span>
                    <p style={{ fontSize: 12, color: '#6a6a6a', lineHeight: 1.5 }}>{note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PERMISSIONS TAB */}
        {tab === 'permissions' && (
          <div style={{ animation: 'fadeIn .3s ease-out' }}>
            <div
              style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}
            >
              <div>
                <p style={{ color: '#b5b5b5', fontSize: 13, marginBottom: 4 }}>
                  Control what Zouk is allowed to do for each action category.
                </p>
                <p style={{ color: '#6a6a6a', fontSize: 12 }}>
                  Beta permissions are stored locally in your browser. Backend account sync will replace this later.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ACTION_CATEGORIES.map((cat) => {
                const entry = permissions[cat.id];
                const currentLevel: PermissionLevel = entry?.level ?? 'ask-every-time';
                const isHighRisk = cat.alwaysRequireConfirmation;

                return (
                  <div
                    key={cat.id}
                    style={{
                      background: '#0a0a0a',
                      border: `1px solid ${isHighRisk ? 'rgba(239,68,68,0.15)' : '#1a1a1a'}`,
                      borderRadius: 10,
                      padding: '14px 16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <p style={{ fontWeight: 600, color: '#e8e8e8', fontSize: 13 }}>{cat.label}</p>
                          <span
                            style={{
                              fontSize: 10,
                              padding: '1px 6px',
                              borderRadius: 999,
                              background: `${RISK_LEVEL_COLORS[cat.riskLevel]}18`,
                              color: RISK_LEVEL_COLORS[cat.riskLevel],
                              fontWeight: 600,
                            }}
                          >
                            {RISK_LEVEL_LABELS[cat.riskLevel]} risk
                          </span>
                          {isHighRisk && <span style={{ fontSize: 10, color: '#555' }}>· Always confirmed</span>}
                        </div>
                        <p style={{ fontSize: 12, color: '#6a6a6a', lineHeight: 1.4 }}>{cat.description}</p>
                      </div>

                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        {LEVEL_OPTIONS.map((opt) => {
                          const isAlwaysAllow = opt.value === 'always-allow';
                          const blocked = isHighRisk && isAlwaysAllow;
                          const active = currentLevel === opt.value;

                          return (
                            <button
                              key={opt.value}
                              disabled={blocked}
                              onClick={() => !blocked && handleSetLevel(cat.id, opt.value)}
                              title={blocked ? 'Cannot permanently allow high-risk actions' : undefined}
                              style={{
                                padding: '5px 10px',
                                background: active ? 'rgba(236,29,46,0.12)' : '#111',
                                border: `1px solid ${active ? '#ec1d2e' : blocked ? '#1a1a1a' : '#2a2a2a'}`,
                                borderRadius: 6,
                                color: active ? '#ec1d2e' : blocked ? '#2a2a2a' : '#777',
                                fontSize: 11,
                                fontWeight: active ? 600 : 400,
                                cursor: blocked ? 'not-allowed' : 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all .15s',
                              }}
                            >
                              {opt.label}
                            </button>
                          );
                        })}

                        {entry && (
                          <button
                            onClick={() => handleRevoke(cat.id)}
                            style={{
                              padding: '5px 10px',
                              background: 'transparent',
                              border: '1px solid rgba(239,68,68,0.25)',
                              borderRadius: 6,
                              color: '#ef4444',
                              fontSize: 11,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              style={{
                marginTop: 24,
                padding: '12px 16px',
                background: '#0a0a0a',
                border: '1px solid #1a1a1a',
                borderRadius: 10,
                fontSize: 12,
                color: '#555',
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: '#6a6a6a' }}>High-risk actions</strong> (Local File Modification, System Settings)
              always require per-action confirmation and cannot be set to "Always Allow" — even in Agent Mode.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
