# 🔍 Nginx Production Debugging Guide

> **Comprehensive debugging guide for nginx applications in production Docker environments**

This guide provides systematic debugging steps for nginx applications running in production containers. For setup and configuration, see the [Docker Guide](./5_DOCKER.md).

## 📋 Table of Contents

- [Quick Debugging Steps](#-quick-debugging-steps)
- [Container-Level Debugging](#-container-level-debugging)
- [Nginx Configuration Debugging](#-nginx-configuration-debugging)
- [Network and Connectivity](#-network-and-connectivity)
- [Static File Issues](#-static-file-issues)
- [Common Issues and Solutions](#-common-issues-and-solutions)
- [Production Troubleshooting](#-production-troubleshooting)

## 🚀 Quick Debugging Steps

### **1. Check Container Status**
```bash
# Check if containers are running
docker-compose ps

# Check container logs for specific services
docker-compose logs admin
docker-compose logs ui
docker-compose logs docs-astro
```

### **2. Test Container Connectivity**
```bash
# Test if containers are accessible from host
curl -v http://localhost:5001  # admin
curl -v http://localhost:5006  # ui
curl -v http://localhost:5007  # docs-astro

# Test from inside containers
docker-compose exec admin curl -f http://localhost:5001
docker-compose exec ui curl -f http://localhost:5006
docker-compose exec docs-astro curl -f http://localhost:5007
```

### **3. Check Nginx Configuration**
```bash
# Check nginx config inside containers
docker-compose exec admin nginx -t
docker-compose exec ui nginx -t
docker-compose exec docs-astro nginx -t

# Check nginx processes
docker-compose exec admin ps aux | grep nginx
docker-compose exec ui ps aux | grep nginx
docker-compose exec docs-astro ps aux | grep nginx
```

## 🔧 Container-Level Debugging

### **Accessing Container Shell**
```bash
# Access admin container shell
docker-compose exec admin sh

# Access ui container shell
docker-compose exec ui sh

# Access docs-astro container shell
docker-compose exec docs-astro sh
```

### **Inside Container Commands**

#### **Check Nginx Status**
```bash
# Check if nginx is running
ps aux | grep nginx

# Check nginx process
pgrep nginx

# Check nginx configuration
nginx -t
```

#### **Check Nginx Configuration**
```bash
# View the actual nginx config
cat /etc/nginx/conf.d/default.conf

# Check if PORT variable is resolved
echo $PORT

# Check nginx main config
cat /etc/nginx/nginx.conf
```

#### **Check Network and Ports**
```bash
# Check what ports are listening
netstat -tlnp

# Check if nginx is listening on the right port
ss -tlnp | grep nginx

# Test local connectivity
curl -f http://localhost:5001
```

#### **Check Static Files**
```bash
# Check if static files exist
ls -la /usr/share/nginx/html/

# Check if index.html exists
cat /usr/share/nginx/html/index.html | head -10

# Check file permissions
find /usr/share/nginx/html -type f -exec ls -la {} \;
```

#### **Check Nginx Logs**
```bash
# Check nginx error logs
tail -f /var/log/nginx/error.log

# Check nginx access logs
tail -f /var/log/nginx/access.log

# Check all nginx logs
ls -la /var/log/nginx/
```

#### **Test Nginx Directly**
```bash
# Test nginx configuration
nginx -T

# Check nginx version and compile info
nginx -V

# Test nginx with debug output
nginx -g "daemon off;" -e /dev/stderr
```

#### **Check Environment Variables**
```bash
# Check all environment variables
env | grep -E "(PORT|HOST|NODE_ENV)"

# Check specific variables
echo "PORT: $PORT"
echo "HOST: $HOST"
echo "NODE_ENV: $NODE_ENV"
```

#### **Manual Nginx Start (if needed)**
```bash
# Stop nginx if running
pkill nginx

# Start nginx manually to see errors
nginx -g "daemon off;"
```

#### **Check File System Issues**
```bash
# Check if nginx can write to its directories
ls -la /var/cache/nginx/
ls -la /run/
ls -la /etc/nginx/conf.d/

# Check disk space
df -h

# Check file permissions
ls -la /etc/nginx/
```

#### **Quick Fix Test**
If the PORT variable isn't being resolved, try this:

```bash
# Manually fix the config file
sed -i 's/\${PORT}/5001/g' /etc/nginx/conf.d/default.conf

# Restart nginx
pkill nginx
nginx -g "daemon off;" &
```

## 🔍 Nginx Configuration Debugging

### **Configuration File Analysis**
```bash
# View current nginx configuration
cat /etc/nginx/conf.d/default.conf

# Expected configuration structure:
server {
    listen ${PORT};
    server_name _;
    root /usr/share/nginx/html;
    index index.html index.htm;
    # ... other directives
}
```

### **Environment Variable Resolution**
```bash
# Check if environment variables are being resolved
echo "PORT: $PORT"
echo "HOST: $HOST"

# Test template processing
envsubst < /etc/nginx/templates/default.conf.template
```

### **Configuration Validation**
```bash
# Test nginx configuration syntax
nginx -t

# Test with specific config file
nginx -t -c /etc/nginx/nginx.conf

# Show full configuration
nginx -T
```

## 🌐 Network and Connectivity

### **Port Binding Verification**
```bash
# Check what ports are actually listening
netstat -tlnp

# Check nginx-specific ports
ss -tlnp | grep nginx

# Check all listening ports
lsof -i -P -n | grep LISTEN
```

### **Container Network Testing**
```bash
# Test localhost connectivity
curl -f http://localhost:5001

# Test with specific headers
curl -H "Host: localhost" http://localhost:5001

# Test with verbose output
curl -v http://localhost:5001
```

### **External Connectivity**
```bash
# Test from host machine
curl -v http://localhost:5001

# Test from another container
docker-compose exec api curl -f http://admin:5001

# Test with different user agent
curl -H "User-Agent: Mozilla/5.0" http://localhost:5001
```

## �� Static File Issues

### **File System Verification**
```bash
# Check if static files exist
ls -la /usr/share/nginx/html/

# Check file permissions
find /usr/share/nginx/html -type f -exec ls -la {} \;

# Check if index.html exists
cat /usr/share/nginx/html/index.html | head -10

# Check file sizes
du -sh /usr/share/nginx/html/*
```

### **File Content Verification**
```bash
# Check if files are readable
cat /usr/share/nginx/html/index.html

# Check for specific files
find /usr/share/nginx/html -name "*.html" -type f

# Check file ownership
ls -la /usr/share/nginx/html/
```

### **MIME Type Issues**
```bash
# Check nginx MIME types
cat /etc/nginx/mime.types | grep -E "(html|css|js)"

# Test file serving
curl -I http://localhost:5001/style.css
curl -I http://localhost:5001/script.js
```

## 🚨 Common Issues and Solutions

### **Issue 1: Nginx Not Starting**
```bash
# Symptoms: Container exits immediately
# Solution: Check nginx configuration

# Debug steps:
docker-compose exec admin nginx -t
docker-compose exec admin cat /etc/nginx/conf.d/default.conf
docker-compose exec admin echo $PORT
```

### **Issue 2: Port Not Listening**
```bash
# Symptoms: curl returns connection refused
# Solution: Check port binding and environment variables

# Debug steps:
docker-compose exec admin netstat -tlnp
docker-compose exec admin echo $PORT
docker-compose exec admin nginx -T | grep listen
```

### **Issue 3: Static Files Not Found**
```bash
# Symptoms: 404 errors for static files
# Solution: Check file existence and permissions

# Debug steps:
docker-compose exec admin ls -la /usr/share/nginx/html/
docker-compose exec admin find /usr/share/nginx/html -type f
docker-compose exec admin cat /usr/share/nginx/html/index.html
```

### **Issue 4: Environment Variables Not Resolved**
```bash
# Symptoms: ${PORT} appears literally in config
# Solution: Check template processing

# Debug steps:
docker-compose exec admin cat /etc/nginx/conf.d/default.conf
docker-compose exec admin echo $PORT
docker-compose exec admin envsubst < /etc/nginx/templates/default.conf.template
```

### **Issue 5: Permission Denied**
```bash
# Symptoms: nginx can't write to log files or cache
# Solution: Check file permissions and ownership

# Debug steps:
docker-compose exec admin ls -la /var/log/nginx/
docker-compose exec admin ls -la /var/cache/nginx/
docker-compose exec admin whoami
```

## 🏭 Production Troubleshooting

### **Health Check Verification**
```bash
# Check health check status
docker-compose ps

# Test health check manually
docker-compose exec admin curl -f http://localhost:5001

# Check health check logs
docker-compose logs admin | grep health
```

### **Resource Monitoring**
```bash
# Check container resource usage
docker stats

# Check nginx process resources
docker-compose exec admin ps aux | grep nginx

# Check disk usage
docker-compose exec admin df -h
```

### **Log Analysis**
```bash
# View recent logs
docker-compose logs --tail=50 admin

# Follow logs in real-time
docker-compose logs -f admin

# Search for errors
docker-compose logs admin | grep -i error
```

### **Container Restart**
```bash
# Restart specific container
docker-compose restart admin

# Restart all containers
docker-compose restart

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up
```

## �� Advanced Debugging

### **Nginx Debug Mode**
```bash
# Start nginx in debug mode
docker-compose exec admin nginx -g "daemon off;" -e /dev/stderr

# Check nginx error log in real-time
docker-compose exec admin tail -f /var/log/nginx/error.log
```

### **Configuration Testing**
```bash
# Test configuration without starting nginx
docker-compose exec admin nginx -t

# Show full configuration
docker-compose exec admin nginx -T

# Test specific configuration file
docker-compose exec admin nginx -t -c /etc/nginx/conf.d/default.conf
```

### **Network Debugging**
```bash
# Check container network
docker-compose exec admin ip addr show

# Check DNS resolution
docker-compose exec admin nslookup google.com

# Check routing
docker-compose exec admin route -n
```

## 📊 Monitoring and Metrics

### **Performance Monitoring**
```bash
# Check nginx process stats
docker-compose exec admin ps aux | grep nginx

# Check memory usage
docker-compose exec admin free -h

# Check CPU usage
docker-compose exec admin top
```

### **Access Log Analysis**
```bash
# View recent access logs
docker-compose exec admin tail -f /var/log/nginx/access.log

# Count requests by status code
docker-compose exec admin awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c

# Find slow requests
docker-compose exec admin awk '$NF > 1 {print}' /var/log/nginx/access.log
```

## 🛠️ Quick Fixes

### **Fix 1: Environment Variable Issues**
```bash
# Manually set PORT in config
docker-compose exec admin sed -i 's/\${PORT}/5001/g' /etc/nginx/conf.d/default.conf

# Restart nginx
docker-compose exec admin pkill nginx
docker-compose exec admin nginx -g "daemon off;" &
```

### **Fix 2: File Permission Issues**
```bash
# Fix file permissions
docker-compose exec admin chown -R nginx:nginx /usr/share/nginx/html/
docker-compose exec admin chmod -R 755 /usr/share/nginx/html/

# Restart nginx
docker-compose exec admin pkill nginx
docker-compose exec admin nginx -g "daemon off;" &
```

### **Fix 3: Configuration Issues**
```bash
# Backup current config
docker-compose exec admin cp /etc/nginx/conf.d/default.conf /tmp/backup.conf

# Regenerate config from template
docker-compose exec admin envsubst < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Test and restart
docker-compose exec admin nginx -t
docker-compose exec admin pkill nginx
docker-compose exec admin nginx -g "daemon off;" &
```

## 📚 Related Documentation

- [Docker Guide](./5_DOCKER.md) - Docker setup and configuration
- [Development Workflow](./3_DEV_FLOWS.md) - Development commands and processes
- [Setup Flows](./2_SETUP_FLOWS.md) - Environment setup and configuration
- [Testing Guide](./TESTING.md) - Testing procedures and best practices

---

**Ready to debug nginx issues?** Follow this systematic approach to identify and resolve production nginx problems! 🔍 