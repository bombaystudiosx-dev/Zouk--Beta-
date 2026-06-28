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

const RELEASES_PAGE = 'https://github.com/Internetkartel/Zouk-App/releases';

const DOWNLOAD_OPTIONS: DesktopDownloadOption[] = [
  {
    platform: 'windows',
    label: 'Windows',
    icon: '🪟',
    fileType: '.exe',
    fileTypeLabel: 'Windows Installer (.exe)',
    status: 'available',
    artifactUrl: 'https://github.com/Internetkartel/Zouk-App/releases/download/latest/zouk-1.0.0-win-x64-setup.exe',
    buildCommand: 'pnpm electron:build:win',
    notes: 'x64 installer built with electron-builder. Run as administrator if Windows SmartScreen prompts.',
  },
  {
    platform: 'macos',
    label: 'macOS',
    icon: '🍎',
    fileType: '.dmg',
    fileTypeLabel: 'macOS Disk Image (.dmg)',
    status: 'available',
    artifactUrl: 'https://github.com/Internetkartel/Zouk-App/releases/download/latest/Zouk-1.0.0-arm64.dmg',
    buildCommand: 'pnpm electron:build:mac',
    notes: 'Apple Silicon (M1/M2/M3). Not notarized — right-click → Open on first launch to bypass Gatekeeper.',
  },
  {
    platform: 'linux',
    label: 'Linux',
    icon: '🐧',
    fileType: '.AppImage / .deb',
    fileTypeLabel: 'AppImage or Debian Package',
    status: 'available',
    artifactUrl: 'https://github.com/Internetkartel/Zouk-App/releases/download/latest/zouk-1.0.0-linux-x86_64.AppImage',
    buildCommand: 'pnpm electron:build:linux',
    notes: `AppImage (universal) or .deb for Debian/Ubuntu. All builds at ${RELEASES_PAGE}`,
  },
];

export function getDesktopDownloadOptions(): DesktopDownloadOption[] {
  return DOWNLOAD_OPTIONS;
}
