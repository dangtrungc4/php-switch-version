# PHP Version Manager (Electron Edition)

A professional PHP version manager for Windows that supports global switching and per-project configurations.

## Features

- **Global Switch**: Easily change the system-wide PHP version.
- **Per-Project PHP**: Run different PHP versions for different projects via a custom Terminal.
- **Auto Installation**: Download and setup PHP versions directly from PHP.net.
- **Modern UI**: High-end interface built with React, TailwindCSS, and Framer Motion.

## Tech Stack

- **Electron.js**
- **React + TypeScript**
- **TailwindCSS**
- **lowdb** (Storage)
- **sudo-prompt** (Admin elevation)

## Getting Started

### Prerequisites

- Node.js installed.
- Windows OS (designed for Windows symlinks).

### Development

```bash
npm install
npm run dev
```

### Build

```bash
npm run build:win
```

## Important Note

This application requires **Administrator Rights** to create symlinks at `C:\PHPManager\current`. Please run your terminal or the app as Administrator.
