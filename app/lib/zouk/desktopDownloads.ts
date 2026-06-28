export type DownloadStatus = 'build_required' | 'available' | 'unavailable';

export interface DesktopDownloadOption {
  platform: 'windows' | 'macos' | 'linux';
  label: string;
  icon: string;
  fileType: string;
  fileTypeLabel: string;
  status: DownloadStatus;
  artifactUrl: string | null;
  buildCommand: string;
  notes: string;
}

const DOWNLOAD_OPTIONS: DesktopDownloadOption[] = [
  {
    platform: 'windows',
    label: 'Windows',
    icon: '🪟',
    fileType: '.exe / .msi',
    fileTypeLabel: 'Windows Installer (.exe)',
    status: 'build_required',
    artifactUrl: null,
    buildCommand: 'pnpm electron:build:win',
    notes:
      'Generates a Windows installer via electron-builder. Run on a Windows machine or a CI runner with a Windows image.',
  },
  {
    platform: 'macos',
    label: 'macOS',
    icon: '🍎',
    fileType: '.dmg',
    fileTypeLabel: 'macOS Disk Image (.dmg)',
    status: 'build_required',
    artifactUrl: null,
    buildCommand: 'pnpm electron:build:mac',
    notes:
      'Generates a .dmg via electron-builder. Requires macOS build environment. Code signing and notarization are a future phase.',
  },
  {
    platform: 'linux',
    label: 'Linux',
    icon: '🐧',
    fileType: '.AppImage / .deb',
    fileTypeLabel: 'AppImage or Debian Package',
    status: 'build_required',
    artifactUrl: null,
    buildCommand: 'pnpm electron:build:linux',
    notes: 'Generates an AppImage and .deb via electron-builder. Run on a Linux machine or CI runner.',
  },
];

export function getDesktopDownloadOptions(): DesktopDownloadOption[] {
  return DOWNLOAD_OPTIONS;
}
