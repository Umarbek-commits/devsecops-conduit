FROM node:22-slim AS build
WORKDIR /app
ARG REACT_PUBLIC_API_ENDPOINT=http://127.0.0.1:8000/api
ENV REACT_PUBLIC_API_ENDPOINT=${REACT_PUBLIC_API_ENDPOINT}
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/build ./build
COPY server.js ./
USER node
EXPOSE 3000
CMD ["node", "server.js"]
