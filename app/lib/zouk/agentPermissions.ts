export type PermissionLevel = 'view-only' | 'ask-every-time' | 'allow-session' | 'always-allow';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface ActionCategory {
  id: string;
  label: string;
  description: string;
  riskLevel: RiskLevel;

  /** High-risk categories always require per-action confirmation, even with always-allow. */
  alwaysRequireConfirmation: boolean;
}

export interface PermissionEntry {
  categoryId: string;
  level: PermissionLevel;
  approvedAt: string;
  lastUsedAt?: string;
}

export const ACTION_CATEGORIES: ActionCategory[] = [
  {
    id: 'browser-navigation',
    label: 'Browser Navigation',
    description: 'Open URLs and navigate websites in a controlled browser session.',
    riskLevel: 'low',
    alwaysRequireConfirmation: false,
  },
  {
    id: 'browser-form-filling',
    label: 'Browser Form Filling',
    description: 'Fill in form fields within a browser session.',
    riskLevel: 'medium',
    alwaysRequireConfirmation: false,
  },
  {
    id: 'github-repo-import',
    label: 'GitHub Repo Import',
    description: 'Import a GitHub repository as a Zouk project.',
    riskLevel: 'low',
    alwaysRequireConfirmation: false,
  },
  {
    id: 'github-file-read',
    label: 'GitHub File Read',
    description: 'Read file contents from an imported or connected GitHub repository.',
    riskLevel: 'low',
    alwaysRequireConfirmation: false,
  },
  {
    id: 'github-branch-commit',
    label: 'GitHub Branch / Commit Actions',
    description: 'Create branches, commit, or push code to a GitHub repository.',
    riskLevel: 'medium',
    alwaysRequireConfirmation: false,
  },
  {
    id: 'local-app-opening',
    label: 'Local App Opening',
    description: 'Open applications on the local machine.',
    riskLevel: 'medium',
    alwaysRequireConfirmation: false,
  },
  {
    id: 'local-file-organization',
    label: 'Local File Organization',
    description: 'Create folders, rename, and organize files in the local filesystem.',
    riskLevel: 'medium',
    alwaysRequireConfirmation: false,
  },
  {
    id: 'downloads-cleanup',
    label: 'Downloads Folder Cleanup',
    description: 'Organize or remove items from the Downloads folder.',
    riskLevel: 'medium',
    alwaysRequireConfirmation: false,
  },
  {
    id: 'desktop-cleanup',
    label: 'Desktop Cleanup',
    description: 'Move or organize items on the desktop.',
    riskLevel: 'medium',
    alwaysRequireConfirmation: false,
  },
  {
    id: 'local-file-modification',
    label: 'Local File Modification',
    description: 'Overwrite, delete, or modify existing local files.',
    riskLevel: 'high',
    alwaysRequireConfirmation: true,
  },
  {
    id: 'system-settings',
    label: 'System Settings Changes',
    description: 'Modify operating system settings, preferences, or configurations.',
    riskLevel: 'high',
    alwaysRequireConfirmation: true,
  },
];

const STORAGE_KEY = 'zouk_agent_permissions_v1';

export function loadPermissions(): Record<string, PermissionEntry> {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Record<string, PermissionEntry>;
  } catch {
    return {};
  }
}

export function savePermissions(perms: Record<string, PermissionEntry>): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(perms));
}

export function getPermission(categoryId: string): PermissionEntry | null {
  const perms = loadPermissions();
  const entry = perms[categoryId];

  if (!entry) {
    return null;
  }

  // Session permissions expire on page reload — validated via sessionStorage sentinel
  if (entry.level === 'allow-session') {
    try {
      const mark = sessionStorage.getItem(`zouk_session_perm_${categoryId}`);

      if (!mark) {
        return null;
      }
    } catch {
      return null;
    }
  }

  return entry;
}

export function setPermission(categoryId: string, level: PermissionLevel): void {
  const perms = loadPermissions();
  const entry: PermissionEntry = {
    categoryId,
    level,
    approvedAt: new Date().toISOString(),
    lastUsedAt: new Date().toISOString(),
  };

  if (level === 'allow-session') {
    try {
      sessionStorage.setItem(`zouk_session_perm_${categoryId}`, '1');
    } catch {
      // ignore — sessionStorage may not be available in some environments
    }
  }

  perms[categoryId] = entry;
  savePermissions(perms);
}

export function revokePermission(categoryId: string): void {
  const perms = loadPermissions();
  delete perms[categoryId];
  savePermissions(perms);

  try {
    sessionStorage.removeItem(`zouk_session_perm_${categoryId}`);
  } catch {
    // ignore
  }
}

/** Returns true when the action can proceed without showing the approval modal. */
export function canProceedSilently(categoryId: string): boolean {
  const cat = ACTION_CATEGORIES.find((c) => c.id === categoryId);

  if (!cat || cat.alwaysRequireConfirmation) {
    return false;
  }

  const perm = getPermission(categoryId);

  if (!perm) {
    return false;
  }

  return perm.level === 'allow-session' || perm.level === 'always-allow';
}

export const PERMISSION_LEVEL_LABELS: Record<PermissionLevel, string> = {
  'view-only': 'View Only',
  'ask-every-time': 'Ask Every Time',
  'allow-session': 'This Session',
  'always-allow': 'Always Allow',
};

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#ef4444',
};
