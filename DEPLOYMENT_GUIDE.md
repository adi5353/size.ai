# size.ai Deployment Guide

## Quick Start with Docker Compose

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum
- 10GB disk space

### Local Development
```bash
# 1. Clone the repository
git clone <repository-url>
cd size.ai

# 2. Create environment file
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Start all services
docker-compose up -d

# 4. Check service health
docker-compose ps

# 5. View logs
docker-compose logs -f

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:8001
# API Docs: http://localhost:8001/api/docs
```

### Production Deployment

#### Option 1: Docker Compose (Small Scale)
```bash
# 1. Set environment to production
export ENV=production

# 2. Configure production environment variables
# Edit backend/.env.production and frontend/.env.production

# 3. Build and start services
docker-compose -f docker-compose.yml --env-file .env.production up -d

# 4. Monitor logs
docker-compose logs -f

# 5. Scale backend for load
docker-compose up -d --scale backend=3
```

#### Option 2: Kubernetes (Large Scale)
```bash
# See kubernetes/ directory for manifests
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/secrets.yaml
kubectl apply -f kubernetes/configmaps.yaml
kubectl apply -f kubernetes/mongodb.yaml
kubectl apply -f kubernetes/redis.yaml
kubectl apply -f kubernetes/backend.yaml
kubectl apply -f kubernetes/frontend.yaml
kubectl apply -f kubernetes/ingress.yaml
```

---

## Environment Configuration

### Backend Environment Variables

#### Required
```bash
# MongoDB
MONGO_URL=mongodb://username:password@host:27017/database
DB_NAME=sizeai

# JWT
JWT_SECRET_KEY=your-super-secret-key-min-32-chars
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DAYS=7

# Admin
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=secure-admin-password

# CORS
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

#### Optional
```bash
# Redis (for caching)
REDIS_URL=redis://redis:6379/0

# Logging
LOG_LEVEL=INFO  # DEBUG, INFO, WARNING, ERROR, CRITICAL
LOG_FORMAT=json  # json or standard

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# External APIs
EMERGENT_LLM_KEY=your-llm-key

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
```

### Frontend Environment Variables

```bash
# API Configuration
REACT_APP_BACKEND_URL=https://api.yourdomain.com
REACT_APP_API_TIMEOUT=30000

# Environment
REACT_APP_ENV=production

# Analytics (optional)
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_SENTRY_DSN=https://your-frontend-sentry-dsn
```

---

## Security Checklist

### Before Production Deployment

- [ ] Change all default passwords
- [ ] Generate strong JWT secret key (min 32 characters)
- [ ] Configure CORS origins to your actual domain(s)
- [ ] Enable HTTPS/TLS
- [ ] Set up firewall rules
- [ ] Configure MongoDB authentication
- [ ] Enable rate limiting
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategy
- [ ] Review and update security headers
- [ ] Enable audit logging
- [ ] Set up SSL certificates

### JWT Secret Generation
```bash
# Generate a secure JWT secret
python -c "import secrets; print(secrets.token_urlsafe(32))"
# or
openssl rand -base64 32
```

---

## Service Management

### Docker Compose Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart a specific service
docker-compose restart backend

# View logs
docker-compose logs -f backend

# Scale backend
docker-compose up -d --scale backend=3

# Rebuild after code changes
docker-compose build
docker-compose up -d

# Clean up everything
docker-compose down -v
```

### Health Checks

```bash
# Check backend health
curl http://localhost:8001/api/health

# Check frontend health
curl http://localhost:3000/health

# Check MongoDB
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Check Redis
docker-compose exec redis redis-cli ping
```

---

## Monitoring & Logging

### View Application Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend

# JSON formatted logs (backend)
docker-compose exec backend tail -f logs/app.log | jq '.'
```

### Monitor Resource Usage

```bash
# Docker stats
docker stats

# Service-specific stats
docker stats sizeai-backend sizeai-frontend sizeai-mongodb
```

### Log Aggregation

For production, configure log forwarding to:
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Splunk**
- **Datadog**
- **CloudWatch** (AWS)
- **Azure Monitor**

Example logstash configuration included in `monitoring/logstash.conf`

---

## Backup & Disaster Recovery

### MongoDB Backup

```bash
# Create backup
docker-compose exec mongodb mongodump --out /backup

# Copy backup to host
docker cp sizeai-mongodb:/backup ./mongodb-backup-$(date +%Y%m%d)

# Restore from backup
docker cp ./mongodb-backup sizeai-mongodb:/restore
docker-compose exec mongodb mongorestore /restore
```

### Automated Backup Script

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="./backups/$DATE"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup MongoDB
docker-compose exec -T mongodb mongodump --archive > $BACKUP_DIR/mongodb.dump

# Backup environment files
cp backend/.env $BACKUP_DIR/backend.env
cp frontend/.env $BACKUP_DIR/frontend.env

# Compress
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR

echo "Backup completed: $BACKUP_DIR.tar.gz"

# Delete backups older than 30 days
find ./backups -name "*.tar.gz" -mtime +30 -delete
```

Add to crontab:
```bash
0 2 * * * /path/to/backup.sh
```

---

## Performance Tuning

### MongoDB Optimization

```javascript
// Create indexes (automatically done on startup)
db.users.createIndex({ email: 1 }, { unique: true })
db.user_activities.createIndex({ user_id: 1, timestamp: -1 })
db.configurations.createIndex({ user_id: 1, updated_at: -1 })

// Enable profiling
db.setProfilingLevel(1, { slowms: 100 })

// Check slow queries
db.system.profile.find().sort({ ts: -1 }).limit(10)
```

### Nginx Optimization

```nginx
# Enable caching in nginx.conf
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;

location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_use_stale error timeout updating;
}
```

### Backend Scaling

```bash
# Horizontal scaling with Docker Compose
docker-compose up -d --scale backend=4

# Kubernetes horizontal pod autoscaler
kubectl autoscale deployment backend --cpu-percent=70 --min=2 --max=10
```

---

## Troubleshooting

### Common Issues

**Issue: Services fail to start**
```bash
# Check logs
docker-compose logs

# Check system resources
docker system df
docker system prune  # Clean up if needed
```

**Issue: Database connection fails**
```bash
# Verify MongoDB is running
docker-compose ps mongodb

# Check MongoDB logs
docker-compose logs mongodb

# Test connection
docker-compose exec backend python -c "import pymongo; client = pymongo.MongoClient('mongodb://mongodb:27017'); print(client.server_info())"
```

**Issue: Frontend can't reach backend**
```bash
# Check backend health
curl http://localhost:8001/api/health

# Check CORS configuration
grep CORS_ORIGINS backend/.env

# Verify network
docker network inspect sizeai_sizeai-network
```

**Issue: High memory usage**
```bash
# Check resource usage
docker stats

# Adjust memory limits in docker-compose.yml
services:
  backend:
    mem_limit: 1g
```

---

## SSL/TLS Configuration

### Using Let's Encrypt

```bash
# Install certbot
sudo apt-get install certbot

# Generate certificates
sudo certbot certonly --standalone -d yourdomain.com

# Update nginx config
# See nginx-ssl.conf example in configs/
```

### Using Reverse Proxy (Recommended)

```nginx
# nginx-proxy.conf
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Monitoring Dashboard

### Prometheus + Grafana Setup

```yaml
# Add to docker-compose.yml
prometheus:
  image: prom/prometheus
  volumes:
    - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
  ports:
    - "9090:9090"

grafana:
  image: grafana/grafana
  ports:
    - "3001:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
```

### Metrics to Monitor
- Request rate (requests/second)
- Response time (95th percentile)
- Error rate (%)
- Database query time
- Memory usage
- CPU usage
- Active connections

---

## Support & Maintenance

### Regular Maintenance Tasks

**Daily:**
- Monitor logs for errors
- Check service health
- Verify backups completed

**Weekly:**
- Review performance metrics
- Check disk space
- Update security patches

**Monthly:**
- Database optimization
- Log rotation and cleanup
- Security audit
- Dependency updates

### Getting Help

- Documentation: `/docs`
- API Reference: `http://localhost:8001/api/docs`
- Health Check: `http://localhost:8001/api/health`

---

## Upgrade Guide

### Rolling Update (Zero Downtime)

```bash
# 1. Pull latest code
git pull origin main

# 2. Build new images
docker-compose build

# 3. Update backend (one at a time if scaled)
docker-compose up -d --no-deps backend

# 4. Wait for health check
sleep 10
curl http://localhost:8001/api/health

# 5. Update frontend
docker-compose up -d --no-deps frontend

# 6. Verify
docker-compose ps
```

### Database Migration

```bash
# 1. Backup database
./scripts/backup.sh

# 2. Run migration script
docker-compose exec backend python migrations/migrate.py

# 3. Verify migration
docker-compose exec backend python migrations/verify.py
```

---

## Cost Optimization

### Resource Recommendations

**Small (< 1000 users):**
- Backend: 1 instance, 1 CPU, 2GB RAM
- Frontend: 1 instance, 0.5 CPU, 512MB RAM
- MongoDB: 1 instance, 1 CPU, 2GB RAM
- Cost: ~$50-100/month

**Medium (1000-10000 users):**
- Backend: 2-3 instances, 2 CPU, 4GB RAM each
- Frontend: 2 instances, 1 CPU, 1GB RAM each
- MongoDB: 1 instance, 2 CPU, 4GB RAM
- Redis: 1 instance, 0.5 CPU, 1GB RAM
- Cost: ~$200-400/month

**Large (10000+ users):**
- Backend: 5+ instances, 4 CPU, 8GB RAM each
- Frontend: 3+ instances, 2 CPU, 2GB RAM each
- MongoDB: Cluster (3 nodes), 4 CPU, 8GB RAM each
- Redis: 2 instances, 2 CPU, 4GB RAM each
- Cost: ~$1000+/month

---

## License & Credits

size.ai - SIEM Infrastructure Sizing Calculator
Version 1.0.0

Built with:
- FastAPI (Backend)
- React (Frontend)
- MongoDB (Database)
- Docker (Containerization)
