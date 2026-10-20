FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/admin-web/package.json ./apps/admin-web/package.json
RUN npm ci

COPY apps/admin-web ./apps/admin-web

EXPOSE 3001

CMD ["npm", "run", "web:dev"]
