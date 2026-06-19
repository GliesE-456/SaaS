FROM mcr.microsoft.com/playwright:v1.44.1-jammy

WORKDIR /app

# Install Node.js
RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y nodejs

# Install pnpm
RUN npm install -g pnpm

# Copy root monorepo files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/db ./packages/db
COPY apps/worker ./apps/worker

# Install dependencies and build
RUN pnpm install
RUN pnpm --filter @cct/db build
RUN pnpm --filter @cct/worker build

WORKDIR /app/apps/worker

CMD ["pnpm", "start"]
