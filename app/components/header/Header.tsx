import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';

const CONNECTOR_BUTTONS = [
  {
    label: 'f',
    title: 'Meta Ads',
    style: { background: '#1877f2', fontWeight: 800, color: '#fff', fontSize: 19, fontFamily: 'Georgia, serif' },
  },
  {
    label: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9">
        <rect x="4" y="4" width="16" height="16" rx="5" />
        <circle cx="12" cy="12" r="3.6" />
        <circle cx="17.2" cy="6.8" r="1" fill="#fff" stroke="none" />
      </svg>
    ),
    title: 'Instagram',
    style: { background: 'linear-gradient(45deg,#feda75,#d62976,#962fbf,#4f5bd5)' },
  },
  {
    label: (
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path d="M12 3l8.5 15h-5L12 11 8.5 18h-5z" fill="#fbbc04" />
        <path d="M12 3l4.2 7.5-4.2 7.5L7.8 10.5z" fill="#34a853" />
        <circle cx="6" cy="16.5" r="2.4" fill="#4285f4" />
      </svg>
    ),
    title: 'YouTube',
    style: { background: '#fff' },
  },
];

export function Header() {
  const chat = useStore(chatStore);

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        height: 'var(--header-height)',
        background: '#060606',
        borderBottom: chat.started ? '1px solid #1a1a1a' : '1px solid transparent',
        gap: 16,
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
        <img src="/logo-dark-styled.png" alt="Zouk" style={{ width: 80 }} />
      </a>

      {chat.started ? (
        <>
          <span
            style={{
              flex: 1,
              textAlign: 'center',
              color: '#e8e8e8',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              padding: '0 16px',
            }}
          >
            <ClientOnly>{() => <ChatDescription />}</ClientOnly>
          </span>
          <ClientOnly>{() => <HeaderActionButtons chatStarted={chat.started} />}</ClientOnly>
        </>
      ) : (
        <>
          <div style={{ flex: 1 }} />
          {/* Connector quick-launch */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {CONNECTOR_BUTTONS.map((btn, i) => (
              <button
                key={i}
                title={btn.title}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  ...btn.style,
                }}
              >
                {typeof btn.label === 'string' ? btn.label : btn.label}
              </button>
            ))}
            <button
              title="All connectors"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: '1px solid #2a2a2a',
                background: '#0e0e0e',
                color: '#cfcfcf',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="6" cy="12" r="1.6" />
                <circle cx="12" cy="12" r="1.6" />
                <circle cx="18" cy="12" r="1.6" />
              </svg>
            </button>
          </div>
        </>
      )}
    </header>
  );
}
