import React, { useState } from 'react';
import { CONNECTOR_REGISTRY, type Connector, type ConnectorStatus } from '~/lib/zouk/connectorRegistry';
import { useConnectorState } from '~/lib/zouk/connectorState';
import { ConnectorSetupModal } from './ConnectorSetupModal';

const CATEGORY_LABELS: Record<string, string> = {
  ai: 'AI Models',
  hosting: 'Hosting',
  database: 'Database',
  auth: 'Auth',
  infra: 'Infrastructure',
  email: 'Email',
};

const CATEGORIES = ['All', ...Array.from(new Set(CONNECTOR_REGISTRY.map((connector) => connector.category)))];

function statusLabel(status: ConnectorStatus) {
  if (status === 'connected') {
    return '✓ Connected';
  }

  if (status === 'pending') {
    return 'Finish setup';
  }

  if (status === 'error') {
    return 'Fix connection';
  }

  return 'Connect';
}

export function ConnectorsScreen() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null);
  const { connectedCount, getRuntime, getStatus, markPending, markConnected, disconnect } =
    useConnectorState(CONNECTOR_REGISTRY);

  const displayed =
    activeCategory === 'All'
      ? CONNECTOR_REGISTRY
      : CONNECTOR_REGISTRY.filter((connector) => connector.category === activeCategory);

  const tabStyle = (active: boolean) =>
    ({
      padding: '8px 14px',
      background: active ? 'rgba(236,29,46,0.12)' : '#1a1a1a',
      border: `1px solid ${active ? '#ec1d2e' : '#2a2a2a'}`,
      borderRadius: 8,
      color: active ? '#ec1d2e' : '#b5b5b5',
      fontWeight: 500,
      cursor: 'pointer',
      fontSize: 12,
    }) as React.CSSProperties;

  const startConnection = (connector: Connector) => {
    markPending(connector);
    setSelectedConnector(connector);
  };

  const finishConnection = (
    connector: Connector,
    credential?: string,
    account?: import('~/lib/zouk/connectorState').ConnectorAccountInfo,
  ) => {
    markConnected(
      connector,
      { credential, label: connector.authType === 'oauth' ? 'OAuth beta marker' : undefined },
      account,
    );
    setSelectedConnector(null);
  };

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
      <div style={{ maxWidth: 1400 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Connectors</h2>
        <p style={{ color: '#b5b5b5', marginBottom: 8 }}>
          Connect builder tools, deploy targets, databases, and AI providers.
        </p>
        <p style={{ color: '#6a6a6a', marginBottom: 28, fontSize: 13 }}>
          Beta state: {connectedCount} of {CONNECTOR_REGISTRY.length} connected. OAuth entries are staged locally until
          backend callbacks are added.
        </p>

        <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              style={tabStyle(activeCategory === category)}
            >
              {category === 'All' ? 'All' : (CATEGORY_LABELS[category] ?? category)}
            </button>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {displayed.map((connector) => {
            const status = getStatus(connector.id);
            const runtime = getRuntime(connector.id);
            const connected = status === 'connected';
            const pending = status === 'pending';
            const errored = status === 'error';

            return (
              <div
                key={connector.id}
                style={{
                  background: '#0a0a0a',
                  border: `1px solid ${connected ? 'rgba(34,197,94,0.35)' : pending ? 'rgba(234,179,8,0.35)' : errored ? 'rgba(239,68,68,0.35)' : '#1a1a1a'}`,
                  borderRadius: 12,
                  padding: 16,
                  animation: 'fadeIn .3s ease-out',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: '#111',
                      border: '1px solid #242424',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    {connector.icon}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>{connector.name}</p>
                    <p style={{ fontSize: 12, color: '#6a6a6a' }}>
                      {CATEGORY_LABELS[connector.category] ?? connector.category}
                    </p>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: '#9a9a9a', marginBottom: 10, lineHeight: 1.4 }}>
                  {connector.description}
                </p>
                {runtime?.credentialPreview || runtime?.label ? (
                  <p style={{ fontSize: 12, color: '#6a6a6a', marginBottom: 12 }}>
                    Saved: {runtime.credentialPreview ?? runtime.label}
                  </p>
                ) : (
                  <p style={{ fontSize: 12, color: '#555', marginBottom: 12 }}>
                    {connector.authType.toUpperCase()} setup
                  </p>
                )}
                <button
                  onClick={() => (connected ? disconnect(connector) : startConnection(connector))}
                  style={{
                    width: '100%',
                    padding: 8,
                    background: connected ? '#0a1f0a' : pending ? 'rgba(234,179,8,0.10)' : 'rgba(236,29,46,0.12)',
                    border: `1px solid ${connected ? '#3ed47f' : pending ? '#eab308' : '#ec1d2e'}`,
                    borderRadius: 6,
                    color: connected ? '#3ed47f' : pending ? '#eab308' : '#ec1d2e',
                    fontWeight: 500,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {connected ? 'Disconnect' : statusLabel(status)}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <ConnectorSetupModal
        connector={selectedConnector}
        runtime={selectedConnector ? getRuntime(selectedConnector.id) : undefined}
        onClose={() => setSelectedConnector(null)}
        onConnected={finishConnection}
      />
    </div>
  );
}
