# Start from the official Test Prism UI base image
FROM andreitimar/test-prism:ui-latest

# Copy your test results, layout and app config into the image
COPY app-config.json /usr/share/nginx/html/app-config.json
COPY layout.json /usr/share/nginx/html/layout.json
COPY test-results.json /usr/share/nginx/html/test-results.json