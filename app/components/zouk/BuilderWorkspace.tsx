import React, { useState, useRef } from 'react';
import { ZoukModelPicker } from '~/components/chat/ZoukModelPicker';
import { ZOUK_PRESET_ID } from '~/lib/zouk/modelRegistry';

type Device = 'phone' | 'tablet' | 'desktop';
type RightTab = 'files' | 'components' | 'pages' | 'settings';

const DEVICE_SIZES: Record<Device, { width: number | string; height: number | string; label: string }> = {
  phone: { width: 390, height: 844, label: 'Phone' },
  tablet: { width: 768, height: 1024, label: 'Tablet' },
  desktop: { width: '100%', height: '100%', label: 'Desktop' },
};

const DEVICE_ICONS: Record<Device, React.ReactNode> = {
  phone: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
  tablet: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
  desktop: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
};

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

interface Props {
  onBack: () => void;
  zoukModel?: string;
  setZoukModel?: (id: string) => void;
  onSendMessage?: (text: string) => void;
}

export function BuilderWorkspace({ onBack, zoukModel = ZOUK_PRESET_ID, setZoukModel, onSendMessage }: Props) {
  const [device, setDevice] = useState<Device>('desktop');
  const [rightTab, setRightTab] = useState<RightTab>('files');
  const [rightOpen, setRightOpen] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [projectName, setProjectName] = useState('Untitled Project');
  const [editingName, setEditingName] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: "Hi! Describe the app you want to build and I'll start generating it for you." },
  ]);
  const [previewUrl, setPreviewUrl] = useState('');
  const nameInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const deviceSize = DEVICE_SIZES[device];

  const handleSend = () => {
    const text = prompt.trim();

    if (!text) {
      return;
    }

    setMessages((prev) => [...prev, { role: 'user', text }]);
    setPrompt('');
    setSaveStatus('unsaved');
    onSendMessage?.(text);

    // Simulate assistant response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: `Got it! Building "${text}"… Preview will update shortly.` },
      ]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }, 800);

    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const handleNameSave = () => {
    setEditingName(false);
    setSaveStatus('saving');
    setTimeout(() => setSaveStatus('saved'), 1000);
  };

  const MOCK_FILES = ['index.html', 'app.css', 'main.js', 'components/', 'assets/'];
  const MOCK_COMPONENTS = ['Header', 'Hero', 'NavBar', 'Footer', 'Card', 'Button'];
  const MOCK_PAGES = ['Home', 'About', 'Contact', 'Dashboard'];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#060606',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* ── TOP BAR ── */}
      <div
        style={{
          height: 52,
          background: '#0a0a0a',
          borderBottom: '1px solid #1a1a1a',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '0 16px',
          flexShrink: 0,
        }}
      >
        {/* Back */}
        <button
          onClick={onBack}
          style={{
            padding: '6px 12px',
            background: 'transparent',
            border: '1px solid #2a2a2a',
            borderRadius: 6,
            color: '#b5b5b5',
            fontSize: 12,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            whiteSpace: 'nowrap',
            transition: 'border-color .15s',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = '#ec1d2e')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = '#2a2a2a')}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Home
        </button>

        <div style={{ width: 1, height: 24, background: '#1e1e1e' }} />

        {/* Project name */}
        {editingName ? (
          <input
            ref={nameInputRef}
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
            autoFocus
            style={{
              background: '#1a1a1a',
              border: '1px solid #ec1d2e',
              borderRadius: 6,
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              padding: '4px 8px',
              outline: 'none',
              width: 200,
            }}
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#e8e8e8',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'text',
              padding: '4px 6px',
              borderRadius: 4,
            }}
          >
            {projectName}
          </button>
        )}

        {/* Save status */}
        <span
          style={{
            fontSize: 11,
            color: saveStatus === 'saved' ? '#6a6a6a' : saveStatus === 'saving' ? '#eab308' : '#ec1d2e',
          }}
        >
          {saveStatus === 'saved' ? '● Saved' : saveStatus === 'saving' ? '● Saving…' : '● Unsaved'}
        </span>

        <div style={{ flex: 1 }} />

        {/* Device switcher in top bar */}
        <div style={{ display: 'flex', gap: 2, background: '#111', borderRadius: 6, padding: 2 }}>
          {(['phone', 'tablet', 'desktop'] as Device[]).map((d) => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              title={DEVICE_SIZES[d].label}
              style={{
                padding: '5px 10px',
                background: device === d ? '#1e1e1e' : 'transparent',
                border: 'none',
                borderRadius: 5,
                color: device === d ? '#e8e8e8' : '#6a6a6a',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 12,
                transition: 'all .15s',
              }}
            >
              {DEVICE_ICONS[d]}
              <span>{DEVICE_SIZES[d].label}</span>
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 24, background: '#1e1e1e' }} />

        {/* Action buttons */}
        {[
          { label: 'Preview', icon: '▶' },
          { label: 'Export Code', icon: '↓' },
          { label: 'Deploy', icon: '🚀', primary: true },
        ].map(({ label, icon, primary }) => (
          <button
            key={label}
            style={{
              padding: '6px 14px',
              background: primary ? 'rgba(236,29,46,0.12)' : 'transparent',
              border: `1px solid ${primary ? '#ec1d2e' : '#2a2a2a'}`,
              borderRadius: 6,
              color: primary ? '#ec1d2e' : '#b5b5b5',
              fontWeight: primary ? 600 : 400,
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              whiteSpace: 'nowrap',
              transition: 'all .15s',
            }}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}

        {/* Right panel toggle */}
        <button
          onClick={() => setRightOpen((v) => !v)}
          title="Toggle inspector"
          style={{
            padding: 6,
            background: rightOpen ? 'rgba(255,255,255,0.06)' : 'transparent',
            border: '1px solid #2a2a2a',
            borderRadius: 6,
            color: '#6a6a6a',
            cursor: 'pointer',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="15" y1="3" x2="15" y2="21" />
          </svg>
        </button>
      </div>

      {/* ── BODY ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* ── LEFT: AI CHAT PANEL ── */}
        <div
          style={{
            width: 300,
            minWidth: 300,
            background: '#0b0b0b',
            borderRight: '1px solid #1a1a1a',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Panel header */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #1a1a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#6a6a6a',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              AI Builder
            </span>
            <ZoukModelPicker value={zoukModel} onChange={(id) => setZoukModel?.(id)} />
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
                  gap: 8,
                  alignItems: 'flex-end',
                }}
              >
                {m.role === 'assistant' && (
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg,#ec1d2e,#ff5664)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#fff',
                      flexShrink: 0,
                    }}
                  >
                    Z
                  </div>
                )}
                <div
                  style={{
                    maxWidth: '78%',
                    padding: '8px 12px',
                    borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background: m.role === 'user' ? 'rgba(236,29,46,0.12)' : '#141414',
                    border: `1px solid ${m.role === 'user' ? 'rgba(236,29,46,0.25)' : '#1e1e1e'}`,
                    fontSize: 13,
                    color: '#e0e0e0',
                    lineHeight: 1.5,
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* File attach row */}
          <div style={{ padding: '8px 12px 0', display: 'flex', gap: 6 }}>
            {[
              { title: 'Attach file', icon: 'i-ph:paperclip' },
              { title: 'Upload image', icon: 'i-ph:image' },
              { title: 'Reference URL', icon: 'i-ph:link' },
            ].map(({ title, icon }) => (
              <button
                key={title}
                title={title}
                style={{
                  padding: 6,
                  background: '#141414',
                  border: '1px solid #1e1e1e',
                  borderRadius: 6,
                  color: '#6a6a6a',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <div className={`${icon} text-base`} />
              </button>
            ))}
          </div>

          {/* Prompt input */}
          <div style={{ padding: 12 }}>
            <div
              style={{
                background: '#111',
                border: '1px solid #1e1e1e',
                borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Describe what to build or change…"
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: '#e8e8e8',
                  fontSize: 13,
                  padding: '10px 12px',
                  resize: 'none',
                  outline: 'none',
                  minHeight: 72,
                  maxHeight: 160,
                  boxSizing: 'border-box',
                  lineHeight: 1.5,
                }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  padding: '0 8px 8px',
                }}
              >
                <button
                  onClick={handleSend}
                  disabled={!prompt.trim()}
                  style={{
                    padding: '6px 16px',
                    background: prompt.trim() ? 'rgba(236,29,46,0.12)' : '#1a1a1a',
                    border: `1px solid ${prompt.trim() ? '#ec1d2e' : '#2a2a2a'}`,
                    borderRadius: 6,
                    color: prompt.trim() ? '#ec1d2e' : '#3a3a3a',
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: prompt.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all .15s',
                  }}
                >
                  Build ↑
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── CENTER: PREVIEW CANVAS ── */}
        <div
          style={{
            flex: 1,
            background: '#0e0e0e',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Canvas area */}
          <div
            style={{
              flex: 1,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: device === 'desktop' ? 0 : 24,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: device === 'desktop' ? '100%' : deviceSize.width,
                height: device === 'desktop' ? '100%' : deviceSize.height,
                maxWidth: '100%',
                maxHeight: '100%',
                background: '#fff',
                borderRadius: device === 'phone' ? 24 : device === 'tablet' ? 16 : 0,
                boxShadow: device !== 'desktop' ? '0 24px 80px rgba(0,0,0,0.6)' : 'none',
                overflow: 'hidden',
                position: 'relative',
                border: device !== 'desktop' ? '1px solid #2a2a2a' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              {previewUrl ? (
                <iframe
                  src={previewUrl}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="App Preview"
                />
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: 32,
                    color: '#9a9a9a',
                    background: '#0e0e0e',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 16,
                  }}
                >
                  <div style={{ opacity: 0.3 }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 9h18M9 21V9" />
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 600, color: '#3a3a3a', marginBottom: 6 }}>
                      Preview will appear here
                    </p>
                    <p style={{ fontSize: 13, color: '#2a2a2a' }}>Start by describing your app in the chat panel →</p>
                  </div>
                  <button
                    onClick={() => setPreviewUrl('about:blank')}
                    style={{
                      padding: '8px 20px',
                      background: 'rgba(236,29,46,0.10)',
                      border: '1px solid rgba(236,29,46,0.3)',
                      borderRadius: 8,
                      color: '#ec1d2e',
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    Open blank canvas
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom status bar */}
          <div
            style={{
              height: 28,
              width: '100%',
              background: '#0a0a0a',
              borderTop: '1px solid #1a1a1a',
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              gap: 16,
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 11, color: '#3a3a3a' }}>
              {device === 'desktop' ? 'Full width' : `${deviceSize.width} × ${deviceSize.height}`}
            </span>
            <span style={{ fontSize: 11, color: '#3a3a3a' }}>● Ready</span>
            {previewUrl && (
              <button
                onClick={() => setPreviewUrl('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4a4a4a',
                  fontSize: 11,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                × Close preview
              </button>
            )}
          </div>
        </div>

        {/* ── RIGHT: INSPECTOR PANEL ── */}
        {rightOpen && (
          <div
            style={{
              width: 220,
              minWidth: 220,
              background: '#0a0a0a',
              borderLeft: '1px solid #1a1a1a',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Tab strip */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid #1a1a1a',
                flexShrink: 0,
              }}
            >
              {(['files', 'components', 'pages', 'settings'] as RightTab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setRightTab(t)}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    background: rightTab === t ? '#111' : 'transparent',
                    border: 'none',
                    borderBottom: rightTab === t ? '2px solid #ec1d2e' : '2px solid transparent',
                    color: rightTab === t ? '#e8e8e8' : '#6a6a6a',
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                    cursor: 'pointer',
                    transition: 'all .15s',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
              {rightTab === 'files' && (
                <div>
                  <p style={{ fontSize: 11, color: '#6a6a6a', marginBottom: 8 }}>PROJECT FILES</p>
                  {MOCK_FILES.map((f) => (
                    <button
                      key={f}
                      style={{
                        width: '100%',
                        padding: '7px 8px',
                        background: 'transparent',
                        border: 'none',
                        color: '#b5b5b5',
                        fontSize: 12,
                        textAlign: 'left',
                        cursor: 'pointer',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#141414')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
                    >
                      <span style={{ color: '#3a3a3a', fontSize: 11 }}>{f.endsWith('/') ? '📁' : '📄'}</span>
                      {f}
                    </button>
                  ))}
                </div>
              )}
              {rightTab === 'components' && (
                <div>
                  <p style={{ fontSize: 11, color: '#6a6a6a', marginBottom: 8 }}>COMPONENTS</p>
                  {MOCK_COMPONENTS.map((c) => (
                    <button
                      key={c}
                      style={{
                        width: '100%',
                        padding: '7px 8px',
                        background: 'transparent',
                        border: 'none',
                        color: '#b5b5b5',
                        fontSize: 12,
                        textAlign: 'left',
                        cursor: 'pointer',
                        borderRadius: 4,
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#141414')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
                    >
                      ⬡ {c}
                    </button>
                  ))}
                </div>
              )}
              {rightTab === 'pages' && (
                <div>
                  <p style={{ fontSize: 11, color: '#6a6a6a', marginBottom: 8 }}>PAGES</p>
                  {MOCK_PAGES.map((p) => (
                    <button
                      key={p}
                      style={{
                        width: '100%',
                        padding: '7px 8px',
                        background: 'transparent',
                        border: 'none',
                        color: '#b5b5b5',
                        fontSize: 12,
                        textAlign: 'left',
                        cursor: 'pointer',
                        borderRadius: 4,
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#141414')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
                    >
                      ☰ {p}
                    </button>
                  ))}
                  <button
                    style={{
                      width: '100%',
                      padding: '7px 8px',
                      marginTop: 4,
                      background: 'rgba(236,29,46,0.06)',
                      border: '1px dashed rgba(236,29,46,0.2)',
                      borderRadius: 4,
                      color: '#ec1d2e',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    + Add page
                  </button>
                </div>
              )}
              {rightTab === 'settings' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <p style={{ fontSize: 11, color: '#6a6a6a', marginBottom: 6 }}>FRAMEWORK</p>
                    <select
                      style={{
                        width: '100%',
                        background: '#111',
                        border: '1px solid #1e1e1e',
                        borderRadius: 6,
                        color: '#e8e8e8',
                        fontSize: 12,
                        padding: '6px 8px',
                      }}
                    >
                      <option>React</option>
                      <option>Vue</option>
                      <option>Svelte</option>
                      <option>Vanilla HTML</option>
                    </select>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: '#6a6a6a', marginBottom: 6 }}>STYLING</p>
                    <select
                      style={{
                        width: '100%',
                        background: '#111',
                        border: '1px solid #1e1e1e',
                        borderRadius: 6,
                        color: '#e8e8e8',
                        fontSize: 12,
                        padding: '6px 8px',
                      }}
                    >
                      <option>Tailwind CSS</option>
                      <option>CSS Modules</option>
                      <option>Styled Components</option>
                      <option>Plain CSS</option>
                    </select>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: '#6a6a6a', marginBottom: 6 }}>PACKAGE MANAGER</p>
                    <select
                      style={{
                        width: '100%',
                        background: '#111',
                        border: '1px solid #1e1e1e',
                        borderRadius: 6,
                        color: '#e8e8e8',
                        fontSize: 12,
                        padding: '6px 8px',
                      }}
                    >
                      <option>pnpm</option>
                      <option>npm</option>
                      <option>yarn</option>
                      <option>bun</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
