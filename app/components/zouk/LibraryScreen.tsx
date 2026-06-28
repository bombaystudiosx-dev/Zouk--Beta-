import React, { useEffect, useRef, useState } from 'react';
import { openDatabase, getAll } from '~/lib/persistence/db';
import type { ChatHistoryItem } from '~/lib/persistence/useChatHistory';

interface LibraryFile {
  name: string;
  size: string;
  icon: string;
  addedAt: string;
}

const FILE_STORAGE_KEY = 'zouk_beta_library_v1';

const EXT_ICONS: Record<string, string> = {
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

function readFiles(): LibraryFile[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(FILE_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LibraryFile[]) : [];
  } catch {
    return [];
  }
}

function writeFiles(files: LibraryFile[]) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(FILE_STORAGE_KEY, JSON.stringify(files));
  }
}

type Tab = 'chats' | 'files';

export function LibraryScreen() {
  const [tab, setTab] = useState<Tab>('chats');
  const [chats, setChats] = useState<ChatHistoryItem[]>([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [files, setFiles] = useState<LibraryFile[]>(readFiles);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    openDatabase().then((db) => {
      if (!db || cancelled) {
        setChatsLoading(false);
        return;
      }

      getAll(db)
        .then((all) => {
          if (!cancelled) {
            setChats(all.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
            setChatsLoading(false);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setChatsLoading(false);
          }
        });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    writeFiles(files);
  }, [files]);

  const filteredChats = chats.filter(
    (c) =>
      (c.description ?? 'Untitled chat').toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredFiles = files.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const kb = Math.round(file.size / 1024);
    const size = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    const now = new Date().toLocaleString();
    setFiles((prev) => [{ name: file.name, size, icon: EXT_ICONS[ext] ?? '📁', addedAt: now }, ...prev]);
    event.target.value = '';
  };

  const tabStyle = (t: Tab): React.CSSProperties => ({
    padding: '8px 16px',
    background: tab === t ? 'rgba(236,29,46,0.12)' : '#111',
    border: `1px solid ${tab === t ? '#ec1d2e' : '#1e1e1e'}`,
    borderRadius: 8,
    color: tab === t ? '#ec1d2e' : '#b5b5b5',
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
      <div style={{ maxWidth: 1200 }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 6, marginTop: 0 }}>Library</h2>
        <p style={{ color: '#6a6a6a', fontSize: 13, marginBottom: 24 }}>
          Chat history and uploaded file metadata from your workspace.
        </p>

        {/* Tabs + search */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setTab('chats')} style={tabStyle('chats')}>
            Chat History {!chatsLoading && `(${chats.length})`}
          </button>
          <button onClick={() => setTab('files')} style={tabStyle('files')}>
            Files ({files.length})
          </button>
          <input
            type="text"
            placeholder={tab === 'chats' ? 'Search chats…' : 'Search files…'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              minWidth: 180,
              padding: '8px 12px',
              background: '#0a0a0a',
              border: '1px solid #1c1c1c',
              borderRadius: 8,
              color: '#e8e8e8',
              fontSize: 13,
              outline: 'none',
            }}
          />
          {tab === 'files' && (
            <>
              <button
                onClick={() => inputRef.current?.click()}
                style={{
                  padding: '8px 14px',
                  background: 'rgba(236,29,46,0.12)',
                  border: '1px solid #ec1d2e',
                  borderRadius: 8,
                  color: '#ec1d2e',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                + Add File
              </button>
              <input ref={inputRef} type="file" onChange={handleUpload} style={{ display: 'none' }} />
            </>
          )}
        </div>

        {/* CHATS TAB */}
        {tab === 'chats' && (
          <div>
            {chatsLoading ? (
              <p style={{ color: '#555', fontSize: 13 }}>Loading chat history…</p>
            ) : filteredChats.length === 0 ? (
              <div
                style={{
                  border: '1px solid #1a1a1a',
                  borderRadius: 12,
                  padding: 28,
                  color: '#555',
                  background: '#0a0a0a',
                  textAlign: 'center',
                }}
              >
                {search ? 'No chats match that search.' : 'No chat history yet. Start a conversation to see it here.'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filteredChats.map((chat) => {
                  const title = chat.description ?? 'Untitled chat';
                  const date = new Date(chat.timestamp).toLocaleString();
                  const msgCount = chat.messages?.length ?? 0;

                  return (
                    <div
                      key={chat.id}
                      style={{
                        background: '#0a0a0a',
                        border: '1px solid #1a1a1a',
                        borderRadius: 10,
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        transition: 'border-color .15s',
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = '#2a2a2a')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = '#1a1a1a')}
                    >
                      <span style={{ fontSize: 20, flexShrink: 0 }}>💬</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontWeight: 600,
                            color: '#e8e8e8',
                            fontSize: 14,
                            margin: 0,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {title}
                        </p>
                        <p style={{ fontSize: 12, color: '#555', margin: '3px 0 0' }}>
                          {date} · {msgCount} message{msgCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <a
                        href={`/chat/${chat.urlId ?? chat.id}`}
                        style={{
                          padding: '6px 12px',
                          background: '#111',
                          border: '1px solid #2a2a2a',
                          borderRadius: 6,
                          color: '#9a9a9a',
                          fontSize: 12,
                          textDecoration: 'none',
                          flexShrink: 0,
                        }}
                      >
                        Open
                      </a>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* FILES TAB */}
        {tab === 'files' && (
          <div>
            {filteredFiles.length === 0 ? (
              <div
                style={{
                  border: '1px solid #1a1a1a',
                  borderRadius: 12,
                  padding: 28,
                  color: '#555',
                  background: '#0a0a0a',
                  textAlign: 'center',
                }}
              >
                {search ? 'No files match that search.' : 'No files yet. Click "+ Add File" to add file metadata.'}
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 16,
                }}
              >
                {filteredFiles.map((file) => (
                  <div
                    key={file.name + file.addedAt}
                    style={{
                      background: '#0a0a0a',
                      border: '1px solid #1a1a1a',
                      borderRadius: 12,
                      overflow: 'hidden',
                      transition: 'border-color .15s',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = '#ec1d2e')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = '#1a1a1a')}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: 100,
                        background: 'linear-gradient(135deg, #1a0a0c, #0a0a0a)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 32,
                      }}
                    >
                      {file.icon}
                    </div>
                    <div style={{ padding: 12 }}>
                      <p
                        style={{
                          fontWeight: 600,
                          color: '#fff',
                          marginBottom: 3,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontSize: 12,
                          marginTop: 0,
                        }}
                      >
                        {file.name}
                      </p>
                      <p style={{ fontSize: 11, color: '#6a6a6a', marginBottom: 2, marginTop: 0 }}>{file.size}</p>
                      <p style={{ fontSize: 11, color: '#555', marginBottom: 10, marginTop: 0 }}>{file.addedAt}</p>
                      <button
                        onClick={() =>
                          setFiles((prev) => prev.filter((f) => !(f.name === file.name && f.addedAt === file.addedAt)))
                        }
                        style={{
                          width: '100%',
                          padding: 6,
                          background: '#111',
                          border: '1px solid #242424',
                          borderRadius: 6,
                          color: '#777',
                          fontSize: 11,
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
        )}
      </div>
    </div>
  );
}
