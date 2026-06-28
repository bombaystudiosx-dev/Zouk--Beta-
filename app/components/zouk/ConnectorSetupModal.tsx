import React, { useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import type { Connector } from '~/lib/zouk/connectorRegistry';
import type { ConnectorAccountInfo, ConnectorRuntimeState } from '~/lib/zouk/connectorState';

interface Props {
  connector: Connector | null;
  runtime?: ConnectorRuntimeState;
  onClose: () => void;
  onConnected: (connector: Connector, credential?: string, account?: ConnectorAccountInfo) => void;
}

type VerifyState = 'idle' | 'loading' | 'success' | 'error';

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

/** Persist OpenRouter key into the existing chat API-key cookie. */
function saveOpenRouterKey(credential: string) {
  if (!credential.trim()) {
    return;
  }

  try {
    const current = JSON.parse(Cookies.get('apiKeys') || '{}') as Record<string, string>;
    Cookies.set('apiKeys', JSON.stringify({ ...current, OpenRouter: credential.trim() }), { expires: 365 });
  } catch {
    Cookies.set('apiKeys', JSON.stringify({ OpenRouter: credential.trim() }), { expires: 365 });
  }
}

/** Persist a generic API key in the cookie store under a normalised key. */
function saveGenericKey(connectorId: string, credential: string) {
  if (!credential.trim()) {
    return;
  }

  const keyName = connectorId.charAt(0).toUpperCase() + connectorId.slice(1);

  try {
    const current = JSON.parse(Cookies.get('apiKeys') || '{}') as Record<string, string>;
    Cookies.set('apiKeys', JSON.stringify({ ...current, [keyName]: credential.trim() }), { expires: 365 });
  } catch {
    // ignore
  }
}

type DeviceFlowState = 'idle' | 'starting' | 'waiting' | 'polling' | 'done' | 'error';

interface DeviceFlowStartResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  interval: number;
  expires_in: number;
}

interface DeviceFlowPollResponse {
  access_token?: string;
  error?: string;
}

export function ConnectorSetupModal({ connector, runtime, onClose, onConnected }: Props) {
  const [credential, setCredential] = useState('');
  const [extra, setExtra] = useState(''); // e.g. Supabase project URL
  const [showCredential, setShowCredential] = useState(false);
  const [verifyState, setVerifyState] = useState<VerifyState>('idle');
  const [verifyError, setVerifyError] = useState('');
  const [account, setAccount] = useState<ConnectorAccountInfo | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  // GitHub Device Flow state
  const [dfState, setDfState] = useState<DeviceFlowState>('idle');
  const [dfCode, setDfCode] = useState('');
  const [dfUrl, setDfUrl] = useState('');
  const [dfError, setDfError] = useState('');
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const deviceCodeRef = useRef('');
  const pollIntervalRef = useRef(5);

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  useEffect(() => {
    setCredential('');
    setExtra('');
    setShowCredential(false);
    setVerifyState('idle');
    setVerifyError('');
    setAccount(undefined);
    setDfState('idle');
    setDfCode('');
    setDfUrl('');
    setDfError('');
    stopPolling();
  }, [connector?.id]);

  useEffect(() => {
    return () => stopPolling();
  }, []);

  useEffect(() => {
    // Small delay so modal animation settles first
    const t = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, [connector?.id]);

  if (!connector) {
    return null;
  }

  const isGitHub = connector.id === 'github';

  const schedulePoll = (deviceCode: string, intervalSec: number) => {
    pollTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/github/device-flow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'poll', deviceCode }),
        });
        const data = (await res.json()) as DeviceFlowPollResponse;

        if (data.access_token) {
          saveGenericKey('github', data.access_token);
          setDfState('done');
          onConnected(connector, data.access_token, { name: 'GitHub', login: 'github' });
        } else if (data.error === 'slow_down') {
          pollIntervalRef.current += 5;
          schedulePoll(deviceCode, pollIntervalRef.current);
        } else if (data.error === 'authorization_pending') {
          schedulePoll(deviceCode, pollIntervalRef.current);
        } else if (data.error === 'expired_token') {
          setDfError('Code expired — click "Try again" to restart.');
          setDfState('error');
        } else if (data.error === 'access_denied') {
          setDfError('Authorization was denied.');
          setDfState('error');
        } else {
          schedulePoll(deviceCode, pollIntervalRef.current);
        }
      } catch {
        schedulePoll(deviceCode, pollIntervalRef.current);
      }
    }, intervalSec * 1000);
  };

  const startDeviceFlow = async () => {
    stopPolling();
    setDfState('starting');
    setDfError('');

    try {
      const res = await fetch('/api/github/device-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });
      const data = (await res.json()) as DeviceFlowStartResponse;
      deviceCodeRef.current = data.device_code;
      pollIntervalRef.current = data.interval + 1;
      setDfCode(data.user_code);
      setDfUrl(data.verification_uri);
      setDfState('waiting');
      schedulePoll(data.device_code, pollIntervalRef.current);
    } catch (err) {
      setDfError(err instanceof Error ? err.message : 'Failed to start — check your connection.');
      setDfState('error');
    }
  };

  const isSupabase = connector.id === 'supabase';
  const isUpstash = connector.id === 'upstash';
  const credentialLabel = connector.authType === 'token' ? 'Access token' : 'API key';
  const hasCredential = credential.trim().length >= 6;
  const canVerify =
    hasCredential &&
    (isSupabase ? extra.trim().startsWith('https://') : true) &&
    (isUpstash ? extra.trim().includes('@') : true);

  const handleVerify = async () => {
    if (!canVerify) {
      return;
    }

    setVerifyState('loading');
    setVerifyError('');
    setAccount(undefined);

    try {
      const res = await fetch('/api/connector/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connector: connector.id,
          credential: credential.trim(),
          extra: extra.trim() || undefined,
        }),
      });

      const data = (await res.json()) as { ok: boolean; account?: ConnectorAccountInfo; error?: string };

      if (data.ok) {
        setVerifyState('success');
        setAccount(data.account);
      } else {
        setVerifyState('error');
        setVerifyError(data.error ?? 'Verification failed');
      }
    } catch (err) {
      setVerifyState('error');
      setVerifyError(err instanceof Error ? err.message : 'Network error — check your connection');
    }
  };

  const handleConnect = () => {
    if (verifyState !== 'success') {
      return;
    }

    if (connector.id === 'openrouter') {
      saveOpenRouterKey(credential);
    } else {
      saveGenericKey(connector.id, credential);
    }

    onConnected(connector, credential, account);
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
          maxWidth: 480,
          background: '#0a0a0a',
          border: '1px solid #242424',
          borderRadius: 14,
          boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
          overflow: 'hidden',
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
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>{connector.icon}</span>
            <div>
              <h3 style={{ color: '#fff', fontSize: 17, fontWeight: 700, margin: 0 }}>Connect {connector.name}</h3>
              <p style={{ color: '#777', fontSize: 12, margin: '3px 0 0' }}>{connector.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#777',
              cursor: 'pointer',
              fontSize: 20,
              lineHeight: 1,
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: 20 }}>
          {/* ── GitHub Device Flow ── */}
          {isGitHub && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {(dfState === 'idle' || dfState === 'error') && (
                <>
                  {dfState === 'error' && (
                    <div
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.25)',
                        borderRadius: 8,
                        fontSize: 13,
                        color: '#fca5a5',
                      }}
                    >
                      {dfError}
                    </div>
                  )}
                  <button
                    onClick={startDeviceFlow}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 10,
                      padding: '13px 16px',
                      background: '#161b22',
                      border: '1px solid #30363d',
                      borderRadius: 10,
                      color: '#e6edf3',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      width: '100%',
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    Sign in with GitHub
                  </button>
                  <p style={{ color: '#555', fontSize: 12, margin: 0, textAlign: 'center' }}>
                    You'll be asked to enter a short code on github.com — no password shared with Zouk.
                  </p>
                </>
              )}

              {dfState === 'starting' && (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#777', fontSize: 13 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 16,
                      height: 16,
                      border: '2px solid #333',
                      borderTopColor: '#ec1d2e',
                      borderRadius: '50%',
                      animation: 'zouk-spin 0.7s linear infinite',
                      marginBottom: 10,
                    }}
                  />
                  <p style={{ margin: 0 }}>Connecting to GitHub…</p>
                </div>
              )}

              {(dfState === 'waiting' || dfState === 'polling') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div
                    style={{
                      background: '#0d1117',
                      border: '1px solid #30363d',
                      borderRadius: 10,
                      padding: '20px 16px',
                      textAlign: 'center',
                    }}
                  >
                    <p
                      style={{
                        color: '#8b949e',
                        fontSize: 12,
                        margin: '0 0 10px',
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                      }}
                    >
                      Your code
                    </p>
                    <div
                      style={{
                        fontSize: 32,
                        fontWeight: 700,
                        letterSpacing: 10,
                        color: '#e6edf3',
                        fontFamily: 'monospace',
                        marginBottom: 14,
                      }}
                    >
                      {dfCode}
                    </div>
                    <a
                      href={dfUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-block',
                        padding: '9px 18px',
                        background: 'rgba(236,29,46,0.12)',
                        border: '1px solid #ec1d2e',
                        borderRadius: 8,
                        color: '#ec1d2e',
                        fontSize: 13,
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      Open github.com/login/device →
                    </a>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#555', fontSize: 12 }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 10,
                        height: 10,
                        border: '2px solid #333',
                        borderTopColor: '#ec1d2e',
                        borderRadius: '50%',
                        animation: 'zouk-spin 0.7s linear infinite',
                        flexShrink: 0,
                      }}
                    />
                    Waiting for you to enter the code and authorize…
                  </div>
                </div>
              )}

              {dfState === 'done' && (
                <div
                  style={{
                    padding: '14px 16px',
                    background: 'rgba(34,197,94,0.08)',
                    border: '1px solid rgba(34,197,94,0.25)',
                    borderRadius: 10,
                    fontSize: 14,
                    color: '#86efac',
                    fontWeight: 600,
                    textAlign: 'center',
                  }}
                >
                  ✓ GitHub connected
                </div>
              )}
            </div>
          )}

          {/* ── Other connectors: API key / token form ── */}
          {!isGitHub && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Upstash email field */}
              {isUpstash && (
                <div>
                  <label style={{ display: 'block', color: '#e8e8e8', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                    Account email
                  </label>
                  <input
                    value={extra}
                    onChange={(e) => {
                      setExtra(e.target.value);
                      setVerifyState('idle');
                    }}
                    type="email"
                    placeholder="you@example.com"
                    style={inputStyle}
                  />
                  <p style={{ color: '#555', fontSize: 12, margin: '6px 0 0' }}>
                    The email you use to log in at console.upstash.com
                  </p>
                </div>
              )}

              {/* Supabase URL field */}
              {isSupabase && (
                <div>
                  <label style={{ display: 'block', color: '#e8e8e8', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                    Project URL
                  </label>
                  <input
                    value={extra}
                    onChange={(e) => {
                      setExtra(e.target.value);
                      setVerifyState('idle');
                    }}
                    type="url"
                    placeholder="https://xxxx.supabase.co"
                    style={inputStyle}
                  />
                  <p style={{ color: '#555', fontSize: 12, margin: '6px 0 0' }}>
                    Found under Project Settings → API → URL
                  </p>
                </div>
              )}

              {/* Credential field */}
              <div>
                <label style={{ display: 'block', color: '#e8e8e8', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                  {isSupabase ? 'Anon / public key' : credentialLabel}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    ref={inputRef}
                    value={credential}
                    onChange={(e) => {
                      setCredential(e.target.value);
                      setVerifyState('idle');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && verifyState === 'idle') {
                        handleVerify();
                      }
                    }}
                    type={showCredential ? 'text' : 'password'}
                    placeholder={
                      connector.id === 'openrouter'
                        ? 'sk-or-...'
                        : connector.id === 'github'
                          ? 'ghp_... or github_pat_...'
                          : connector.id === 'vercel'
                            ? 'your Vercel token'
                            : connector.id === 'supabase'
                              ? 'eyJh... (anon key)'
                              : `Paste ${connector.name} ${credentialLabel.toLowerCase()}`
                    }
                    style={{
                      ...inputStyle,
                      paddingRight: 44,
                      border: `1px solid ${verifyState === 'error' ? '#ef444466' : '#242424'}`,
                    }}
                  />
                  <button
                    onClick={() => setShowCredential((v) => !v)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#777',
                      cursor: 'pointer',
                      fontSize: 14,
                    }}
                    type="button"
                    tabIndex={-1}
                  >
                    {showCredential ? '🙈' : '👁'}
                  </button>
                </div>

                {/* Key hints */}
                {connector.id === 'github' && (
                  <p style={{ color: '#555', fontSize: 12, margin: '6px 0 0' }}>
                    Create a PAT at github.com/settings/tokens — needs <code>repo</code> scope for repo access.
                  </p>
                )}
                {connector.id === 'vercel' && (
                  <p style={{ color: '#555', fontSize: 12, margin: '6px 0 0' }}>
                    Generate at vercel.com/account/tokens — full account scope.
                  </p>
                )}
                {connector.id === 'cloudflare' && (
                  <p style={{ color: '#555', fontSize: 12, margin: '6px 0 0' }}>
                    Create at dash.cloudflare.com/profile/api-tokens — use the Edit Workers template.
                  </p>
                )}
                {connector.id === 'netlify' && (
                  <p style={{ color: '#555', fontSize: 12, margin: '6px 0 0' }}>
                    Create a personal access token at app.netlify.com/user/applications.
                  </p>
                )}
                {connector.id === 'railway' && (
                  <p style={{ color: '#555', fontSize: 12, margin: '6px 0 0' }}>
                    Create a token at railway.app/account/tokens.
                  </p>
                )}
                {connector.id === 'render' && (
                  <p style={{ color: '#555', fontSize: 12, margin: '6px 0 0' }}>
                    Create an API key at dashboard.render.com/u/account/api-keys.
                  </p>
                )}
                {connector.id === 'neon' && (
                  <p style={{ color: '#555', fontSize: 12, margin: '6px 0 0' }}>
                    Create an API key at console.neon.tech/app/settings/api-keys.
                  </p>
                )}
                {connector.id === 'upstash' && (
                  <p style={{ color: '#555', fontSize: 12, margin: '6px 0 0' }}>
                    API key found at console.upstash.com → Account → API Keys.
                  </p>
                )}
                {connector.id === 'clerk' && (
                  <p style={{ color: '#555', fontSize: 12, margin: '6px 0 0' }}>
                    Secret key (sk_test_… or sk_live_…) from dashboard.clerk.com → API Keys.
                  </p>
                )}
                {connector.id === 'resend' && (
                  <p style={{ color: '#555', fontSize: 12, margin: '6px 0 0' }}>
                    Create an API key at resend.com/api-keys.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Verify result banner */}
          {verifyState === 'success' && account && (
            <div
              style={{
                marginTop: 14,
                padding: '10px 14px',
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.25)',
                borderRadius: 8,
                fontSize: 13,
                color: '#86efac',
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: '#22c55e' }}>✓ Verified</strong>
              {account.name && <span style={{ marginLeft: 8 }}>{account.name}</span>}
              {account.login && account.login !== account.name && (
                <span style={{ color: '#555', marginLeft: 6 }}>@{account.login}</span>
              )}
              {account.extra && <div style={{ marginTop: 4, color: '#6a6a6a', fontSize: 12 }}>{account.extra}</div>}
            </div>
          )}

          {verifyState === 'error' && (
            <div
              style={{
                marginTop: 14,
                padding: '10px 14px',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 8,
                fontSize: 13,
                color: '#fca5a5',
              }}
            >
              <strong style={{ color: '#ef4444' }}>✗ Failed:</strong> {verifyError}
            </div>
          )}

          {/* Stored preview */}
          {runtime?.credentialPreview && verifyState === 'idle' && (
            <p style={{ color: '#555', fontSize: 12, marginTop: 12 }}>
              Current saved key: <strong style={{ color: '#777' }}>{runtime.credentialPreview}</strong>
            </p>
          )}

          {/* Actions */}
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
                fontSize: 13,
              }}
            >
              {isGitHub && dfState === 'done' ? 'Close' : 'Cancel'}
            </button>

            {!isGitHub && (
              <>
                {verifyState !== 'success' ? (
                  <button
                    disabled={!canVerify || verifyState === 'loading'}
                    onClick={handleVerify}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      background: canVerify && verifyState !== 'loading' ? 'rgba(236,29,46,0.12)' : '#171717',
                      border: `1px solid ${canVerify && verifyState !== 'loading' ? '#ec1d2e' : '#2a2a2a'}`,
                      borderRadius: 8,
                      color: canVerify && verifyState !== 'loading' ? '#ec1d2e' : '#666',
                      cursor: canVerify && verifyState !== 'loading' ? 'pointer' : 'not-allowed',
                      fontWeight: 700,
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    {verifyState === 'loading' ? (
                      <>
                        <span
                          style={{
                            width: 12,
                            height: 12,
                            border: '2px solid #ec1d2e44',
                            borderTopColor: '#ec1d2e',
                            borderRadius: '50%',
                            animation: 'zouk-spin 0.7s linear infinite',
                            display: 'inline-block',
                          }}
                        />
                        Verifying…
                      </>
                    ) : (
                      'Verify Connection'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleConnect}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      background: 'rgba(34,197,94,0.12)',
                      border: '1px solid rgba(34,197,94,0.4)',
                      borderRadius: 8,
                      color: '#22c55e',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    ✓ Save &amp; Connect
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes zouk-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
