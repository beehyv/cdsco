# Stage 1: Build the application
FROM node:18-alpine AS build-stage
# DONOT MODIFY FROM BELOW
# ENV_REPLACEMENT
# DONOT MODIFY TILL HERE

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json (or yarn.lock) to install dependencies
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci  --ignore-scripts

# Copy the rest of the app's source code to the container
COPY . .

# Build the Vite application for production
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:alpine AS production


# --- Security: Run as non-root user ---
# The nginx base image provides a non-root user 'nginx'. We will switch later.

# Remove the default Nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# Copy your custom Nginx configuration for SPA routing.
# You MUST create an nginx.conf file (see example below).
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static assets from the 'build-stage'
# --chown=nginx:nginx sets the correct owner for the non-root user
COPY --from=build-stage /app/dist /usr/share/nginx/html

# --- Security: Set secure permissions for web content ---
# Make static files read-only to prevent modification at runtime.
# Sets directories to r-xr-xr-x (555) and files to r--r--r-- (444).
# This addresses SonarQube rule docker:S6005
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    find /usr/share/nginx/html -type d -exec chmod 555 {} \; && \
    find /usr/share/nginx/html -type f -exec chmod 444 {} \;

# --- Security: Switch to the non-root user ---
# This is a critical security measure (SonarQube rules docker:S6001, docker:S6002)
# USER nginx

# Expose port 80 (standard HTTP port Nginx listens on by default)
EXPOSE 80

# --- Start Nginx ---
# Run Nginx in the foreground (standard practice for containers)
CMD ["nginx", "-g", "daemon off;"]