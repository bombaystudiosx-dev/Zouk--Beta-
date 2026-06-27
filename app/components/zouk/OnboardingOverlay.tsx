import React, { useState } from 'react';

interface Props {
  onComplete: (name: string, email: string) => void;
}

export function OnboardingOverlay({ onComplete }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const canStart = name.trim().length > 0 && email.includes('@');

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
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Welcome to Zouk</h1>
          <p style={{ color: '#b5b5b5', fontSize: 15 }}>
            AI-powered workstation for building campaigns, apps, and automations
          </p>
        </div>

        <div style={{ marginBottom: 28 }}>
          <label style={{ display: 'block', fontWeight: 600, color: '#e8e8e8', marginBottom: 8, fontSize: 14 }}>
            Full name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={{
              width: '100%',
              padding: '12px 14px',
              background: '#0a0a0a',
              border: '1px solid #1c1c1c',
              borderRadius: 8,
              color: '#e8e8e8',
              fontSize: 14,
              marginBottom: 14,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />

          <label style={{ display: 'block', fontWeight: 600, color: '#e8e8e8', marginBottom: 8, fontSize: 14 }}>
            Work email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            style={{
              width: '100%',
              padding: '12px 14px',
              background: '#0a0a0a',
              border: '1px solid #1c1c1c',
              borderRadius: 8,
              color: '#e8e8e8',
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          onClick={() => canStart && onComplete(name.trim(), email.trim())}
          disabled={!canStart}
          style={{
            width: '100%',
            padding: 14,
            background: canStart ? 'rgba(236,29,46,0.12)' : '#1a1a1a',
            border: `1px solid ${canStart ? '#ec1d2e' : '#2a2a2a'}`,
            borderRadius: 10,
            color: canStart ? '#ec1d2e' : '#6a6a6a',
            fontWeight: 600,
            fontSize: 15,
            cursor: canStart ? 'pointer' : 'not-allowed',
            transition: 'all .15s',
          }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
