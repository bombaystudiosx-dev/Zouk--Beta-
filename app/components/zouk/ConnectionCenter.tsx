import React, { useRef, useEffect, useState } from 'react';
import { CONNECTOR_REGISTRY, type Connector, type ConnectorStatus } from '~/lib/zouk/connectorRegistry';
import { useConnectorState } from '~/lib/zouk/connectorState';
import { ConnectorSetupModal } from './ConnectorSetupModal';

const CATEGORY_LABELS: Record<string, string> = {
  ai: 'AI',
  hosting: 'Hosting',
  database: 'Database',
  auth: 'Auth',
  infra: 'Infrastructure',
  email: 'Email',
};

function StatusDot({ status }: { status?: ConnectorStatus }) {
  const color =
    status === 'connected' ? '#22c55e' : status === 'error' ? '#ef4444' : status === 'pending' ? '#eab308' : '#3a3a3a';

  return (
    <span
      style={{
        display: 'inline-block',
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: color,
        flexShrink: 0,
      }}
    />
  );
}

function ConnectorRow({
  connector,
  status,
  preview,
  onConnect,
  onDisconnect,
}: {
  connector: Connector;
  status: ConnectorStatus;
  preview?: string;
  onConnect: (connector: Connector) => void;
  onDisconnect: (connector: Connector) => void;
}) {
  const connected = status === 'connected';
  const pending = status === 'pending';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 12px',
        borderRadius: 8,
        background: '#0e0e0e',
        border: '1px solid #1a1a1a',
      }}
    >
      <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1 }}>{connector.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#e8e8e8' }}>{connector.name}</span>
          <StatusDot status={status} />
        </div>
        <span style={{ fontSize: 11, color: '#6a6a6a', display: 'block', marginTop: 1 }}>
          {preview ? `Connected · ${preview}` : connector.description}
        </span>
      </div>
      <button
        onClick={() => (connected ? onDisconnect(connector) : onConnect(connector))}
        style={{
          padding: '4px 12px',
          background: connected ? 'transparent' : pending ? 'rgba(234,179,8,0.10)' : 'rgba(236,29,46,0.10)',
          border: `1px solid ${connected ? '#2a2a2a' : pending ? '#eab308' : '#ec1d2e'}`,
          borderRadius: 6,
          color: connected ? '#6a6a6a' : pending ? '#eab308' : '#ec1d2e',
          fontSize: 11,
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          transition: 'all .15s',
        }}
      >
        {connected ? 'Disconnect' : pending ? 'Finish' : 'Connect'}
      </button>
    </div>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement>;
}

export function ConnectionCenter({ open, onClose, anchorRef }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null);
  const { connectedCount, getRuntime, getStatus, markPending, markConnected, disconnect } =
    useConnectorState(CONNECTOR_REGISTRY);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleClick(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        anchorRef?.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClick);

    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, onClose, anchorRef]);

  if (!open) {
    return null;
  }

  const grouped = CONNECTOR_REGISTRY.reduce<Record<string, Connector[]>>((acc, connector) => {
    (acc[connector.category] = acc[connector.category] ?? []).push(connector);
    return acc;
  }, {});

  const startConnection = (connector: Connector) => {
    markPending(connector);
    setSelectedConnector(connector);
  };

  const finishConnection = (connector: Connector, credential?: string) => {
    markConnected(connector, {
      credential,
      label: connector.authType === 'oauth' ? 'OAuth beta marker' : undefined,
    });
    setSelectedConnector(null);
  };

  return (
    <>
      <div
        ref={panelRef}
        style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: 340,
          background: '#0a0a0a',
          border: '1px solid #1e1e1e',
          borderRadius: 12,
          boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
          zIndex: 9999,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 80px)',
        }}
      >
        <div
          style={{
            padding: '14px 16px 12px',
            borderBottom: '1px solid #1a1a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#e8e8e8', margin: 0 }}>Connection Center</p>
            <p style={{ fontSize: 11, color: '#6a6a6a', margin: '2px 0 0' }}>
              {connectedCount} of {CONNECTOR_REGISTRY.length} connected
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#6a6a6a',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div style={{ overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Object.entries(grouped).map(([category, connectors]) => (
            <div key={category}>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#6a6a6a',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  margin: '0 0 8px 4px',
                }}
              >
                {CATEGORY_LABELS[category] ?? category}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {connectors.map((connector) => {
                  const runtime = getRuntime(connector.id);

                  return (
                    <ConnectorRow
                      key={connector.id}
                      connector={connector}
                      status={getStatus(connector.id)}
                      preview={runtime?.credentialPreview ?? runtime?.label}
                      onConnect={startConnection}
                      onDisconnect={disconnect}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConnectorSetupModal
        connector={selectedConnector}
        runtime={selectedConnector ? getRuntime(selectedConnector.id) : undefined}
        onClose={() => setSelectedConnector(null)}
        onConnected={finishConnection}
      />
    </>
  );
}
