# ============================================================
# CYBERWALL - Dockerfile
# Serves the static game (HTML/CSS/JS) using nginx.
# Build:  docker build -t cyberwall .
# Run:    docker run -p 8080:80 cyberwall
# Or use: docker compose up
# ============================================================

FROM nginx:alpine

# Remove default nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy all game files into nginx's web root
COPY index.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY assets/ /usr/share/nginx/html/assets/

# Custom nginx config: proper MIME types, caching, gzip
RUN printf '%s\n' \
    'server {' \
    '    listen 80;' \
    '    server_name localhost;' \
    '    root /usr/share/nginx/html;' \
    '    index index.html;' \
    '' \
    '    # Gzip compression for faster loading' \
    '    gzip on;' \
    '    gzip_types text/css application/javascript application/json;' \
    '    gzip_min_length 256;' \
    '' \
    '    # Cache static assets (1 day)' \
    '    location ~* \.(js|css|png|jpg|svg)$ {' \
    '        expires 1d;' \
    '        add_header Cache-Control "public";' \
    '    }' \
    '' \
    '    # Never cache index.html so players always get the latest version' \
    '    location = /index.html {' \
    '        add_header Cache-Control "no-cache";' \
    '    }' \
    '' \
    '    # Fall back to index.html for any unknown path' \
    '    location / {' \
    '        try_files $uri $uri/ /index.html;' \
    '    }' \
    '}' \
    > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
