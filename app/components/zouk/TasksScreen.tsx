import React, { useEffect, useState } from 'react';

interface Task {
  name: string;
  project: string;
  time: string;
  status: 'running' | 'done' | 'paused';
}

const STORAGE_KEY = 'zouk_beta_tasks_v1';

const STARTER_TASKS: Task[] = [
  {
    name: 'Audit current Zouk beta wiring',
    project: 'Zouk Builder Demo',
    time: 'Seeded for beta',
    status: 'done',
  },
  {
    name: 'Connect OpenRouter and test ZOUK model',
    project: 'Connector Setup Pass',
    time: 'Seeded for beta',
    status: 'paused',
  },
  {
    name: 'Prepare Vercel/Supabase deployment handoff',
    project: 'Connector Setup Pass',
    time: 'Seeded for beta',
    status: 'paused',
  },
];

const STATUS_COLORS: Record<Task['status'], { bg: string; color: string; label: string }> = {
  running: { bg: 'rgba(236,29,46,0.12)', color: '#ec1d2e', label: 'Running' },
  done: { bg: 'rgba(62,212,127,0.1)', color: '#3ed47f', label: 'Done' },
  paused: { bg: '#1a1a1a', color: '#9a9a9a', label: 'Paused' },
};

function readTasks(): Task[] {
  if (typeof window === 'undefined') {
    return STARTER_TASKS;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Task[]) : STARTER_TASKS;
  } catch {
    return STARTER_TASKS;
  }
}

function writeTasks(tasks: Task[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

interface Props {
  onContinue: (taskName: string) => void;
}

export function TasksScreen({ onContinue }: Props) {
  const [tasks, setTasks] = useState<Task[]>(readTasks);
  const [taskName, setTaskName] = useState('');
  const [projectName, setProjectName] = useState('Zouk Builder Demo');

  useEffect(() => {
    writeTasks(tasks);
  }, [tasks]);

  const createTask = () => {
    const name = taskName.trim() || `New Zouk task ${tasks.length + 1}`;
    setTasks((prev) => [
      { name, project: projectName.trim() || 'General', time: 'Just now', status: 'paused' },
      ...prev,
    ]);
    setTaskName('');
  };

  const cycleStatus = (name: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.name !== name) {
          return task;
        }

        const next = task.status === 'paused' ? 'running' : task.status === 'running' ? 'done' : 'paused';

        return { ...task, status: next, time: 'Just now' };
      }),
    );
  };

  const deleteTask = (name: string) => {
    setTasks((prev) => prev.filter((task) => task.name !== name));
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 20,
            marginBottom: 28,
          }}
        >
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8 }}>Tasks</h2>
            <p style={{ color: '#b5b5b5', marginBottom: 6 }}>Local beta task history and continuation prompts.</p>
            <p style={{ color: '#6a6a6a', fontSize: 12 }}>
              These persist in this browser until backend task sync is wired.
            </p>
          </div>
          <div
            style={{
              minWidth: 360,
              background: '#0a0a0a',
              border: '1px solid #1a1a1a',
              borderRadius: 12,
              padding: 14,
            }}
          >
            <input
              value={taskName}
              onChange={(event) => setTaskName(event.target.value)}
              placeholder="Add a beta task..."
              style={{
                width: '100%',
                padding: '9px 12px',
                background: '#060606',
                border: '1px solid #242424',
                borderRadius: 8,
                color: '#e8e8e8',
                fontSize: 13,
                outline: 'none',
                marginBottom: 10,
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={projectName}
                onChange={(event) => setProjectName(event.target.value)}
                placeholder="Project name"
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  background: '#060606',
                  border: '1px solid #242424',
                  borderRadius: 8,
                  color: '#b5b5b5',
                  fontSize: 12,
                  outline: 'none',
                }}
              />
              <button
                onClick={createTask}
                style={{
                  padding: '9px 14px',
                  background: 'rgba(236,29,46,0.12)',
                  border: '1px solid #ec1d2e',
                  borderRadius: 8,
                  color: '#ec1d2e',
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                + Add
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tasks.map((task) => {
            const s = STATUS_COLORS[task.status];
            return (
              <div
                key={task.name}
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
                <button
                  onClick={() => cycleStatus(task.name)}
                  style={{
                    padding: '4px 10px',
                    background: s.bg,
                    border: 'none',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 600,
                    color: s.color,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                  }}
                >
                  {s.label}
                </button>
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
                <button
                  onClick={() => deleteTask(task.name)}
                  style={{
                    padding: '8px 12px',
                    background: '#111',
                    border: '1px solid #242424',
                    borderRadius: 6,
                    color: '#777',
                    fontWeight: 500,
                    fontSize: 12,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
