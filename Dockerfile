# Use the official Nginx image from Docker Hub
FROM nginx:alpine

# Copy your static HTML file to the directory served by Nginx
COPY index.html /usr/share/nginx/html

# Expose port 80 to allow traffic to the web server
EXPOSE 80