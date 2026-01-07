# Displaying Test Results

Test Prism is designed to visualize test data that has been parsed into its standard JSON format.

## Method 1: Custom Docker Image

This approach creates a self-contained Docker image that includes both the UI and your specific test results. This is the simplest way to get your test data visualized.

### Step 1: Obtain Your Test Data

First, use the [Test Prism Parser](./development-guide.md#parser-rust-cli) to convert your test report (e.g., a JUnit XML file) into the required `test-results.json` format.

For this guide, we will use the following example `test-results.json` file. Place it in a new, empty directory.

```json
{
  "version": 1,
  "date": "2024-01-04T12:00:00Z",
  "tests": [
    {
      "name": "should initialize",
      "path": "/src/app/components/navbar",
      "lastExecutionType": "SUCCESS",
      "durationMs": 150
    },
    {
      "name": "should render",
      "path": "/src/app/components/test-tree",
      "lastExecutionType": "SUCCESS",
      "durationMs": 200
    },
    {
      "name": "should handle error",
      "path": "/src/app/services/auth",
      "lastExecutionType": "FAILURE",
      "durationMs": 100
    },
    {
      "name": "should navigate",
      "path": "/src/app/pages/home",
      "lastExecutionType": "SKIPPED",
      "durationMs": 0
    }
  ]
}
```

### Step 2: Create a Dockerfile

In the same directory, create a file named `Dockerfile` with the following content:

```dockerfile
# Start from the official Test Prism UI base image
FROM test-prism-ui:latest

# Copy your test results into the image
COPY test-results.json /test-results/results.json

# Set the environment variable to point to your file
ENV TEST_RESULTS_FILE=/test-results/results.json
```

This Dockerfile uses the base UI image, copies your JSON data into a specific directory inside the container, and then tells the application where to find it.

### Step 3: Build the Custom Image

Now, build your custom Docker image. Open a terminal in the directory containing your `Dockerfile` and `test-results.json` and run the following command:

```bash
docker build -t my-test-report .
```

You can replace `my-test-report` with any name you prefer for your image.

### Step 4: Run the Container

Finally, run your newly created image as a container:

```bash
docker run -p 8080:80 my-test-report
```

This command starts the container and maps port `8080` on your local machine to port `80` inside the container.

You can now open your web browser and navigate to **http://localhost:8080** to see your test results visualized in the Test Prism dashboard.
