# Dharmaverse

A modern React application built with Vite and TypeScript.

## Prerequisites

- [Bun](https://bun.sh/) - The latest version of Bun package manager
- Node.js 18+ (for development)

## Getting Started

1. Install dependencies:
```bash
bun install
```

2. Start the development server:
```bash
bun run dev
```

3. Build for production:
```bash
bun run build
```

4. Preview production build:
```bash
bun run preview
```

## Deployment on Render

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Create a new Web Service on Render
3. Connect your repository
4. Configure the following settings:
   - Build Command: `bun install && bun run build`
   - Start Command: `bun run start`
   - Environment: Node

## Project Structure

```
├── src/
│   ├── pages/         # Page components
│   ├── components/    # Reusable components
│   ├── App.tsx        # Main App component
│   ├── main.tsx       # Application entry point
│   └── index.css      # Global styles
├── public/            # Static assets
├── index.html         # HTML entry point
├── package.json       # Project dependencies
├── tsconfig.json      # TypeScript configuration
└── vite.config.ts     # Vite configuration
``` 