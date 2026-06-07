# Stage 1: Build the Vue application
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install project dependencies
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build the production bundle
RUN npm run build

# Stage 2: Create the final server image
FROM nginx:alpine

# Copy the built static files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy Nginx template configuration for dynamic port mapping
COPY default.conf.template /etc/nginx/templates/default.conf.template

# Set default port to 8080 (Railway or local runner can override this via PORT env variable)
ENV PORT=8080

# Expose the default port
EXPOSE 8080

# Nginx alpine image starts Nginx automatically by default
