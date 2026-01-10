# Displaying Test Results

Test Prism is designed to visualize test data that has been parsed into its standard JSON format. This guide will walk
you through the two main methods for displaying your test results.

## Method 1: Self-Hosted Reports in a Custom Docker Image

This approach creates a self-contained Docker image that includes the UI, test results, and layout configuration. This
is the simplest way to get your test data visualized.

An example of the setup described below can be found at [
`docs/examples/docker-example`](https://github.com/andreitimar/Test-Prism/tree/main/docs/examples/docker-example).

### Step 1: Create a Directory and Test Data

Create a new directory to hold your report files. Then, use the [Test Prism Parser](./parser-usage.md) to convert your
test report (e.g., a JUnit XML file) into the required `test-results.json` format and place it in the directory you
created.

### Step 2: Create an `app-config.json`

Create an `app-config.json` file to specify the location of your `layout.json`.

```json
{
  "layoutUrl": "/layout.json"
}
```

### Step 3: Create a Dockerfile

Create a `Dockerfile` to bundle your files with the Test Prism UI. You can either copy a local `layout.json` file or
fetch a remote one.

#### Option A: Using a Local `layout.json`

```dockerfile
# Start from the official Test Prism UI base image
FROM andreitimar/test-prism:ui-latest

# Copy your test results, layout and app config into the image
COPY app-config.json /usr/share/nginx/html/app-config.json
COPY layout.json /usr/share/nginx/html/layout.json
COPY test-results.json /usr/share/nginx/html/test-results.json
```

#### Option B: Using a Remote `layout.json`

You can use a pre-made layout template, such as
the [Dashboard Layout template](https://raw.githubusercontent.com/andreitimar/test-prism/main/docs/examples/layout-template.json).

```dockerfile
# Start from the official Test Prism UI base image
FROM andreitimar/test-prism:ui-latest

# Use wget to fetch the layout file and save it as layout.json
RUN wget -O /usr/share/nginx/html/layout.json https://raw.githubusercontent.com/andreitimar/test-prism/main/docs/examples/layout-template.json

# Copy your test results and app config into the image
COPY app-config.json /usr/share/nginx/html/app-config.json
COPY test-results.json /usr/share/nginx/html/test-results.json
```

### Step 4: Build and Run

Build and run the Docker image:

```bash
docker build -t my-test-report .
docker run -p 8080:80 my-test-report
```

Your test report will be available at `http://localhost:8080`.

## Method 2: Using an External Server for Reports

This method uses the official Test Prism Docker image and an external server to serve your test results and layout file.

An example of this setup can be found at [
`docs/examples/json-server-example`](https://github.com/andreitimar/Test-Prism/tree/main/docs/examples/json-server-example).

### Step 1: Host Your JSON Files

Host your `layout.json` and `test-results.json` files on any web server. For a quick local setup, you can use
`json-server`.

### Step 2: Create an `app-config.json`

Create an `app-config.json` file that points to the URL of your hosted `layout.json`.

```json
{
  "layoutUrl": "http://localhost:3000/layout"
}
```

### Step 3: Run the Test Prism Docker Container

Run the official Test Prism Docker image and mount your `app-config.json` file.

```bash
docker run -p 8080:80 -v ./app-config.json:/usr/share/nginx/html/app-config.json andreitimar/test-prism:ui-latest
```

Your dashboard will be available at `http://localhost:8080`.
