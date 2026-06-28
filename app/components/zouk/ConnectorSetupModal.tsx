import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import type { Connector } from '~/lib/zouk/connectorRegistry';
import type { ConnectorRuntimeState } from '~/lib/zouk/connectorState';

interface Props {
  connector: Connector | null;
  runtime?: ConnectorRuntimeState;
  onClose: () => void;
  onConnected: (connector: Connector, credential?: string) => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  background: '#090909',
  border: '1px solid #242424',
  borderRadius: 8,
  color: '#e8e8e8',
  fontSize: 13,
  outline: 'none',
  boxSizing: 'border-box',
};

function saveProviderCredential(connector: Connector, credential: string) {
  if (connector.id !== 'openrouter' || !credential.trim()) {
    return;
  }

  try {
    const current = JSON.parse(Cookies.get('apiKeys') || '{}') as Record<string, string>;
    Cookies.set('apiKeys', JSON.stringify({ ...current, OpenRouter: credential.trim() }));
  } catch {
    Cookies.set('apiKeys', JSON.stringify({ OpenRouter: credential.trim() }));
  }
}

export function ConnectorSetupModal({ connector, runtime, onClose, onConnected }: Props) {
  const [credential, setCredential] = useState('');
  const [showCredential, setShowCredential] = useState(false);

  useEffect(() => {
    setCredential('');
    setShowCredential(false);
  }, [connector?.id]);

  if (!connector) {
    return null;
  }

  const isOAuth = connector.authType === 'oauth';
  const credentialLabel = connector.authType === 'token' ? 'Access token' : 'API key';
  const canSubmit = isOAuth || credential.trim().length >= 3;

  const handleConnect = () => {
    saveProviderCredential(connector, credential);
    onConnected(connector, credential);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.72)',
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
          maxWidth: 460,
          background: '#0a0a0a',
          border: '1px solid #242424',
          borderRadius: 14,
          boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid #1a1a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>{connector.icon}</span>
            <div>
              <h3 style={{ color: '#fff', fontSize: 17, fontWeight: 700, margin: 0 }}>{connector.name}</h3>
              <p style={{ color: '#777', fontSize: 12, margin: '3px 0 0' }}>{connector.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#777', cursor: 'pointer', fontSize: 18 }}
            aria-label="Close connector setup"
          >
            ×
          </button>
        </div>

        <div style={{ padding: 20 }}>
          {isOAuth ? (
            <div>
              <p style={{ color: '#cfcfcf', fontSize: 13, lineHeight: 1.55, margin: '0 0 14px' }}>
                OAuth is staged for backend wiring. For this beta pass, this will mark {connector.name} as connected
                locally so the UI and workflows can move forward without pretending OAuth is finished.
              </p>
              <div
                style={{
                  background: '#111',
                  border: '1px solid #242424',
                  borderRadius: 10,
                  padding: 12,
                  color: '#777',
                  fontSize: 12,
                  lineHeight: 1.5,
                }}
              >
                Next backend step: create the OAuth callback route, exchange code for token, encrypt/store credentials
                server-side, then replace this beta marker.
              </div>
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', color: '#e8e8e8', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                {credentialLabel}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  value={credential}
                  onChange={(event) => setCredential(event.target.value)}
                  type={showCredential ? 'text' : 'password'}
                  placeholder={
                    connector.id === 'openrouter'
                      ? 'sk-or-...'
                      : `Paste ${connector.name} ${credentialLabel.toLowerCase()}`
                  }
                  style={{ ...inputStyle, paddingRight: 44 }}
                  autoFocus
                />
                <button
                  onClick={() => setShowCredential((value) => !value)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#777',
                    cursor: 'pointer',
                  }}
                  type="button"
                >
                  {showCredential ? '🙈' : '👁'}
                </button>
              </div>
              <p style={{ color: '#777', fontSize: 12, lineHeight: 1.45, margin: '9px 0 0' }}>
                Beta safety: Zouk stores the connection status and a masked preview locally, not the raw secret.
                OpenRouter keys also sync into the existing chat API-key cookie so the model can run.
              </p>
              {runtime?.credentialPreview && (
                <p style={{ color: '#9a9a9a', fontSize: 12, margin: '10px 0 0' }}>
                  Saved preview: <strong>{runtime.credentialPreview}</strong>
                </p>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '10px 12px',
                background: '#121212',
                border: '1px solid #242424',
                borderRadius: 8,
                color: '#aaa',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
            <button
              disabled={!canSubmit}
              onClick={handleConnect}
              style={{
                flex: 1,
                padding: '10px 12px',
                background: canSubmit ? 'rgba(236,29,46,0.12)' : '#171717',
                border: `1px solid ${canSubmit ? '#ec1d2e' : '#2a2a2a'}`,
                borderRadius: 8,
                color: canSubmit ? '#ec1d2e' : '#666',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                fontWeight: 700,
              }}
            >
              {isOAuth ? 'Mark Connected' : 'Save Connection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
