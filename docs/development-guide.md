# Development Guide

This guide provides instructions for setting up and running the Test Prism project locally for development or
contribution purposes.

## UI (Angular Dashboard)

### Prerequisites

- Node.js (v18 or later)
- npm (v9 or later)
- Angular CLI (`npm install -g @angular/cli`)

### Installation

1. Navigate to the `ui` directory:

   ```bash
   cd ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

Start the Angular development server:

```bash
npm start
```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Building for Production

To build the project for production:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Docker Support

The UI can be containerized using the provided `Dockerfile`.

1. Build the Docker image:

   ```bash
   docker build -t test-prism-ui .
   ```

2. Run the container:
   ```bash
   docker run -p 80:80 test-prism-ui
   ```

## Docs (VitePress)

### Prerequisites

- Node.js (v18 or later)
- npm (v9 or later)

### Installation

1. Navigate to the `docs` directory:

   ```bash
   cd docs
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

Start the VitePress development server:

```bash
npm run docs:dev
```

This will start a local development server and open up a browser window. Most changes are reflected live without having
to restart the server.

### Building for Production

To build the documentation for production:

```bash
npm run docs:build
```

The build artifacts will be stored in the `.vitepress/dist` directory.

## Parser (Rust CLI)

### Prerequisites

- Rust (latest stable version recommended)
- Cargo (comes with Rust)

### Running Locally

1. Navigate to the `parser` directory:

   ```bash
   cd parser
   ```

2. Build and run the CLI:
   ```bash
   cargo run -- --help
   ```

For detailed usage instructions and command-line arguments, please refer to the [Parser Usage Guide](./parser-usage.md).
