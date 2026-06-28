import React, { useState } from 'react';

interface Props {
  onComplete: (name: string, email: string, openrouterKey: string) => void;
}

export function OnboardingOverlay({ onComplete }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const step1Ready = name.trim().length > 0 && email.includes('@');
  const step2Ready = apiKey.trim().length > 10;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    background: '#0a0a0a',
    border: '1px solid #1c1c1c',
    borderRadius: 8,
    color: '#e8e8e8',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const btnStyle = (enabled: boolean): React.CSSProperties => ({
    width: '100%',
    padding: 14,
    background: enabled ? 'rgba(236,29,46,0.12)' : '#1a1a1a',
    border: `1px solid ${enabled ? '#ec1d2e' : '#2a2a2a'}`,
    borderRadius: 10,
    color: enabled ? '#ec1d2e' : '#6a6a6a',
    fontWeight: 600,
    fontSize: 15,
    cursor: enabled ? 'pointer' : 'not-allowed',
    transition: 'all .15s',
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        backdropFilter: 'blur(6px)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 440, padding: '40px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <img
            src="/zouk-logo.png"
            style={{ width: 100, height: 'auto', objectFit: 'contain', marginBottom: 16 }}
            alt="Zouk"
          />
          {step === 1 ? (
            <>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Welcome to Zouk</h1>
              <p style={{ color: '#b5b5b5', fontSize: 15 }}>
                AI-powered workstation for building campaigns, apps, and automations
              </p>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Connect your AI</h1>
              <p style={{ color: '#b5b5b5', fontSize: 14 }}>
                Enter your OpenRouter API key to unlock all models. You can update this anytime in Settings.
              </p>
            </>
          )}
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
          {[1, 2].map((s) => (
            <div
              key={s}
              style={{
                width: s === step ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: s === step ? '#ec1d2e' : s < step ? 'rgba(236,29,46,0.4)' : '#2a2a2a',
                transition: 'all .3s',
              }}
            />
          ))}
        </div>

        {step === 1 && (
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#e8e8e8', marginBottom: 8, fontSize: 14 }}>
              Full name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              style={{ ...inputStyle, marginBottom: 14 }}
            />
            <label style={{ display: 'block', fontWeight: 600, color: '#e8e8e8', marginBottom: 8, fontSize: 14 }}>
              Work email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              style={inputStyle}
            />
          </div>
        )}

        {step === 2 && (
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#e8e8e8', marginBottom: 8, fontSize: 14 }}>
              OpenRouter API Key
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-..."
                style={{ ...inputStyle, paddingRight: 44 }}
                autoFocus
              />
              <button
                onClick={() => setShowKey((v) => !v)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#6a6a6a',
                  cursor: 'pointer',
                  fontSize: 14,
                  padding: 0,
                }}
              >
                {showKey ? '🙈' : '👁'}
              </button>
            </div>
            <p style={{ fontSize: 12, color: '#6a6a6a', marginTop: 8 }}>
              Get your key at openrouter.ai/keys — it&apos;s free to start.
            </p>
            <button
              onClick={() => onComplete(name.trim(), email.trim(), '')}
              style={{
                background: 'none',
                border: 'none',
                color: '#6a6a6a',
                fontSize: 12,
                cursor: 'pointer',
                marginTop: 8,
                padding: 0,
                textDecoration: 'underline',
              }}
            >
              Skip for now — I&apos;ll add it in Settings
            </button>
          </div>
        )}

        {step === 1 && (
          <button onClick={() => step1Ready && setStep(2)} disabled={!step1Ready} style={btnStyle(step1Ready)}>
            Continue →
          </button>
        )}

        {step === 2 && (
          <button
            onClick={() => step2Ready && onComplete(name.trim(), email.trim(), apiKey.trim())}
            disabled={!step2Ready}
            style={btnStyle(step2Ready)}
          >
            Start Building
          </button>
        )}
      </div>
    </div>
  );
}
