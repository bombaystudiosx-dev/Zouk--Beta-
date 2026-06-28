import React, { useState, useRef, useEffect } from 'react';
import { MODEL_GROUPS, COST_BADGE, SPEED_LABEL, getModelDisplay, ZOUK_PRESET_ID } from '~/lib/zouk/modelRegistry';

interface Props {
  value: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
}

export function ZoukModelPicker({ value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = getModelDisplay(value);
  const group = MODEL_GROUPS.find((g) => g.models.some((m) => m.id === value));
  const displayLabel = selected ? `${group?.emoji ?? ''} ${selected.displayName}` : '⭐ ZOUK';

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClick);

    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          background: open ? 'rgba(236,29,46,0.10)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${open ? '#ec1d2e' : '#2a2a2a'}`,
          borderRadius: 6,
          color: open ? '#ec1d2e' : '#b5b5b5',
          fontSize: 12,
          fontWeight: 500,
          cursor: disabled ? 'not-allowed' : 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all .15s',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <span>{displayLabel}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: 0,
            width: 280,
            background: '#0e0e0e',
            border: '1px solid #1e1e1e',
            borderRadius: 10,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            zIndex: 9999,
            overflow: 'hidden',
          }}
        >
          {MODEL_GROUPS.map((group) => (
            <div key={group.label}>
              <div
                style={{
                  padding: '8px 12px 4px',
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#6a6a6a',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                }}
              >
                {group.emoji} {group.label}
              </div>
              {group.models.map((model) => {
                const isActive = value === model.id;
                const cost = COST_BADGE[model.cost];

                return (
                  <button
                    key={model.id}
                    onClick={() => {
                      onChange(model.id);
                      setOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: isActive ? 'rgba(236,29,46,0.08)' : 'transparent',
                      border: 'none',
                      color: isActive ? '#fff' : '#c8c8c8',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background .1s',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400 }}>{model.displayName}</span>
                        {model.id === ZOUK_PRESET_ID && (
                          <span
                            style={{
                              fontSize: 9,
                              padding: '1px 5px',
                              background: 'rgba(236,29,46,0.15)',
                              border: '1px solid rgba(236,29,46,0.3)',
                              borderRadius: 4,
                              color: '#ec1d2e',
                              fontWeight: 600,
                            }}
                          >
                            DEFAULT
                          </span>
                        )}
                        {model.badge && model.id !== ZOUK_PRESET_ID && (
                          <span
                            style={{
                              fontSize: 9,
                              padding: '1px 5px',
                              background: 'rgba(255,255,255,0.06)',
                              borderRadius: 4,
                              color: '#9a9a9a',
                            }}
                          >
                            {model.badge}
                          </span>
                        )}
                      </div>
                      {model.description && <span style={{ fontSize: 11, color: '#6a6a6a' }}>{model.description}</span>}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: 2,
                        flexShrink: 0,
                      }}
                    >
                      <span style={{ fontSize: 10, color: '#6a6a6a' }}>{SPEED_LABEL[model.speed]}</span>
                      <span style={{ fontSize: 10, color: cost.color }}>{cost.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
