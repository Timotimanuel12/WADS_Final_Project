FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx prisma generate

EXPOSE 3000

# For checkpoint/local validation: run app and DB together via Compose without
# requiring production build-time secrets.
CMD ["sh", "-c", "npx prisma db push && npm run dev -- --hostname 0.0.0.0 --port 3000"]
