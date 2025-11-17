# Simple nginx-based static site server
FROM nginx:alpine

# Copy static files to nginx html directory
COPY . /usr/share/nginx/html

# Use default nginx config (serves files from /usr/share/nginx/html)
# For custom config, uncomment below and create nginx.conf
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

