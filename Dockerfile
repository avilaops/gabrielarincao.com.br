FROM nginx:1.31-alpine
COPY ["web-app-manifest-192x192.png", "Identidade visual.jpg", "avilaops-indexnow-20260730.txt", "site.webmanifest", "sitemap.xml", "image.jpg", "favicon-96x96.png", "app.js", "index.html", "background.avif", "web-app-manifest-512x512.png", "og-default.png", "favicon.svg", "favicon.ico", "image (1).jpg", "apple-touch-icon.png", "image.png", "robots.txt", "Identidade visual - Copia.avif", "/usr/share/nginx/html/"]
COPY src /usr/share/nginx/html/src
