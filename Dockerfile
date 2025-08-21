# Use the official Node.js image as the base
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Instale dependências de produção + CLI do NestJS globalmente para build
RUN npm ci && npm install -g @nestjs/cli

# Copy the rest of the application code
COPY . .

# Build the application
RUN nest build

# Use a lightweight production image
FROM node:20-alpine AS runner

# Set the working directory
WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json


RUN mkdir -p /app/arc/document /app/arc/image

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]
