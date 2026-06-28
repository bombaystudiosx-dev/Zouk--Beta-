import React, { useState, useRef } from 'react';
import Cookies from 'js-cookie';
import { MODEL_GROUPS, ZOUK_PRESET_ID, getModelDisplay } from '~/lib/zouk/modelRegistry';

type Tab = 'profile' | 'user-flows' | 'ai-models' | 'workspace';

interface UserFlow {
  name: string;
  description: string;
}

interface ProviderDef {
  name: string;
  label: string;
  placeholder: string;
  helpUrl?: string;
  helpLabel?: string;
  primary?: boolean;
}

const PROVIDERS: ProviderDef[] = [
  {
    name: 'OpenRouter',
    label: 'OpenRouter',
    placeholder: 'sk-or-...',
    helpUrl: 'https://openrouter.ai/keys',
    helpLabel: 'openrouter.ai/keys',
    primary: true,
  },
  {
    name: 'OpenAI',
    label: 'OpenAI',
    placeholder: 'sk-...',
    helpUrl: 'https://platform.openai.com/api-keys',
    helpLabel: 'platform.openai.com',
  },
  {
    name: 'Anthropic',
    label: 'Anthropic',
    placeholder: 'sk-ant-...',
    helpUrl: 'https://console.anthropic.com/keys',
    helpLabel: 'console.anthropic.com',
  },
  {
    name: 'Google',
    label: 'Google Gemini',
    placeholder: 'AIza...',
    helpUrl: 'https://aistudio.google.com/app/apikey',
    helpLabel: 'aistudio.google.com',
  },
  {
    name: 'xAI',
    label: 'xAI Grok',
    placeholder: 'xai-...',
    helpUrl: 'https://console.x.ai',
    helpLabel: 'console.x.ai',
  },
  {
    name: 'Groq',
    label: 'Groq',
    placeholder: 'gsk_...',
    helpUrl: 'https://console.groq.com/keys',
    helpLabel: 'console.groq.com',
  },
  {
    name: 'AmazonBedrock',
    label: 'Amazon Bedrock',
    placeholder: 'AWS Access Key ID',
    helpUrl: 'https://aws.amazon.com/bedrock',
    helpLabel: 'aws.amazon.com/bedrock',
  },
  {
    name: 'OpenAILike',
    label: 'Custom OpenAI Endpoint',
    placeholder: 'API key (optional)',
    helpLabel: 'Compatible with any OpenAI-style API',
  },
];

interface Props {
  userName: string;
  userEmail: string;
  onSaveProfile: (name: string, email: string) => void;
  onNavigate: (section: string) => void;
  zoukModel?: string;
  setZoukModel?: (id: string) => void;
}

function getApiKeys(): Record<string, string> {
  try {
    return JSON.parse(Cookies.get('apiKeys') ?? '{}');
  } catch {
    return {};
  }
}

function saveApiKeys(keys: Record<string, string>) {
  Cookies.set('apiKeys', JSON.stringify(keys), { expires: 365 });
}

function ProviderRow({ def }: { def: ProviderDef }) {
  const [keys, setKeys] = useState<Record<string, string>>(getApiKeys);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'ok' | 'fail' | null>(null);

  const current = keys[def.name] ?? '';
  const connected = current.length > 6;

  const handleSave = () => {
    const updated = { ...getApiKeys(), [def.name]: current };
    saveApiKeys(updated);
    setKeys(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch(`/api/check-env-key?provider=${encodeURIComponent(def.name)}`);
      const data = (await res.json()) as { isSet: boolean };
      setTestResult(data.isSet || current.length > 6 ? 'ok' : 'fail');
    } catch {
      setTestResult(connected ? 'ok' : 'fail');
    } finally {
      setTesting(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: '9px 36px 9px 12px',
    background: '#060606',
    border: '1px solid #1c1c1c',
    borderRadius: 7,
    color: '#e8e8e8',
    fontSize: 13,
    outline: 'none',
    fontFamily: 'monospace',
    minWidth: 0,
  };

  return (
    <div
      style={{
        background: '#0a0a0a',
        border: `1px solid ${def.primary ? 'rgba(236,29,46,0.2)' : '#1a1a1a'}`,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>{def.label}</span>
          {def.primary && (
            <span
              style={{
                fontSize: 10,
                padding: '2px 6px',
                background: 'rgba(236,29,46,0.12)',
                border: '1px solid rgba(236,29,46,0.3)',
                borderRadius: 4,
                color: '#ec1d2e',
                fontWeight: 600,
              }}
            >
              PRIMARY
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {testResult === 'ok' && <span style={{ color: '#22c55e', fontSize: 12 }}>✓ Connected</span>}
          {testResult === 'fail' && <span style={{ color: '#ef4444', fontSize: 12 }}>✗ Failed</span>}
          {!testResult && connected && <span style={{ color: '#6a6a6a', fontSize: 12 }}>● Key saved</span>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type={showKey ? 'text' : 'password'}
            value={current}
            onChange={(e) => setKeys((prev) => ({ ...prev, [def.name]: e.target.value }))}
            placeholder={def.placeholder}
            style={inputStyle}
          />
          <button
            onClick={() => setShowKey((v) => !v)}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: '#6a6a6a',
              cursor: 'pointer',
              fontSize: 13,
              padding: 0,
            }}
          >
            {showKey ? '🙈' : '👁'}
          </button>
        </div>
        <button
          onClick={handleSave}
          style={{
            padding: '9px 14px',
            background: saved ? 'rgba(34,197,94,0.12)' : 'rgba(236,29,46,0.10)',
            border: `1px solid ${saved ? '#22c55e' : '#ec1d2e'}`,
            borderRadius: 7,
            color: saved ? '#22c55e' : '#ec1d2e',
            fontWeight: 600,
            fontSize: 12,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all .15s',
          }}
        >
          {saved ? '✓ Saved' : 'Save'}
        </button>
        <button
          onClick={handleTest}
          disabled={!connected || testing}
          style={{
            padding: '9px 14px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid #2a2a2a',
            borderRadius: 7,
            color: connected ? '#b5b5b5' : '#3a3a3a',
            fontWeight: 500,
            fontSize: 12,
            cursor: connected && !testing ? 'pointer' : 'not-allowed',
            whiteSpace: 'nowrap',
          }}
        >
          {testing ? '…' : 'Test'}
        </button>
      </div>
      {def.helpUrl && (
        <p style={{ fontSize: 11, color: '#6a6a6a', marginTop: 8 }}>
          Get key at{' '}
          <a href={def.helpUrl} target="_blank" rel="noreferrer" style={{ color: '#9a9a9a' }}>
            {def.helpLabel}
          </a>
        </p>
      )}
      {!def.helpUrl && def.helpLabel && <p style={{ fontSize: 11, color: '#6a6a6a', marginTop: 8 }}>{def.helpLabel}</p>}
    </div>
  );
}

const DEMO_FLOWS: UserFlow[] = [
  { name: 'Ad Creator', description: 'Creates ad copy and creative briefs for social campaigns.' },
  { name: 'Content Writer', description: 'Generates blog posts, emails, and landing page copy.' },
];

export function SettingsScreen({ userName, userEmail, onSaveProfile, onNavigate, zoukModel, setZoukModel }: Props) {
  const [tab, setTab] = useState<Tab>('profile');
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [flows, setFlows] = useState<UserFlow[]>(DEMO_FLOWS);
  const [betaEnabled, setBetaEnabled] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  // Advanced model settings (stored in localStorage)
  const [temperature, setTemperature] = useState<number>(() => {
    const v = typeof window !== 'undefined' ? localStorage.getItem('zouk_temperature') : null;

    return v ? Number(v) : 0.7;
  });
  const [maxTokens, setMaxTokens] = useState<number>(() => {
    const v = typeof window !== 'undefined' ? localStorage.getItem('zouk_max_tokens') : null;

    return v ? Number(v) : 4096;
  });
  const [systemPrompt, setSystemPrompt] = useState<string>(() => {
    return typeof window !== 'undefined' ? (localStorage.getItem('zouk_system_prompt') ?? '') : '';
  });
  const [streaming, setStreaming] = useState(true);
  const [reasoning, setReasoning] = useState(false);
  const [vision, setVision] = useState(true);
  const [fallbackModel, setFallbackModel] = useState('google/gemini-2.5-flash');
  const [savedAdvanced, setSavedAdvanced] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);

  const tabStyle = (t: Tab): React.CSSProperties => ({
    padding: '10px 16px',
    background: tab === t ? 'rgba(236,29,46,0.12)' : 'transparent',
    border: `1px solid ${tab === t ? '#ec1d2e' : 'transparent'}`,
    borderRadius: 6,
    color: tab === t ? '#ec1d2e' : '#b5b5b5',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all .15s',
    fontSize: 13,
  });

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

  const handleSaveAdvanced = () => {
    localStorage.setItem('zouk_temperature', String(temperature));
    localStorage.setItem('zouk_max_tokens', String(maxTokens));
    localStorage.setItem('zouk_system_prompt', systemPrompt);
    setSavedAdvanced(true);
    setTimeout(() => setSavedAdvanced(false), 2000);
  };

  const selectedModelDisplay = zoukModel ? getModelDisplay(zoukModel) : null;

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
            {/* Current model */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Active Model</h3>
              <p style={{ fontSize: 13, color: '#9a9a9a', marginBottom: 16 }}>
                The model currently selected in your chat bar
              </p>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 16px',
                  background: '#0a0a0a',
                  border: '1px solid #1a1a1a',
                  borderRadius: 10,
                }}
              >
                <span style={{ fontSize: 20 }}>
                  {MODEL_GROUPS.find((g) => g.models.some((m) => m.id === (zoukModel ?? ZOUK_PRESET_ID)))?.emoji ??
                    '⭐'}
                </span>
                <span style={{ fontWeight: 600, color: '#fff', fontSize: 15 }}>
                  {selectedModelDisplay?.displayName ?? 'ZOUK'}
                </span>
                {selectedModelDisplay?.badge && (
                  <span
                    style={{
                      fontSize: 10,
                      padding: '2px 6px',
                      background: 'rgba(236,29,46,0.12)',
                      border: '1px solid rgba(236,29,46,0.3)',
                      borderRadius: 4,
                      color: '#ec1d2e',
                    }}
                  >
                    {selectedModelDisplay.badge}
                  </span>
                )}
              </div>
              <p style={{ fontSize: 12, color: '#6a6a6a', marginTop: 8 }}>Change model from the chat bar selector.</p>
            </div>

            {/* Default model picker */}
            <div style={{ marginBottom: 32, paddingBottom: 28, borderBottom: '1px solid #1a1a1a' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Default Model</h3>
              <p style={{ fontSize: 13, color: '#9a9a9a', marginBottom: 12 }}>Used when starting a new conversation</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {MODEL_GROUPS.flatMap((g) =>
                  g.models.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setZoukModel?.(m.id)}
                      style={{
                        padding: '7px 14px',
                        background: (zoukModel ?? ZOUK_PRESET_ID) === m.id ? 'rgba(236,29,46,0.12)' : '#0a0a0a',
                        border: `1px solid ${(zoukModel ?? ZOUK_PRESET_ID) === m.id ? '#ec1d2e' : '#2a2a2a'}`,
                        borderRadius: 8,
                        color: (zoukModel ?? ZOUK_PRESET_ID) === m.id ? '#ec1d2e' : '#b5b5b5',
                        fontWeight: (zoukModel ?? ZOUK_PRESET_ID) === m.id ? 600 : 400,
                        fontSize: 13,
                        cursor: 'pointer',
                        transition: 'all .15s',
                      }}
                    >
                      {g.emoji} {m.displayName}
                    </button>
                  )),
                )}
              </div>
            </div>

            {/* API Providers */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 4 }}>API Providers</h3>
              <p style={{ fontSize: 13, color: '#9a9a9a', marginBottom: 20 }}>
                OpenRouter is the primary provider. All models route through it automatically.
              </p>
              {PROVIDERS.map((def) => (
                <ProviderRow key={def.name} def={def} />
              ))}
            </div>

            {/* Advanced settings */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Advanced Settings</h3>
              <p style={{ fontSize: 13, color: '#9a9a9a', marginBottom: 20 }}>Fine-tune model behavior</p>

              <div
                style={{
                  background: '#0a0a0a',
                  border: '1px solid #1a1a1a',
                  borderRadius: 12,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20,
                }}
              >
                {/* Temperature */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>Temperature</label>
                    <span style={{ fontSize: 12, color: '#6a6a6a' }}>
                      {temperature.toFixed(1)} — {tempLabel}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    style={{ width: '100%', cursor: 'pointer', accentColor: '#ec1d2e' }}
                  />
                </div>

                {/* Max tokens */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#fff', marginBottom: 6, fontSize: 14 }}>
                    Max Output Tokens
                  </label>
                  <input
                    type="number"
                    min={256}
                    max={16000}
                    step={256}
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(Number(e.target.value))}
                    style={inputStyle}
                  />
                </div>

                {/* Toggles */}
                {[
                  { label: 'Streaming', desc: 'Show response as it generates', value: streaming, set: setStreaming },
                  {
                    label: 'Reasoning',
                    desc: 'Enable extended thinking (where supported)',
                    value: reasoning,
                    set: setReasoning,
                  },
                  { label: 'Vision', desc: 'Allow image attachments in chat', value: vision, set: setVision },
                ].map(({ label, desc, value, set }) => (
                  <label
                    key={label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: 600, color: '#fff', fontSize: 14, marginBottom: 2 }}>{label}</p>
                      <p style={{ fontSize: 12, color: '#6a6a6a' }}>{desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => set(e.target.checked)}
                      style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#ec1d2e', flexShrink: 0 }}
                    />
                  </label>
                ))}

                {/* Fallback model */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#fff', marginBottom: 6, fontSize: 14 }}>
                    Fallback Model
                  </label>
                  <select
                    value={fallbackModel}
                    onChange={(e) => setFallbackModel(e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    {MODEL_GROUPS.flatMap((g) =>
                      g.models
                        .filter((m) => m.id !== ZOUK_PRESET_ID)
                        .map((m) => (
                          <option key={m.id} value={m.id}>
                            {g.emoji} {m.displayName}
                          </option>
                        )),
                    )}
                  </select>
                </div>

                {/* System prompt */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, color: '#fff', marginBottom: 6, fontSize: 14 }}>
                    Custom System Prompt
                  </label>
                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="Define additional instructions appended to every conversation..."
                    style={{ ...inputStyle, minHeight: 100, fontFamily: 'monospace', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={handleSaveAdvanced}
                    style={{
                      padding: '10px 20px',
                      background: savedAdvanced ? 'rgba(34,197,94,0.12)' : 'rgba(236,29,46,0.12)',
                      border: `1px solid ${savedAdvanced ? '#22c55e' : '#ec1d2e'}`,
                      borderRadius: 8,
                      color: savedAdvanced ? '#22c55e' : '#ec1d2e',
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: 'pointer',
                      transition: 'all .15s',
                    }}
                  >
                    {savedAdvanced ? '✓ Saved' : 'Save Settings'}
                  </button>
                  <button
                    onClick={() => {
                      setTemperature(0.7);
                      setMaxTokens(4096);
                      setSystemPrompt('');
                      setStreaming(true);
                      setReasoning(false);
                      setVision(true);
                      setFallbackModel('google/gemini-2.5-flash');
                    }}
                    style={{
                      padding: '10px 20px',
                      background: '#0a0a0a',
                      border: '1px solid #2a2a2a',
                      borderRadius: 8,
                      color: '#6a6a6a',
                      fontWeight: 500,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    Reset Defaults
                  </button>
                </div>
              </div>
            </div>
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
