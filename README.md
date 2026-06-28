# ZOUK Beta

[![ZOUK Beta — AI Builder Workstation](./public/social_preview_index.jpg)](https://zouk.diy)

**ZOUK Beta** is a desktop-ready AI builder workstation built for people who want more than a prompt box.

ZOUK is designed to help users plan, build, edit, import, and operate projects from one focused workspace. It combines AI chat, model routing, project organization, connector control, GitHub project loading, and a future permission-based Agent Mode that can take approved actions for the user.

This is not just a fork. This is the ZOUK build direction.

---

## What ZOUK Is

ZOUK is an AI-powered builder environment for creating and improving apps, websites, automations, campaigns, and digital products.

The goal is simple:

**Bring ideas to life, load existing projects, and let the user control how much action ZOUK is allowed to take.**

ZOUK is being shaped into a real workstation where a user can:

- start a new build from a prompt
- connect AI model providers
- organize projects and tasks
- import GitHub repositories
- work with app files and builder workflows
- prepare deployment paths
- run the desktop version on Windows, macOS, and Linux
- eventually allow ZOUK to perform approved browser and desktop actions

---

## Product Direction

ZOUK is being built around three major ideas:

### 1. Builder Workspace

A focused AI workspace for creating and editing projects.

Users should be able to describe what they want, choose a model, upload context, generate code, review changes, and continue building without jumping between multiple tools.

### 2. Connector Center

A central place for connecting the tools builders actually use.

The connector system is being designed around services like:

- OpenRouter
- GitHub
- Vercel
- Supabase
- Cloudflare
- Netlify
- Firebase
- Stripe
- Resend
- Neon
- Railway
- Render

The current connector layer supports local beta connection state. Backend actions and production OAuth flows are being added in phases.

### 3. Agent Mode

Agent Mode is the upcoming operator layer for ZOUK.

The goal is not for ZOUK to simply view files. The goal is for ZOUK to perform approved actions for the user.

Agent Mode is being designed around permission choices like:

- Deny
- Allow Once
- Allow This Session
- Always Allow

High-risk actions should always require confirmation.

Examples of future action categories:

- browser navigation
- browser form filling
- GitHub repo import
- GitHub file reading
- GitHub branch and commit actions
- local app opening
- local file organization
- desktop cleanup
- downloads folder cleanup
- deployment actions
- system-level actions

ZOUK should feel powerful, but not reckless.

---

## Current Build Status

ZOUK Beta currently includes a working foundation for:

- AI chat workspace
- model/provider routing direction
- OpenRouter-first ZOUK model flow
- free, fast, deep, and elite model grouping
- connector center foundation
- local connector status tracking
- onboarding skip path for beta testing
- projects screen
- tasks screen
- library metadata screen
- settings screen
- local beta persistence
- desktop-ready Electron structure
- Windows, macOS, and Linux build scripts

Some systems are still beta-level and intentionally staged locally until backend storage and production connector actions are added.

---

## In Active Build

The next major ZOUK work is focused on:

### Agent Mode Foundation

A permission-based system that controls what ZOUK can do for the user.

This includes approval modals, action categories, risk levels, session permissions, and revocable always-allow permissions.

### GitHub Project Import

The ability to bring existing GitHub projects into ZOUK and turn them into active workspaces.

The planned flow:

1. Connect or enter a GitHub repository.
2. Parse the owner, repo, and branch.
3. Create a ZOUK project workspace.
4. Load repo metadata.
5. Prepare the project for chat, editing, tasks, and future commit actions.

### Desktop Downloads

ZOUK is being prepared as a real downloadable desktop app for:

- Windows
- macOS
- Linux

The repository already includes Electron build commands. The next step is packaging, release artifacts, and a download experience that does not fake unavailable installers.

---

## Desktop Build Commands

ZOUK includes Electron build commands for native desktop packaging.

```bash
pnpm electron:build:win
pnpm electron:build:mac
pnpm electron:build:linux
pnpm electron:build:dist
```

Expected installer directions:

- Windows: `.exe` or `.msi`
- macOS: `.dmg`
- Linux: `.AppImage` or `.deb`

Production desktop releases should be generated through a trusted build machine or CI workflow, then attached to GitHub Releases or another secure download host.

---

## Local Development

Install dependencies:

```bash
pnpm install
```

Run the development server:

```bash
pnpm run dev
```

Typecheck:

```bash
pnpm run typecheck
```

Lint:

```bash
pnpm run lint
```

Build:

```bash
pnpm run build
```

---

## Core Scripts

```bash
pnpm run dev
pnpm run build
pnpm run typecheck
pnpm run lint
pnpm run preview
pnpm electron:dev
pnpm electron:build:win
pnpm electron:build:mac
pnpm electron:build:linux
```

---

## Model Strategy

ZOUK is being shaped around model choice without overwhelming the user.

The intended grouping is:

- Free
- Fast
- Deep
- Elite

ZOUK remains the default free model identity in the interface while backend model routing continues to evolve.

OpenRouter is the preferred first provider for broad model access because it gives users one place to connect multiple models.

---

## Connector Strategy

The connector center is not meant to be decoration.

The long-term plan is for each connector to move through stages:

1. UI presence
2. local beta connection state
3. credential/API key support
4. backend action routes
5. production OAuth
6. secure account-level storage
7. real actions inside the builder workflow

This lets ZOUK grow from a working beta into a production workstation without pretending every connector is already fully automated.

---

## Agent Permission Rules

ZOUK Agent Mode should follow these product rules:

- Low-risk actions can support Allow Once, Allow This Session, or Always Allow.
- Medium-risk actions can support Allow Once or project/session-based approval.
- High-risk actions should always require confirmation.
- Destructive actions should never run silently.

Actions that should always require confirmation include:

- deleting files
- overwriting files
- moving many files at once
- submitting forms
- sending messages or emails
- making purchases
- changing passwords
- changing system settings
- pushing commits
- deploying to production
- exposing API keys or secrets

---

## What ZOUK Is Not

ZOUK is not meant to be a generic clone.

ZOUK is not just a browser prompt-to-code page.

ZOUK is being built as a branded AI builder workstation with desktop packaging, connector control, GitHub loading, and permission-based operator actions.

The lane is:

**AI builder workstation + connector center + GitHub project loading + Agent Mode + desktop app.**

---

## Roadmap

Near-term roadmap:

- complete Agent Mode permission foundation
- add reusable action approval modal
- add GitHub project import
- create repo workspace screen
- add desktop download screen/cards
- clean up README and public branding
- replace legacy fork assets with ZOUK assets
- add real backend connector routes
- add Supabase-backed project/task/library sync
- add real file storage
- add GitHub file tree loading
- add branch and commit workflows
- add Vercel deployment actions
- prepare Windows/macOS/Linux releases

---

## Build Philosophy

ZOUK should be honest about what is real now and what is being wired next.

The product should not fake completed automation. It should show clear states like:

- Connected
- Permission required
- Backend action required
- Desktop permission required
- Build required
- Native agent required

That keeps the product trustworthy while still making it feel powerful.

---

## Founder Direction

ZOUK is part of the Metallic V1 product direction.

The focus is on building tools that feel useful, premium, direct, and action-oriented.

ZOUK should help users move from idea to working project faster, with fewer tabs, fewer disconnected tools, and more guided execution.

---

## License

Private / unreleased product direction.

Do not treat this README as final public launch copy until branding, binary assets, release links, and backend connector claims are verified.
