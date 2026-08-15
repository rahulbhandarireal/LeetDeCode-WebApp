# Stage 1: Build the Vite application
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Accept build arguments for environment variables
ARG VITE_USER_SERVICE_URL
ARG VITE_BATTLE_SERVICE_URL

# Set environment variables for the build process
ENV VITE_USER_SERVICE_URL=$VITE_USER_SERVICE_URL
ENV VITE_BATTLE_SERVICE_URL=$VITE_BATTLE_SERVICE_URL

# Build the Vite application
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
