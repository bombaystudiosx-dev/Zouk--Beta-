import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import { useState, useRef } from 'react';
import { ConnectionCenter } from '~/components/zouk/ConnectionCenter';

export function Header() {
  const chat = useStore(chatStore);
  const [ccOpen, setCcOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

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
        <img src="/zouk-logo.png" alt="ZOUK" style={{ width: 80 }} />
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
          {/* Connection Center trigger */}
          <div style={{ position: 'relative' }}>
            <button
              ref={btnRef}
              onClick={() => setCcOpen((v) => !v)}
              title="Connection Center"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: `1px solid ${ccOpen ? '#ec1d2e' : '#2a2a2a'}`,
                background: ccOpen ? 'rgba(236,29,46,0.08)' : '#0e0e0e',
                color: ccOpen ? '#ec1d2e' : '#cfcfcf',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all .15s',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="6" cy="12" r="1.6" />
                <circle cx="12" cy="12" r="1.6" />
                <circle cx="18" cy="12" r="1.6" />
              </svg>
            </button>
            <ConnectionCenter open={ccOpen} onClose={() => setCcOpen(false)} anchorRef={btnRef} />
          </div>
        </>
      )}
    </header>
  );
}
