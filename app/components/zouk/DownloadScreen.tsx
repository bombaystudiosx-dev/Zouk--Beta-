import React from 'react';
import { getDesktopDownloadOptions, type DesktopDownloadOption } from '~/lib/zouk/desktopDownloads';

function PlatformCard({ option }: { option: DesktopDownloadOption }) {
  const isAvailable = option.status === 'available' && option.artifactUrl !== null;

  return (
    <div
      style={{
        background: '#0a0a0a',
        border: '1px solid #1a1a1a',
        borderRadius: 12,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 28 }}>{option.icon}</span>
        <div>
          <p style={{ fontWeight: 700, color: '#fff', fontSize: 16, margin: 0 }}>{option.label}</p>
          <p style={{ fontSize: 12, color: '#6a6a6a', margin: '2px 0 0' }}>{option.fileTypeLabel}</p>
        </div>
        <span
          style={{
            marginLeft: 'auto',
            padding: '3px 10px',
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 700,
            background: isAvailable ? 'rgba(34,197,94,0.08)' : '#111',
            color: isAvailable ? '#22c55e' : '#555',
            border: `1px solid ${isAvailable ? '#22c55e44' : '#1e1e1e'}`,
            whiteSpace: 'nowrap' as const,
          }}
        >
          {isAvailable ? 'Available' : 'Build Required'}
        </span>
      </div>

      {/* Build command */}
      <div
        style={{
          background: '#060606',
          border: '1px solid #1a1a1a',
          borderRadius: 8,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ fontSize: 11, color: '#555', flexShrink: 0 }}>Build:</span>
        <code style={{ fontSize: 12, color: '#b5b5b5', fontFamily: 'monospace', flex: 1 }}>{option.buildCommand}</code>
      </div>

      {/* Notes */}
      <p style={{ fontSize: 12, color: '#6a6a6a', lineHeight: 1.5, margin: 0 }}>{option.notes}</p>

      {/* Download button */}
      {isAvailable ? (
        <a
          href={option.artifactUrl!}
          download
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '10px 16px',
            background: 'rgba(236,29,46,0.12)',
            border: '1px solid #ec1d2e',
            borderRadius: 8,
            color: '#ec1d2e',
            fontWeight: 600,
            fontSize: 13,
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          Download {option.fileType}
        </a>
      ) : (
        <button
          disabled
          style={{
            width: '100%',
            padding: '10px 16px',
            background: '#0d0d0d',
            border: '1px solid #1e1e1e',
            borderRadius: 8,
            color: '#3a3a3a',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'not-allowed',
          }}
        >
          Installer not generated yet
        </button>
      )}
    </div>
  );
}

export function DownloadScreen() {
  const options = getDesktopDownloadOptions();

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
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'rgba(236,29,46,0.12)',
                border: '1px solid rgba(236,29,46,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 20,
              }}
            >
              💾
            </div>
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: '#fff', margin: 0 }}>Download Desktop App</h2>
              <p style={{ color: '#6a6a6a', fontSize: 12, margin: '2px 0 0' }}>
                Native desktop builds for Windows, macOS, and Linux
              </p>
            </div>
          </div>

          <div
            style={{
              padding: '12px 16px',
              background: '#0d0d0d',
              border: '1px solid #1a1a1a',
              borderRadius: 8,
              fontSize: 12,
              color: '#6a6a6a',
              lineHeight: 1.6,
            }}
          >
            Desktop builds are generated through the Electron build pipeline and attached to GitHub Releases or a secure
            download host. Run Electron build to create downloads — installers are not pre-generated in the web
            deployment.
          </div>
        </div>

        {/* Platform cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
            marginBottom: 32,
          }}
        >
          {options.map((opt) => (
            <PlatformCard key={opt.platform} option={opt} />
          ))}
        </div>

        {/* CI / release note */}
        <div
          style={{
            background: '#0a0a0a',
            border: '1px solid #1a1a1a',
            borderRadius: 12,
            padding: 20,
          }}
        >
          <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 12, marginTop: 0 }}>
            Build & Release Notes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'Desktop builds should be generated through CI or a trusted build machine, then attached to GitHub Releases or a secure download host.',
              'Code signing and notarization are a future phase — unsigned builds will show OS security warnings on first launch.',
              'Auto-update support is a future phase — electron-updater is already included as a dependency.',
              'Run pnpm electron:build:dist to build for all platforms at once (requires macOS for universal build).',
            ].map((note, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: '#ec1d2e', fontSize: 12, flexShrink: 0, marginTop: 1 }}>→</span>
                <p style={{ fontSize: 12, color: '#6a6a6a', lineHeight: 1.5, margin: 0 }}>{note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
