import React, { useCallback, useEffect, useRef, useState } from 'react';

interface SkillAgent {
  name: string;
  type: 'skill' | 'agent';
  description: string;
  filename: string;
  raw: string;
}

const STORAGE_KEY = 'zouk_skills_agents';

function parseMd(filename: string, raw: string): SkillAgent {
  const nameMatch = raw.match(/^#\s+(.+)/m) ?? raw.match(/name:\s*['"]?(.+?)['"]?\s*$/m);
  const descMatch = raw.match(/description:\s*['"]?(.+?)['"]?\s*$/m) ?? raw.match(/^[^#\n].{10,}/m);
  const typeMatch = raw.match(/type:\s*['"]?(skill|agent)['"]?/im);

  const isAgent =
    typeMatch?.[1]?.toLowerCase() === 'agent' ||
    filename.toLowerCase().includes('agent') ||
    raw.toLowerCase().includes('subagent_type');

  return {
    name: nameMatch?.[1]?.trim() ?? filename.replace(/\.md$/i, '').replace(/[-_]/g, ' '),
    type: isAgent ? 'agent' : 'skill',
    description: descMatch?.[1]?.trim() ?? '',
    filename,
    raw,
  };
}

function loadStored(): SkillAgent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStored(items: SkillAgent[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

const FILTERS = ['all', 'skills', 'agents'] as const;

interface Props {
  onUseInChat: (prompt: string) => void;
}

export function SkillsAgentsScreen({ onUseInChat }: Props) {
  const [filter, setFilter] = useState<'all' | 'skills' | 'agents'>('all');
  const [items, setItems] = useState<SkillAgent[]>(() => loadStored());
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveStored(items);
  }, [items]);

  const addFiles = useCallback((files: FileList | null) => {
    if (!files) {
      return;
    }

    Array.from(files).forEach((file) => {
      if (!file.name.endsWith('.md')) {
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        const raw = e.target?.result as string;
        const parsed = parseMd(file.name, raw);
        setItems((prev) => {
          const exists = prev.findIndex((x) => x.filename === parsed.filename);

          if (exists >= 0) {
            const next = [...prev];
            next[exists] = parsed;

            return next;
          }

          return [parsed, ...prev];
        });
      };

      reader.readAsText(file);
    });
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const handleDelete = (filename: string) => setItems((prev) => prev.filter((x) => x.filename !== filename));

  const displayed = items.filter(
    (i) => filter === 'all' || (filter === 'skills' ? i.type === 'skill' : i.type === 'agent'),
  );

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    background: active ? 'rgba(236,29,46,0.12)' : 'transparent',
    border: `1px solid ${active ? '#ec1d2e' : '#2a2a2a'}`,
    borderRadius: 8,
    color: active ? '#ec1d2e' : '#b5b5b5',
    fontWeight: 500,
    cursor: 'pointer',
    fontSize: 13,
  });

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
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Skills &amp; Agents</h2>
        <p style={{ color: '#6a6a6a', marginBottom: 28 }}>Drop .md files to upload skills and agents</p>

        {/* Drop zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? '#ec1d2e' : '#2a2a2a'}`,
            borderRadius: 12,
            padding: '32px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            marginBottom: 28,
            background: dragging ? 'rgba(236,29,46,0.04)' : '#0a0a0a',
            transition: 'all .15s',
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke={dragging ? '#ec1d2e' : '#3a3a3a'}
            strokeWidth="1.5"
            style={{ margin: '0 auto 12px', display: 'block' }}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p style={{ color: dragging ? '#ec1d2e' : '#6a6a6a', fontSize: 14, marginBottom: 4 }}>
            Drop .md files here or click to browse
          </p>
          <p style={{ color: '#3a3a3a', fontSize: 12 }}>Supports Claude Code agent and skill files</p>
          <input
            ref={inputRef}
            type="file"
            accept=".md"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={tabStyle(filter === f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && (
                <span style={{ marginLeft: 6, color: '#6a6a6a', fontWeight: 400 }}>
                  ({items.filter((i) => (f === 'skills' ? i.type === 'skill' : i.type === 'agent')).length})
                </span>
              )}
            </button>
          ))}
          <span style={{ marginLeft: 8, color: '#3a3a3a', fontSize: 13, alignSelf: 'center' }}>
            {items.length} total
          </span>
        </div>

        {/* List */}
        {displayed.length === 0 ? (
          <div
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              color: '#3a3a3a',
              fontSize: 14,
              border: '1px solid #1a1a1a',
              borderRadius: 12,
            }}
          >
            No {filter === 'all' ? 'items' : filter} yet — drop a .md file above
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {displayed.map((item) => (
              <div
                key={item.filename}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 16px',
                  background: '#0a0a0a',
                  borderBottom: '1px solid #141414',
                }}
              >
                {/* Type badge */}
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: item.type === 'agent' ? 'rgba(236,29,46,0.12)' : 'rgba(59,130,246,0.12)',
                    color: item.type === 'agent' ? '#ec1d2e' : '#60a5fa',
                    border: `1px solid ${item.type === 'agent' ? '#ec1d2e44' : '#3b82f644'}`,
                    flexShrink: 0,
                    minWidth: 48,
                    textAlign: 'center',
                  }}
                >
                  {item.type === 'agent' ? 'Agent' : 'Skill'}
                </span>

                {/* Name + description */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#e8e8e8', marginBottom: 2 }}>{item.name}</p>
                  {item.description && (
                    <p
                      style={{
                        fontSize: 12,
                        color: '#6a6a6a',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Filename */}
                <span
                  style={{
                    fontSize: 11,
                    color: '#3a3a3a',
                    fontFamily: 'monospace',
                    flexShrink: 0,
                    display: 'none',
                  }}
                  className="hide-mobile"
                >
                  {item.filename}
                </span>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => onUseInChat(`Use the ${item.name} ${item.type} to `)}
                    style={{
                      padding: '5px 12px',
                      background: 'rgba(236,29,46,0.10)',
                      border: '1px solid #ec1d2e44',
                      borderRadius: 6,
                      color: '#ec1d2e',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    Use
                  </button>
                  <button
                    onClick={() => handleDelete(item.filename)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      background: 'transparent',
                      border: '1px solid #2a2a2a',
                      color: '#6a6a6a',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                    }}
                  >
                    ✕
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
