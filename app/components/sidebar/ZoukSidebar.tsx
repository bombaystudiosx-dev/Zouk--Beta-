import React from 'react';

const NAV_MAIN = [
  {
    key: 'skills-agents',
    label: 'Skills / Agents',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    key: 'builder-workshop',
    label: 'Builder',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="8" height="8" />
        <rect x="13" y="3" width="8" height="8" />
        <rect x="3" y="13" width="8" height="8" />
        <rect x="13" y="13" width="8" height="8" />
      </svg>
    ),
  },
  {
    key: 'library',
    label: 'Library',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
];

const NAV_PROJECTS = [
  {
    key: 'projects',
    label: 'New Project',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 12h6m-6 4h6M5 8h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z" />
      </svg>
    ),
  },
];

const NAV_TASKS = [
  {
    key: 'tasks',
    label: 'All Tasks',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'connectors',
    label: 'Connectors',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="6" cy="6" r="3" />
        <circle cx="18" cy="6" r="3" />
        <circle cx="12" cy="18" r="3" />
        <line x1="9" y1="8" x2="15" y2="14" />
        <line x1="15" y1="8" x2="9" y2="14" />
      </svg>
    ),
  },
];

interface Props {
  section: string;
  onSection: (s: string) => void;
  userName?: string;
}

function NavButton({
  item,
  active,
  onClick,
}: {
  item: { key: string; label: string; icon: React.ReactNode };
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '12px 8px',
        background: active ? 'rgba(236,29,46,0.08)' : 'transparent',
        border: 'none',
        color: active ? '#ec1d2e' : '#b5b5b5',
        textAlign: 'left',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderRadius: 8,
        marginBottom: 4,
        transition: 'all .15s',
      }}
    >
      {item.icon}
      <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>
    </button>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{ margin: '12px 0', padding: '0 8px' }}>
      <p
        style={{ fontSize: 12, fontWeight: 600, color: '#6a6a6a', textTransform: 'uppercase', letterSpacing: '0.5px' }}
      >
        {children}
      </p>
    </div>
  );
}

export function ZoukSidebar({ section, onSection, userName = 'Workspace' }: Props) {
  const initial = userName.charAt(0).toUpperCase();
  return (
    <div
      style={{
        width: 240,
        background: '#0a0a0a',
        borderRight: '1px solid #1a1a1a',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10,
        flexShrink: 0,
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* New Chat */}
      <div style={{ padding: '12px 8px' }}>
        <button
          onClick={() => onSection('home')}
          style={{
            width: '100%',
            padding: 12,
            background: 'rgba(236,29,46,0.12)',
            border: '1px solid #ec1d2e',
            borderRadius: 8,
            color: '#ec1d2e',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all .15s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          New Chat
        </button>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
        {NAV_MAIN.map((item) => (
          <NavButton key={item.key} item={item} active={section === item.key} onClick={() => onSection(item.key)} />
        ))}

        <SectionLabel>PROJECTS</SectionLabel>
        {NAV_PROJECTS.map((item) => (
          <NavButton key={item.key} item={item} active={section === item.key} onClick={() => onSection(item.key)} />
        ))}

        <SectionLabel>ALL TASKS</SectionLabel>
        {NAV_TASKS.map((item) => (
          <NavButton key={item.key} item={item} active={section === item.key} onClick={() => onSection(item.key)} />
        ))}
      </div>

      {/* Settings */}
      <div style={{ padding: 8, borderTop: '1px solid #1a1a1a' }}>
        <NavButton
          item={{
            key: 'settings',
            label: 'Settings',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m2.12 2.12l4.24 4.24M1 12h6m6 0h6m-16.78 7.78l4.24-4.24m2.12-2.12l4.24-4.24" />
              </svg>
            ),
          }}
          active={section === 'settings'}
          onClick={() => onSection('settings')}
        />
      </div>

      {/* User card */}
      <div
        style={{
          padding: 12,
          borderTop: '1px solid #1a1a1a',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ec1d2e, #ff5664)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          {initial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontWeight: 600,
              color: '#e8e8e8',
              fontSize: 13,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {userName}
          </p>
          <p style={{ fontSize: 12, color: '#6a6a6a' }}>Alpha</p>
        </div>
      </div>
    </div>
  );
}
