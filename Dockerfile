# ---- Build stage: compile the Vite app ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# ---- Runtime stage: serve static files with nginx ----
FROM nginx:1.27-alpine

# Live AI is off unless these are set at run time (docker-compose.yml reads them from .env).
# The placeholder URL keeps nginx valid when no endpoint is configured.
ENV KIMI_BASE_URL=http://127.0.0.1:9/v1 \
    KIMI_API_KEY= \
    KIMI_MODEL_NAME=

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
CMD ["nginx", "-g", "daemon off;"]
