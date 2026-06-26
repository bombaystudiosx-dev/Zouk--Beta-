import React, { useState } from 'react';

interface Connector {
  name: string;
  category: string;
  description: string;
  iconBg: string;
  glyph: string;
  connected: boolean;
}

const CONNECTORS: Connector[] = [
  {
    name: 'Meta Ads',
    category: 'Advertising',
    description: 'Connect Facebook & Instagram ad accounts to manage campaigns directly.',
    iconBg: '#1877f2',
    glyph: 'f',
    connected: false,
  },
  {
    name: 'Google Ads',
    category: 'Advertising',
    description: 'Sync Google Ads campaigns, keywords, and performance data.',
    iconBg: '#ea4335',
    glyph: 'G',
    connected: false,
  },
  {
    name: 'TikTok Ads',
    category: 'Advertising',
    description: 'Manage TikTok ad campaigns and creative assets.',
    iconBg: '#010101',
    glyph: '♪',
    connected: false,
  },
  {
    name: 'YouTube',
    category: 'Social',
    description: 'Connect your YouTube channel for video publishing and analytics.',
    iconBg: '#ff0000',
    glyph: '▶',
    connected: false,
  },
  {
    name: 'Instagram',
    category: 'Social',
    description: 'Publish content and track engagement on Instagram.',
    iconBg: 'linear-gradient(45deg,#feda75,#d62976,#962fbf,#4f5bd5)',
    glyph: '◉',
    connected: false,
  },
  {
    name: 'Slack',
    category: 'Productivity',
    description: 'Get notifications and send campaign updates to Slack channels.',
    iconBg: '#4a154b',
    glyph: '#',
    connected: false,
  },
  {
    name: 'HubSpot',
    category: 'CRM',
    description: 'Sync leads, contacts, and deals from your HubSpot CRM.',
    iconBg: '#ff7a59',
    glyph: 'H',
    connected: false,
  },
  {
    name: 'Shopify',
    category: 'E-commerce',
    description: 'Pull product data and track conversions from your Shopify store.',
    iconBg: '#96bf48',
    glyph: 'S',
    connected: false,
  },
];

const CATEGORIES = ['All', ...Array.from(new Set(CONNECTORS.map((c) => c.category)))];

export function ConnectorsScreen() {
  const [connectors, setConnectors] = useState<Connector[]>(CONNECTORS);
  const [activeCategory, setActiveCategory] = useState('All');

  const toggle = (i: number) =>
    setConnectors((prev) => prev.map((c, idx) => (idx === i ? { ...c, connected: !c.connected } : c)));

  const displayed = activeCategory === 'All' ? connectors : connectors.filter((c) => c.category === activeCategory);

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
        <p style={{ color: '#b5b5b5', marginBottom: 28 }}>Connect your tools and services</p>

        <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={tabStyle(activeCategory === cat)}>
              {cat}
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
          {displayed.map((conn, i) => {
            const realIdx = connectors.indexOf(conn);
            return (
              <div
                key={i}
                style={{
                  background: '#0a0a0a',
                  border: '1px solid #1a1a1a',
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
                      background: conn.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    {conn.glyph}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: '#fff', fontSize: 14 }}>{conn.name}</p>
                    <p style={{ fontSize: 12, color: '#6a6a6a' }}>{conn.category}</p>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: '#9a9a9a', marginBottom: 12, lineHeight: 1.4 }}>{conn.description}</p>
                <button
                  onClick={() => toggle(realIdx)}
                  style={{
                    width: '100%',
                    padding: 8,
                    background: conn.connected ? '#0a1f0a' : 'rgba(236,29,46,0.12)',
                    border: `1px solid ${conn.connected ? '#3ed47f' : '#ec1d2e'}`,
                    borderRadius: 6,
                    color: conn.connected ? '#3ed47f' : '#ec1d2e',
                    fontWeight: 500,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  {conn.connected ? '✓ Connected' : 'Connect'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
