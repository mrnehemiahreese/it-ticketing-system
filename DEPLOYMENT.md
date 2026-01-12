# IT Ticketing System - Deployment Guide

## Overview

This is a complete, production-ready IT ticketing and support system built with modern technologies:
- **Backend**: NestJS + GraphQL + TypeORM + PostgreSQL
- **Frontend**: Vue 3 + Vuetify 3 + Apollo Client
- **Mobile**: iOS/Android via Capacitor
- **Infrastructure**: Docker + Nginx

---

## Quick Start (Local Development)

### Prerequisites
- Docker Desktop installed and running
- 4GB RAM minimum
- 10GB disk space
- Ports 3000, 4000, 5432, 6379 available

### 1. Initial Setup

```bash
cd /tmp/it-ticketing-system

# Copy environment configuration
cp .env.example .env

# Edit with your credentials
nano .env
```

### 2. Configure Environment Variables

**Minimum Required Changes:**

```env
# Database (change password!)
DB_PASSWORD=YourVerySecurePassword123!

# JWT Secret (generate a secure 32+ character string)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# SMTP Email (Gmail example)
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password

# Slack Integration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00/B00/XXX
```

### 3. Start Services

```bash
# Start all services
./start.sh

# Or manually:
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Access Application

- **Frontend**: http://localhost:3000
- **Backend GraphQL**: http://localhost:4000/graphql
- **Database**: localhost:5432

**Default Admin Login:**
- Username: `admin`
- Password: `Admin123!`

⚠️ **IMPORTANT: Change this password immediately after first login!**

---

## Production Deployment

### Option 1: Docker Deployment (Recommended)

#### Server Requirements
- Ubuntu 20.04 LTS or later
- 4GB RAM (8GB recommended)
- 50GB disk space
- Docker 20.10+
- Docker Compose 2.0+

#### Step-by-Step Deployment

1. **Prepare Server**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

2. **Clone/Upload Project**

```bash
# Clone repository or upload files
cd /home/your-user
git clone <your-repo-url> it-ticketing-system
cd it-ticketing-system
```

3. **Configure Production Environment**

```bash
cp .env.example .env
nano .env
```

**Production `.env` Configuration:**

```env
# Environment
NODE_ENV=production

# Database
DB_NAME=ticketing_system
DB_USER=ticketing_admin
DB_PASSWORD=<STRONG-PASSWORD-HERE>
DB_PORT=5432

# Backend
BACKEND_PORT=4000
JWT_SECRET=<SECURE-64-CHARACTER-SECRET>
JWT_EXPIRATION=7d

# Frontend
FRONTEND_PORT=3000
VITE_API_URL=https://your-domain.com
VITE_GRAPHQL_ENDPOINT=https://your-domain.com/graphql

# Email (Production SMTP)
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=no-reply@your-domain.com
SMTP_PASSWORD=<SMTP-PASSWORD>
SMTP_FROM=IT Support <support@your-domain.com>

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_BOT_TOKEN=xoxb-your-production-token

# Application URL
APP_URL=https://your-domain.com
```

4. **Set Up SSL/TLS (Let's Encrypt)**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Generate SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Certificates will be at:
# /etc/letsencrypt/live/your-domain.com/fullchain.pem
# /etc/letsencrypt/live/your-domain.com/privkey.pem
```

5. **Update Nginx Configuration**

Edit `nginx/nginx.conf` to use SSL:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # ... rest of configuration
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

6. **Start Production Services**

```bash
# Build and start with production profile
docker-compose --profile production up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

7. **Initialize Database**

```bash
# Run migrations and seed data
docker-compose exec backend npm run migration:run
docker-compose exec backend npm run seed
```

8. **Verify Deployment**

```bash
# Check all services are healthy
docker-compose ps

# Test backend health
curl http://localhost:4000/health

# Test frontend
curl http://localhost:3000

# Check logs for errors
docker-compose logs --tail=50
```

### Option 2: Direct Server Deployment (No Docker)

#### Requirements
- Ubuntu 20.04 LTS
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Nginx 1.18+

#### Installation Steps

1. **Install Node.js**

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Should be 18+
```

2. **Install PostgreSQL**

```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE ticketing_system;
CREATE USER ticketing_admin WITH ENCRYPTED PASSWORD 'YourPassword123!';
GRANT ALL PRIVILEGES ON DATABASE ticketing_system TO ticketing_admin;
\q
```

3. **Install Redis**

```bash
sudo apt install redis-server -y
sudo systemctl start redis
sudo systemctl enable redis
```

4. **Install Nginx**

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

5. **Deploy Backend**

```bash
cd /home/your-user/it-ticketing-system/backend

# Install dependencies
npm install

# Build application
npm run build

# Create systemd service
sudo nano /etc/systemd/system/ticketing-backend.service
```

**Backend Service File:**

```ini
[Unit]
Description=IT Ticketing Backend
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=your-user
WorkingDirectory=/home/your-user/it-ticketing-system/backend
Environment=NODE_ENV=production
Environment=DATABASE_URL=postgresql://ticketing_admin:YourPassword123!@localhost:5432/ticketing_system
Environment=JWT_SECRET=your-secret-key
ExecStart=/usr/bin/node dist/main.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
# Start backend service
sudo systemctl daemon-reload
sudo systemctl start ticketing-backend
sudo systemctl enable ticketing-backend
sudo systemctl status ticketing-backend
```

6. **Deploy Frontend**

```bash
cd /home/your-user/it-ticketing-system/frontend

# Install dependencies
npm install

# Build for production
npm run build

# Copy built files to web root
sudo mkdir -p /var/www/ticketing
sudo cp -r dist/* /var/www/ticketing/
sudo chown -R www-data:www-data /var/www/ticketing
```

7. **Configure Nginx**

```bash
sudo nano /etc/nginx/sites-available/ticketing
```

**Nginx Configuration:**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Frontend
    location / {
        root /var/www/ticketing;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /graphql {
        proxy_pass http://localhost:4000/graphql;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/ticketing /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Security Best Practices

### 1. Environment Variables

- Never commit `.env` to version control
- Use strong passwords (16+ characters)
- Rotate JWT secrets periodically
- Use different credentials for each environment

### 2. Database Security

```bash
# Restrict PostgreSQL to localhost
sudo nano /etc/postgresql/14/main/pg_hba.conf
# Set: host all all 127.0.0.1/32 md5

# Firewall rules
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny 5432/tcp  # Block external DB access
sudo ufw deny 6379/tcp  # Block external Redis access
sudo ufw enable
```

### 3. Application Security

- Enable HTTPS/TLS (Let's Encrypt)
- Set secure headers in Nginx
- Implement rate limiting
- Use strong JWT secrets (64+ characters)
- Regular security updates
- Monitor logs for suspicious activity

### 4. Backup Strategy

```bash
# Automated daily backups
sudo nano /usr/local/bin/backup-ticketing.sh
```

**Backup Script:**

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/ticketing"
DATE=$(date +%Y%m%d-%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T postgres pg_dump -U ticketing_admin ticketing_system > "$BACKUP_DIR/db-$DATE.sql"

# Backup uploads
tar -czf "$BACKUP_DIR/uploads-$DATE.tar.gz" backend/uploads/

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
chmod +x /usr/local/bin/backup-ticketing.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
0 2 * * * /usr/local/bin/backup-ticketing.sh >> /var/log/ticketing-backup.log 2>&1
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Check Docker services
docker-compose ps

# Check service health
curl http://localhost:4000/health

# Check database connection
docker-compose exec postgres psql -U ticketing_admin -d ticketing_system -c "SELECT 1;"

# Check Redis
docker-compose exec redis redis-cli ping
```

### Log Management

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend

# Save logs to file
docker-compose logs --since 24h > ticketing-logs-$(date +%Y%m%d).log
```

### Performance Tuning

**PostgreSQL Optimization:**

```bash
# Edit postgresql.conf
docker-compose exec postgres nano /var/lib/postgresql/data/postgresql.conf

# Recommended settings for 8GB RAM server:
shared_buffers = 2GB
effective_cache_size = 6GB
maintenance_work_mem = 512MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
work_mem = 10MB
min_wal_size = 1GB
max_wal_size = 4GB
```

### Scaling

**Horizontal Scaling (Load Balancer):**

```nginx
upstream backend {
    least_conn;
    server backend-1:4000;
    server backend-2:4000;
    server backend-3:4000;
}

upstream frontend {
    server frontend-1:80;
    server frontend-2:80;
}
```

---

## Troubleshooting

### Common Issues

**1. Can't Connect to Database**

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check connection string
echo $DATABASE_URL

# Test connection
docker-compose exec postgres psql -U ticketing_admin -d ticketing_system
```

**2. Frontend Shows API Errors**

```bash
# Check backend is running
curl http://localhost:4000/graphql

# Check CORS settings in backend
# Verify VITE_GRAPHQL_ENDPOINT in frontend .env
```

**3. Emails Not Sending**

```bash
# Test SMTP connection
docker-compose exec backend node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});
transporter.verify().then(() => console.log('SMTP OK')).catch(console.error);
"
```

**4. High Memory Usage**

```bash
# Check Docker stats
docker stats

# Restart services
docker-compose restart

# Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL
```

---

## Updating the Application

### Update Process

```bash
# 1. Backup database first!
./backup.sh

# 2. Pull latest code
git pull origin main

# 3. Rebuild containers
docker-compose down
docker-compose up -d --build

# 4. Run migrations
docker-compose exec backend npm run migration:run

# 5. Verify
docker-compose ps
```

---

## Support & Maintenance

### Regular Maintenance Tasks

**Daily:**
- Monitor logs for errors
- Check service health
- Review new tickets

**Weekly:**
- Verify backups
- Review disk usage
- Check SSL certificate expiry
- Update dependencies (security patches)

**Monthly:**
- Review user accounts
- Clean old attachments
- Optimize database
- Performance review

### Getting Help

- **Documentation**: See README.md and QUICK_START.md
- **Logs**: `docker-compose logs -f`
- **Health Check**: `curl http://localhost:4000/health`
- **Database**: `docker-compose exec postgres psql -U ticketing_admin ticketing_system`

---

## Production Checklist

Before going live:

- [ ] Change all default passwords
- [ ] Set strong JWT_SECRET (64+ characters)
- [ ] Configure production SMTP
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Set up automated backups
- [ ] Configure monitoring/alerting
- [ ] Test disaster recovery
- [ ] Document admin procedures
- [ ] Train support staff
- [ ] Create runbook for common issues
- [ ] Set up log rotation
- [ ] Configure rate limiting
- [ ] Review security headers
- [ ] Test mobile apps
- [ ] Verify Slack integration

---

**Your IT ticketing system is now ready for production deployment!** 🚀
