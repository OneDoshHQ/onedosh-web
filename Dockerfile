# Use the official nginx image as the base image
FROM nginx:alpine

# Copy the HTML file and assets directory to the nginx html directory
COPY index.html /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/

# Expose port 80
EXPOSE 80

# Start nginx when the container starts
CMD ["nginx", "-g", "daemon off;"] 