FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci && npm cache clean --force

COPY . .

RUN npm run build

FROM nginx:1.29.4-alpine

RUN apk update && \
    apk upgrade && \
    apk add --no-cache curl gettext && \
    rm -rf /var/cache/apk/*

COPY --from=builder --chown=nginx:nginx /app/dist/test-prism-ui/browser /usr/share/nginx/html

RUN rm /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /test-results && \
    chown -R nginx:nginx /test-results /var/cache/nginx /usr/share/nginx/html && \
    chmod -R u+w /usr/share/nginx/html

USER nginx

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl --fail --silent http://localhost:8080/index.html || exit 1

CMD ["/bin/sh", "-c", "envsubst < /usr/share/nginx/html/index.html > /tmp/index.html && mv /tmp/index.html /usr/share/nginx/html/index.html && nginx -g 'daemon off;'"]
