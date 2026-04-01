# Omnichannel Frontend (React + Vite)

Frontend for the Omnichannel platform.

## Requirements

1. Node.js 18+
2. npm 9+

## Environment

Create a local env file from the template:

```bash
cp .env.example .env
```

Required variables:

1. VITE_API_BASE_URL: backend base URL (example: http://localhost:7111)

## Development

Install dependencies:

```bash
npm install
```

Run frontend dev server:

```bash
npm run dev
```

By default Vite serves on http://localhost:5173.

## Build

Create production build into dist:

```bash
npm run build
```

Build and sync output to backend static folder (../wwwroot):

```bash
npm run build:sync
```

## Quality

Run lint:

```bash
npm run lint
```

Run CSS lint:

```bash
npm run lint:styles
```
