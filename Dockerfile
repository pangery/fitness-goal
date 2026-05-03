FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY src ./src
COPY data ./data

ENV NODE_ENV=production
ENV DATA_FILE=/app/data/fitness-goal.json

EXPOSE 3000
VOLUME ["/app/data"]

CMD ["node", "src/index.js"]
