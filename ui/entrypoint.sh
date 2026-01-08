#!/bin/sh
set -e

echo "{
  \"layoutUrl\": \"${LAYOUT_URL:-/layout.json}\"
}" > /usr/share/nginx/html/app-config.json

nginx -g 'daemon off;'
