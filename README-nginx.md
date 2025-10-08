# Nginx Setup for React Frontend

This project has been configured to run with nginx for production deployment. Here are the available options:

## Files Created

- `nginx.conf` - Production nginx configuration for Docker deployment
- `nginx-local.conf` - Local nginx configuration for testing
- `Dockerfile` - Multi-stage Docker build for production
- `docker-compose.yml` - Docker Compose configuration
- `.dockerignore` - Docker ignore file

## Deployment Options

### Option 1: Docker Deployment (Recommended)

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

2. **Or build and run manually:**
   ```bash
   docker build -t dighub-frontend .
   docker run -p 80:80 dighub-frontend
   ```

### Option 2: Local Nginx (for testing)

1. **Install nginx locally**
2. **Copy the local configuration:**
   ```bash
   cp nginx-local.conf /etc/nginx/sites-available/dighub
   ln -s /etc/nginx/sites-available/dighub /etc/nginx/sites-enabled/
   ```
3. **Test and reload nginx:**
   ```bash
   nginx -t
   nginx -s reload
   ```

### Option 3: Static File Server (Development)

For development, you can use the built-in Vite preview:
```bash
npm run build
npm run preview
```

## Configuration Features

- **Client-side routing support** - Handles React Router properly
- **Static asset caching** - Optimized caching for JS, CSS, and images
- **Gzip compression** - Reduces file sizes
- **Security headers** - Basic security headers included
- **Health check endpoint** - Available at `/health`
- **API proxy ready** - Configured for backend API at `/api/`

## Environment Variables

The Docker setup supports these environment variables:
- `NODE_ENV=production` (default)

## Performance Optimizations

- Gzip compression enabled
- Static asset caching with long expiry
- Optimized nginx configuration for SPA
- Multi-stage Docker build for smaller image size

## Security Features

- Non-root user in Docker container
- Security headers (XSS protection, content type options, etc.)
- Proper error page handling

## Accessing the Application

After deployment:
- **Docker:** http://localhost (port 80)
- **Local nginx:** http://localhost:8080
- **Health check:** http://localhost/health

## Troubleshooting

1. **Docker not running:** Make sure Docker Desktop is running
2. **Port conflicts:** Change the port mapping in docker-compose.yml
3. **Build failures:** Ensure all dependencies are installed with `npm install`

## Production Considerations

- Use HTTPS in production (add SSL certificates)
- Configure proper domain names
- Set up monitoring and logging
- Consider using a reverse proxy like Cloudflare
- Implement proper backup strategies