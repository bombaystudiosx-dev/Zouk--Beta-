import React from 'react';
import type { RiskLevel } from '~/lib/zouk/agentPermissions';
import { RISK_LEVEL_COLORS, RISK_LEVEL_LABELS } from '~/lib/zouk/agentPermissions';

export interface ActionRequest {
  title: string;
  description: string;
  tool: string;
  categoryId: string;
  riskLevel: RiskLevel;
  affectedData?: string;
}

interface Props {
  action: ActionRequest | null;
  onDeny: () => void;
  onAllowOnce: () => void;
  onAllowSession: () => void;
  onAlwaysAllow: () => void;
}

export function AgentPermissionModal({ action, onDeny, onAllowOnce, onAllowSession, onAlwaysAllow }: Props) {
  if (!action) {
    return null;
  }

  const isHighRisk = action.riskLevel === 'high';
  const riskColor = RISK_LEVEL_COLORS[action.riskLevel];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.78)',
        zIndex: 10001,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Permission required"
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,
          background: '#0a0a0a',
          border: `1px solid ${isHighRisk ? 'rgba(239,68,68,0.35)' : '#242424'}`,
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
            alignItems: 'flex-start',
            gap: 14,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 8,
              background: isHighRisk ? 'rgba(239,68,68,0.10)' : 'rgba(234,179,8,0.10)',
              border: `1px solid ${isHighRisk ? 'rgba(239,68,68,0.3)' : 'rgba(234,179,8,0.3)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            {isHighRisk ? '⚠️' : '🤖'}
          </div>
          <div>
            <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: 0, marginBottom: 4 }}>
              Permission Required
            </h3>
            <p style={{ color: '#777', fontSize: 13, margin: 0 }}>
              Zouk wants to perform an action that requires your approval.
            </p>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 20 }}>
          {/* Action details */}
          <div
            style={{
              background: '#111',
              border: '1px solid #1e1e1e',
              borderRadius: 10,
              padding: '14px 16px',
              marginBottom: 16,
            }}
          >
            <p style={{ color: '#e8e8e8', fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{action.title}</p>
            <p style={{ color: '#9a9a9a', fontSize: 13, lineHeight: 1.55, marginBottom: 12 }}>{action.description}</p>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <span
                  style={{
                    fontSize: 10,
                    color: '#555',
                    display: 'block',
                    marginBottom: 2,
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                  }}
                >
                  TOOL / APP
                </span>
                <span style={{ fontSize: 12, color: '#b5b5b5', fontWeight: 500 }}>{action.tool}</span>
              </div>
              <div>
                <span
                  style={{
                    fontSize: 10,
                    color: '#555',
                    display: 'block',
                    marginBottom: 2,
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                  }}
                >
                  RISK LEVEL
                </span>
                <span style={{ fontSize: 12, color: riskColor, fontWeight: 600 }}>
                  {RISK_LEVEL_LABELS[action.riskLevel]}
                </span>
              </div>
              {action.affectedData && (
                <div>
                  <span
                    style={{
                      fontSize: 10,
                      color: '#555',
                      display: 'block',
                      marginBottom: 2,
                      fontWeight: 600,
                      letterSpacing: '0.5px',
                    }}
                  >
                    AFFECTS
                  </span>
                  <span style={{ fontSize: 12, color: '#b5b5b5' }}>{action.affectedData}</span>
                </div>
              )}
            </div>
          </div>

          {/* High-risk warning */}
          {isHighRisk && (
            <div
              style={{
                padding: '10px 14px',
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 12,
                color: '#fca5a5',
                lineHeight: 1.5,
              }}
            >
              <strong style={{ color: '#ef4444' }}>High-risk action.</strong> This action requires confirmation every
              time and cannot be permanently approved.
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={onDeny}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: '#121212',
                  border: '1px solid #2a2a2a',
                  borderRadius: 8,
                  color: '#aaa',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                Deny
              </button>
              <button
                onClick={onAllowOnce}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: 'rgba(236,29,46,0.12)',
                  border: '1px solid #ec1d2e',
                  borderRadius: 8,
                  color: '#ec1d2e',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                Allow Once
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={onAllowSession}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: 'rgba(234,179,8,0.08)',
                  border: '1px solid rgba(234,179,8,0.35)',
                  borderRadius: 8,
                  color: '#eab308',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                Allow This Session
              </button>
              <button
                disabled={isHighRisk}
                onClick={isHighRisk ? undefined : onAlwaysAllow}
                title={isHighRisk ? 'High-risk actions cannot be permanently allowed' : 'Remember this choice'}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: isHighRisk ? '#111' : 'rgba(34,197,94,0.08)',
                  border: `1px solid ${isHighRisk ? '#1e1e1e' : 'rgba(34,197,94,0.3)'}`,
                  borderRadius: 8,
                  color: isHighRisk ? '#333' : '#22c55e',
                  cursor: isHighRisk ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                Always Allow
              </button>
            </div>
          </div>

          {isHighRisk && (
            <p style={{ color: '#444', fontSize: 11, marginTop: 8, textAlign: 'center' }}>
              "Always Allow" is disabled for high-risk actions.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
