FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/admin-web/package.json ./apps/admin-web/package.json
COPY apps/client-web/package.json ./apps/client-web/package.json
RUN npm ci

COPY apps/client-web ./apps/client-web

EXPOSE 3002

CMD ["npm", "run", "client-web:dev"]
