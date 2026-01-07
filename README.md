# Test Prism

**Test Prism** is a unified test result parser and visualization dashboard. It provides a high-performance Rust-based CLI to normalize various test reports into a standard JSON format, and a modern Angular dashboard to visualize the results.

![Dashboard Screenshot](./docs/public/dashboard-view.png)

The goal is to provide a clear, interactive, and insightful view into your test execution cycles, helping you identify failures, track performance, and understand trends.

## Key Features

-   **Universal Parser**: A powerful Rust CLI that converts test reports (starting with JUnit) into a standardized JSON format.
-   **Interactive Dashboard**: A modern Angular UI to explore test results, with features like:
    -   High-level summary charts.
    -   Hierarchical test tree navigation.
    -   Detailed failure analysis with error logs.
-   **Containerized & Shareable**: Package your test reports into self-contained Docker images for easy sharing and deployment.

## Documentation

For detailed information on how to use the dashboard, display your test results, and contribute to the project, please see our full documentation:

**[View Documentation on GitHub Pages](https://andrei2699.github.io/Test-Prism/)**

## Quick Look

### 1. Parse a Report

Use the Rust CLI to parse a JUnit XML file.

```bash
# From the /parser directory
cargo run -- parse --report-type junit --input /path/to/report.xml --output test-results.json
```

### 2. Visualize the Results

Create a `Dockerfile` to bundle the generated `test-results.json` with the UI.

```dockerfile
FROM test-prism-ui:latest
COPY test-results.json /test-results/results.json
ENV TEST_RESULTS_FILE=/test-results/results.json
```

Build and run the container:

```bash
docker build -t my-test-report .
docker run -p 8080:80 my-test-report
```

Navigate to `http://localhost:8080` to see your report.

## License

This project is licensed under the Apache-2.0 License.
