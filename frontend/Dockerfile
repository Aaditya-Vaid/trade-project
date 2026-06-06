FROM node:24-alpine AS build

WORKDIR /app
COPY package.json tsconfig.json tsconfig.app.json ./
RUN npm install
COPY index.html ./
COPY scripts ./scripts
COPY src ./src
RUN npm run build

FROM node:24-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/scripts ./scripts
EXPOSE 5173
CMD ["node", "scripts/serve.mjs", "dist"]
