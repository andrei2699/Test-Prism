# Start from the official Test Prism UI base image
FROM andreitimar/test-prism:ui-latest

# Use wget to fetch the layout file and save it as layout.json
RUN wget -O /usr/share/nginx/html/layout.json https://raw.githubusercontent.com/andreitimar/test-prism/main/docs/examples/layout-template.json

# Copy your test results and app config into the image
COPY app-config.json /usr/share/nginx/html/app-config.json
COPY test-results.json /usr/share/nginx/html/test-results.json