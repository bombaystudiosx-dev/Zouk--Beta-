import React, { useState, useRef } from 'react';

type Tab = 'profile' | 'user-flows' | 'ai-models' | 'workspace';

interface UserFlow {
  name: string;
  description: string;
}

interface Props {
  userName: string;
  userEmail: string;
  onSaveProfile: (name: string, email: string) => void;
  onNavigate: (section: string) => void;
}

const DEMO_FLOWS: UserFlow[] = [
  { name: 'Ad Creator', description: 'Creates ad copy and creative briefs for social campaigns.' },
  { name: 'Content Writer', description: 'Generates blog posts, emails, and landing page copy.' },
];

export function SettingsScreen({ userName, userEmail, onSaveProfile, onNavigate }: Props) {
  const [tab, setTab] = useState<Tab>('profile');
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [flows, setFlows] = useState<UserFlow[]>(DEMO_FLOWS);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [betaEnabled, setBetaEnabled] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const tabStyle = (t: Tab) =>
    ({
      padding: '10px 16px',
      background: tab === t ? 'rgba(236,29,46,0.12)' : 'transparent',
      border: `1px solid ${tab === t ? '#ec1d2e' : 'transparent'}`,
      borderRadius: 6,
      color: tab === t ? '#ec1d2e' : '#b5b5b5',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all .15s',
      fontSize: 13,
    }) as React.CSSProperties;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    background: '#0a0a0a',
    border: '1px solid #1c1c1c',
    borderRadius: 8,
    color: '#e8e8e8',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const tempLabel =
    temperature < 0.33 ? 'Precise & factual' : temperature < 0.67 ? 'Balanced' : 'Creative & exploratory';

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
      <div style={{ maxWidth: 900 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 28 }}>Settings</h2>

        <div
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 32,
            borderBottom: '1px solid #1a1a1a',
            paddingBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          {(['profile', 'user-flows', 'ai-models', 'workspace'] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={tabStyle(t)}>
              {t === 'profile'
                ? 'Profile'
                : t === 'user-flows'
                  ? 'User Flows'
                  : t === 'ai-models'
                    ? 'AI Models'
                    : 'Workspace'}
            </button>
          ))}
        </div>

        {/* PROFILE */}
        {tab === 'profile' && (
          <div style={{ animation: 'fadeIn .3s ease-out' }}>
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Profile Photo</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ec1d2e, #ff5664)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 28,
                    flexShrink: 0,
                  }}
                >
                  {name.charAt(0).toUpperCase() || 'Z'}
                </div>
                <div>
                  <p style={{ fontSize: 13, color: '#b5b5b5', marginBottom: 8 }}>Upload a new profile picture</p>
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(236,29,46,0.12)',
                      border: '1px solid #ec1d2e',
                      borderRadius: 6,
                      color: '#ec1d2e',
                      fontWeight: 500,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    Change Photo
                  </button>
                  <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#fff', marginBottom: 8, fontSize: 14 }}>
                Full Name
              </label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#fff', marginBottom: 8, fontSize: 14 }}>
                Email Address
              </label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
            </div>

            <button
              onClick={() => onSaveProfile(name, email)}
              style={{
                padding: '12px 24px',
                background: 'rgba(236,29,46,0.12)',
                border: '1px solid #ec1d2e',
                borderRadius: 8,
                color: '#ec1d2e',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Save Changes
            </button>
          </div>
        )}

        {/* USER FLOWS */}
        {tab === 'user-flows' && (
          <div style={{ animation: 'fadeIn .3s ease-out' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 8 }}>User Flow Profiles</h3>
            <p style={{ fontSize: 13, color: '#9a9a9a', marginBottom: 20 }}>
              Create and manage user personas and their workflows
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 16,
                marginBottom: 24,
              }}
            >
              {flows.map((flow, i) => (
                <div
                  key={i}
                  style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 12, padding: 16 }}
                >
                  <p style={{ fontWeight: 600, color: '#fff', marginBottom: 4, fontSize: 14 }}>{flow.name}</p>
                  <p style={{ fontSize: 12, color: '#6a6a6a', marginBottom: 12 }}>{flow.description}</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      style={{
                        flex: 1,
                        padding: 8,
                        background: '#1a1a1a',
                        border: '1px solid #2a2a2a',
                        borderRadius: 6,
                        color: '#b5b5b5',
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setFlows((prev) => prev.filter((_, idx) => idx !== i))}
                      style={{
                        flex: 1,
                        padding: 8,
                        background: '#1a1a1a',
                        border: '1px solid #2a2a2a',
                        borderRadius: 6,
                        color: '#ff5664',
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setFlows((prev) => [...prev, { name: 'New Flow', description: 'Describe this flow...' }])}
              style={{
                padding: '12px 24px',
                background: 'rgba(236,29,46,0.12)',
                border: '1px solid #ec1d2e',
                borderRadius: 8,
                color: '#ec1d2e',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              + New User Flow
            </button>
          </div>
        )}

        {/* AI MODELS */}
        {tab === 'ai-models' && (
          <div style={{ animation: 'fadeIn .3s ease-out' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 8 }}>AI Model Settings</h3>
            <p style={{ fontSize: 13, color: '#9a9a9a', marginBottom: 24 }}>
              Configure custom model responses and behavior
            </p>

            <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #1a1a1a' }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#fff', marginBottom: 8, fontSize: 14 }}>
                Temperature (Creativity)
              </label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                style={{ width: '100%', marginBottom: 8, cursor: 'pointer', accentColor: '#ec1d2e' }}
              />
              <p style={{ fontSize: 12, color: '#6a6a6a' }}>
                {temperature.toFixed(1)} — {tempLabel}
              </p>
            </div>

            <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #1a1a1a' }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#fff', marginBottom: 8, fontSize: 14 }}>
                Max Response Length
              </label>
              <input
                type="number"
                min={256}
                max={8000}
                step={256}
                value={maxTokens}
                onChange={(e) => setMaxTokens(Number(e.target.value))}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontWeight: 600, color: '#fff', marginBottom: 8, fontSize: 14 }}>
                System Prompt
              </label>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Define the model's behavior and response style..."
                style={{ ...inputStyle, minHeight: 120, fontFamily: 'monospace', resize: 'vertical' }}
              />
            </div>

            <button
              style={{
                padding: '12px 24px',
                background: 'rgba(236,29,46,0.12)',
                border: '1px solid #ec1d2e',
                borderRadius: 8,
                color: '#ec1d2e',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Save AI Settings
            </button>
          </div>
        )}

        {/* WORKSPACE */}
        {tab === 'workspace' && (
          <div style={{ animation: 'fadeIn .3s ease-out' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Workspace Settings</h3>

            <div style={{ marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid #1a1a1a' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Features</h3>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={betaEnabled}
                  onChange={(e) => setBetaEnabled(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#ec1d2e' }}
                />
                <span style={{ color: '#b5b5b5', fontSize: 14 }}>Enable Beta Features</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#ec1d2e' }}
                />
                <span style={{ color: '#b5b5b5', fontSize: 14 }}>Share usage analytics</span>
              </label>
            </div>

            <div style={{ marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid #1a1a1a' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Connected Tools</h3>
              <p style={{ fontSize: 13, color: '#9a9a9a', marginBottom: 12 }}>Manage your integrations</p>
              <button
                onClick={() => onNavigate('connectors')}
                style={{
                  padding: '10px 16px',
                  background: 'rgba(236,29,46,0.12)',
                  border: '1px solid #ec1d2e',
                  borderRadius: 8,
                  color: '#ec1d2e',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                Go to Connectors
              </button>
            </div>

            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#ff5664', marginBottom: 12 }}>Danger Zone</h3>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                style={{
                  padding: '10px 16px',
                  background: 'rgba(255,86,100,0.12)',
                  border: '1px solid #ff5664',
                  borderRadius: 8,
                  color: '#ff5664',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                Reset All Local Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
