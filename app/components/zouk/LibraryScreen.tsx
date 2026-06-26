import React, { useState, useRef } from 'react';

interface LibraryFile {
  name: string;
  size: string;
  icon: string;
}

const DEMO_FILES: LibraryFile[] = [
  { name: 'brand-guidelines.pdf', size: '2.4 MB', icon: '📄' },
  { name: 'hero-banner.png', size: '840 KB', icon: '🖼️' },
  { name: 'campaign-brief.docx', size: '156 KB', icon: '📝' },
  { name: 'product-video.mp4', size: '18 MB', icon: '🎬' },
  { name: 'logo-pack.zip', size: '3.1 MB', icon: '📦' },
  { name: 'audience-data.csv', size: '92 KB', icon: '📊' },
];

export function LibraryScreen() {
  const [files, setFiles] = useState<LibraryFile[]>(DEMO_FILES);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const displayed = files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];

    if (!f) {
      return;
    }

    const kb = Math.round(f.size / 1024);
    const size = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
    const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
    const iconMap: Record<string, string> = {
      pdf: '📄',
      png: '🖼️',
      jpg: '🖼️',
      jpeg: '🖼️',
      mp4: '🎬',
      mov: '🎬',
      zip: '📦',
      csv: '📊',
      docx: '📝',
      doc: '📝',
    };
    setFiles((prev) => [{ name: f.name, size, icon: iconMap[ext] ?? '📁' }, ...prev]);
    e.target.value = '';
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
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Library</h2>
        <p style={{ color: '#b5b5b5', marginBottom: 28 }}>Your files, images, and assets</p>

        <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 14px',
              background: '#0a0a0a',
              border: '1px solid #1c1c1c',
              borderRadius: 8,
              color: '#e8e8e8',
              fontSize: 14,
              outline: 'none',
            }}
          />
          <button
            onClick={() => inputRef.current?.click()}
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
            + Upload
          </button>
          <input ref={inputRef} type="file" onChange={handleUpload} style={{ display: 'none' }} />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 16,
          }}
        >
          {displayed.map((file, i) => (
            <div
              key={i}
              style={{
                background: '#0a0a0a',
                border: '1px solid #1a1a1a',
                borderRadius: 12,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'border-color .15s',
                animation: 'fadeIn .3s ease-out',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = '#ec1d2e')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = '#1a1a1a')}
            >
              <div
                style={{
                  width: '100%',
                  height: 120,
                  background: 'linear-gradient(135deg, #1a0a0c, #0a0a0a)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 36,
                }}
              >
                {file.icon}
              </div>
              <div style={{ padding: 12 }}>
                <p
                  style={{
                    fontWeight: 600,
                    color: '#fff',
                    marginBottom: 4,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: 13,
                  }}
                >
                  {file.name}
                </p>
                <p style={{ fontSize: 12, color: '#6a6a6a' }}>{file.size}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
