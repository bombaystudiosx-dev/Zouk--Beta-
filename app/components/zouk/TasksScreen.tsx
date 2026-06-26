import React, { useState } from 'react';

interface Task {
  name: string;
  project: string;
  time: string;
  status: 'running' | 'done' | 'paused';
}

const DEMO_TASKS: Task[] = [
  {
    name: 'Generate 10 ad variations for summer sale',
    project: 'Q3 Meta Campaign',
    time: '2 hours ago',
    status: 'done',
  },
  {
    name: 'Write landing page copy for product launch',
    project: 'Landing Page Redesign',
    time: '5 hours ago',
    status: 'done',
  },
  {
    name: 'Create email sequence for trial users',
    project: 'Email Drip Sequence',
    time: 'Yesterday',
    status: 'paused',
  },
  {
    name: 'Build responsive pricing table component',
    project: 'Landing Page Redesign',
    time: '2 days ago',
    status: 'done',
  },
  { name: 'Automate Instagram post scheduling', project: 'Q3 Meta Campaign', time: '3 days ago', status: 'done' },
];

const STATUS_COLORS: Record<Task['status'], { bg: string; color: string; label: string }> = {
  running: { bg: 'rgba(236,29,46,0.12)', color: '#ec1d2e', label: 'Running' },
  done: { bg: 'rgba(62,212,127,0.1)', color: '#3ed47f', label: 'Done' },
  paused: { bg: '#1a1a1a', color: '#9a9a9a', label: 'Paused' },
};

interface Props {
  onContinue: (taskName: string) => void;
}

export function TasksScreen({ onContinue }: Props) {
  const [tasks] = useState<Task[]>(DEMO_TASKS);

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
        <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>All Tasks</h2>
        <p style={{ color: '#b5b5b5', marginBottom: 28 }}>Your task history</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tasks.map((task, i) => {
            const s = STATUS_COLORS[task.status];
            return (
              <div
                key={i}
                style={{
                  background: '#0a0a0a',
                  border: '1px solid #1a1a1a',
                  borderRadius: 8,
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  animation: 'fadeIn .3s ease-out',
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 500, color: '#fff', marginBottom: 4, fontSize: 14 }}>{task.name}</p>
                  <p style={{ fontSize: 12, color: '#6a6a6a' }}>
                    {task.project} · {task.time}
                  </p>
                </div>
                <div
                  style={{
                    padding: '4px 10px',
                    background: s.bg,
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    color: s.color,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.label}
                </div>
                <button
                  onClick={() => onContinue(task.name)}
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(236,29,46,0.12)',
                    border: '1px solid #ec1d2e',
                    borderRadius: 6,
                    color: '#ec1d2e',
                    fontWeight: 500,
                    fontSize: 12,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Continue
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
