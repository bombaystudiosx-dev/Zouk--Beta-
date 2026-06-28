import React, { useEffect, useRef, useState } from 'react';

interface LibraryFile {
  name: string;
  size: string;
  icon: string;
  addedAt: string;
}

const STORAGE_KEY = 'zouk_beta_library_v1';

const STARTER_FILES: LibraryFile[] = [
  { name: 'zouk-beta-brief.md', size: 'Local note', icon: '📝', addedAt: 'Seeded for beta' },
  { name: 'connector-plan.md', size: 'Local note', icon: '🔌', addedAt: 'Seeded for beta' },
  { name: 'deployment-checklist.md', size: 'Local note', icon: '🚀', addedAt: 'Seeded for beta' },
];

function readFiles(): LibraryFile[] {
  if (typeof window === 'undefined') {
    return STARTER_FILES;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LibraryFile[]) : STARTER_FILES;
  } catch {
    return STARTER_FILES;
  }
}

function writeFiles(files: LibraryFile[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
}

export function LibraryScreen() {
  const [files, setFiles] = useState<LibraryFile[]>(readFiles);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    writeFiles(files);
  }, [files]);

  const displayed = files.filter((file) => file.name.toLowerCase().includes(search.toLowerCase()));

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const kb = Math.round(file.size / 1024);
    const size = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
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
      md: '📝',
      tsx: '⚛️',
      ts: '⚙️',
      js: '⚙️',
      json: '🧩',
    };

    setFiles((prev) => [
      {
        name: file.name,
        size,
        icon: iconMap[ext] ?? '📁',
        addedAt: 'Just now',
      },
      ...prev,
    ]);
    event.target.value = '';
  };

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((file) => file.name !== name));
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
        <p style={{ color: '#b5b5b5', marginBottom: 6 }}>Files, images, and assets attached to your beta workspace.</p>
        <p style={{ color: '#6a6a6a', fontSize: 12, marginBottom: 28 }}>
          Beta note: this screen stores file metadata locally only. Raw files are not uploaded to Supabase until backend
          storage is wired.
        </p>

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
            + Add Metadata
          </button>
          <input ref={inputRef} type="file" onChange={handleUpload} style={{ display: 'none' }} />
        </div>

        {displayed.length === 0 ? (
          <div
            style={{ border: '1px solid #1a1a1a', borderRadius: 12, padding: 28, color: '#777', background: '#0a0a0a' }}
          >
            No library items match that search.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 16,
            }}
          >
            {displayed.map((file) => (
              <div
                key={file.name}
                style={{
                  background: '#0a0a0a',
                  border: '1px solid #1a1a1a',
                  borderRadius: 12,
                  overflow: 'hidden',
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
                  <p style={{ fontSize: 12, color: '#6a6a6a', marginBottom: 4 }}>{file.size}</p>
                  <p style={{ fontSize: 11, color: '#555', marginBottom: 10 }}>{file.addedAt}</p>
                  <button
                    onClick={() => removeFile(file.name)}
                    style={{
                      width: '100%',
                      padding: 7,
                      background: '#111',
                      border: '1px solid #242424',
                      borderRadius: 6,
                      color: '#777',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
