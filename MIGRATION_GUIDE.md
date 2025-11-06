# Migration Guide - TIER 5 Updates

## Overview
This guide covers the changes introduced in TIER 5 (Real-World SIEM Deployment Scenarios) and provides migration instructions for existing deployments.

## Breaking Changes
**None** - TIER 5 is fully backward compatible with existing installations.

## New Features Added

### 1. Real-World SIEM Deployment Scenarios
**Impact**: Frontend only, no backend changes  
**Files Added**:
- `/app/frontend/src/data/scenarioTemplates.js` (NEW)
- `/app/frontend/src/components/calculator/ScenarioSelector.jsx` (existing, now integrated)

**Files Modified**:
- `/app/frontend/src/pages/Calculator.jsx` - Added scenario integration

**Breaking Changes**: None  
**Migration Required**: No

## Database Changes
**No database schema changes in TIER 5**

All database optimizations from TIER 4 remain in effect:
- Connection pooling (max 50, min 10)
- 8 compound indexes + 3 TTL indexes
- Schema validation for all collections
- Aggregation pipelines for analytics

## Configuration Changes

### Environment Variables
**No new environment variables required**

Existing variables remain unchanged:
```bash
# Frontend
REACT_APP_BACKEND_URL=<your-backend-url>

# Backend
MONGO_URL=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
```

## API Changes
**No API changes in TIER 5**

All existing API endpoints remain unchanged:
- `/api/auth/*` - Authentication endpoints
- `/api/configurations/*` - Configuration management
- `/api/admin/*` - Admin dashboard
- `/api/ai/*` - AI assistant
- `/api/health` - Health check

API documentation: https://your-domain.com/api/docs

## Frontend Changes

### Component Structure
**New Component Integration**:
```jsx
// Calculator.jsx now includes:
import { ScenarioSelector } from '@/components/calculator/ScenarioSelector';

// New state:
const [scenarioSelectorOpen, setScenarioSelectorOpen] = useState(false);

// New handler:
const handleApplyScenario = (scenario) => {
  // Maps scenario devices to calculator structure
  // Applies configuration settings
}
```

### User-Facing Changes
1. **New "Load Scenario" button** in calculator action buttons
2. **Scenario modal** with 6 pre-built templates
3. **Category filtering** for scenarios
4. **Toast notifications** on scenario application

### LocalStorage Changes
**No changes to existing localStorage keys**

The calculator still saves to `lastCalculatorConfig` as before.

## Deployment Instructions

### For Docker Deployments (Recommended)

#### Option 1: Pull Latest Images
```bash
# Stop current containers
docker-compose down

# Pull latest images (if using pre-built)
docker-compose pull

# Restart with new code
docker-compose up -d

# Verify services
docker-compose ps
docker-compose logs -f frontend
```

#### Option 2: Rebuild Locally
```bash
# Stop containers
docker-compose down

# Rebuild images
docker-compose build

# Start services
docker-compose up -d

# Verify
docker-compose logs -f
```

### For Manual Deployments

#### Frontend Update
```bash
cd frontend

# Install any new dependencies (none in TIER 5, but good practice)
yarn install

# Rebuild production assets
yarn build

# Restart your frontend server
# (pm2, systemd, or your process manager)
pm2 restart frontend
```

#### Backend Update
```bash
cd backend

# Activate virtual environment
source venv/bin/activate

# Install dependencies (no changes, but good practice)
pip install -r requirements.txt

# Restart backend server
pm2 restart backend
# OR
supervisorctl restart backend
```

## Rollback Instructions

### If Issues Arise

#### Docker Rollback
```bash
# Stop current deployment
docker-compose down

# Check previous images
docker images

# Revert docker-compose.yml to previous version
git checkout HEAD~1 docker-compose.yml

# Start with old images
docker-compose up -d
```

#### Manual Rollback
```bash
# Frontend
cd frontend
git checkout HEAD~1 .
yarn install
yarn build
pm2 restart frontend

# Backend (no changes, but if needed)
cd backend
git checkout HEAD~1 .
pip install -r requirements.txt
pm2 restart backend
```

## Testing Checklist

After deployment, verify:

- [ ] Homepage loads correctly
- [ ] Login/registration works
- [ ] Calculator page accessible after login
- [ ] "Load Scenario" button visible
- [ ] Scenario modal opens with all 6 scenarios
- [ ] Category filtering works
- [ ] Scenario selection provides visual feedback
- [ ] "Apply Scenario" populates calculator
- [ ] Toast notifications appear
- [ ] Calculator results update correctly
- [ ] Save/load configurations still work
- [ ] PDF generation still works
- [ ] AI Assistant still functional (if configured)

## Performance Impact

**Expected Changes**:
- **Bundle Size**: +~15KB (scenarioTemplates.js data)
- **Initial Load**: No noticeable impact
- **Runtime Performance**: No degradation (all client-side logic)
- **Database Load**: No change (no new queries)

## Security Considerations

**No new security concerns introduced**

The feature is entirely client-side with no:
- API endpoints
- Database queries
- External service calls
- Authentication changes

Existing security measures remain in effect:
- JWT authentication for protected routes
- Password hashing with bcrypt
- CORS configuration
- Rate limiting (if configured)

## Monitoring Recommendations

### Metrics to Watch
1. **Frontend Load Time**: Should remain <2s
2. **Calculator Responsiveness**: Should remain instant
3. **Error Rates**: No increase expected
4. **User Engagement**: Monitor "Load Scenario" button usage

### Logging
No new logs generated. Existing logs remain:
- Backend: `/var/log/supervisor/backend.*.log`
- Frontend: Browser console for client-side issues

## Support & Troubleshooting

### Common Issues

#### Issue: "Load Scenario" button not visible
**Cause**: Frontend not rebuilt after update  
**Fix**:
```bash
cd frontend
yarn build
pm2 restart frontend
```

#### Issue: Scenario modal doesn't open
**Cause**: JavaScript bundle not loaded  
**Fix**: Hard refresh browser (Ctrl+Shift+R), check console for errors

#### Issue: Scenario doesn't populate calculator
**Cause**: State mapping logic issue  
**Fix**: Check browser console, verify Calculator.jsx has latest code

#### Issue: Calculator page won't load after update
**Cause**: Protected route authentication  
**Fix**: Clear localStorage, re-login, verify JWT token

### Getting Help

1. **Check Logs**:
   ```bash
   # Frontend
   docker-compose logs frontend
   
   # Backend
   docker-compose logs backend
   ```

2. **Browser Console**: Press F12, check Console tab for errors

3. **Health Check**:
   ```bash
   curl https://your-domain.com/api/health
   ```

4. **Database Connection**:
   ```bash
   docker-compose exec backend python -c "from database import get_db; db = get_db(); print('DB OK')"
   ```

## Compatibility Matrix

| Component | Minimum Version | Recommended |
|-----------|----------------|-------------|
| Node.js | 18.0.0 | 18.17+ |
| Python | 3.11.0 | 3.11+ |
| MongoDB | 5.0.0 | 6.0+ |
| Docker | 20.10.0 | 24.0+ |
| Docker Compose | 2.0.0 | 2.20+ |

## Additional Resources

- **Full Documentation**: `/app/TIER5_SCENARIOS_COMPLETE.md`
- **Deployment Guide**: `/app/DEPLOYMENT_GUIDE.md`
- **API Docs**: `https://your-domain.com/api/docs`
- **Docker Setup**: `/app/docker-compose.yml`

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.5.0 | Nov 2024 | TIER 5: Real-World Scenarios |
| 1.4.0 | Nov 2024 | TIER 4: DevOps & Production |
| 1.3.0 | Nov 2024 | TIER 3: Multi-Lang, PWA, Cost Comparison |
| 1.2.0 | Nov 2024 | TIER 2: API Docs, Database Optimization |
| 1.1.0 | Nov 2024 | User Auth, Admin Dashboard, Save/Load |
| 1.0.0 | Sep 2024 | Initial MVP Release |

---

## Summary

✅ **Safe to Deploy**: No breaking changes  
✅ **Zero Downtime**: Rolling update possible  
✅ **Backward Compatible**: Works with existing data  
✅ **No Migration Scripts**: No database changes  
✅ **Rollback Ready**: Easy to revert if needed  

**Estimated Deployment Time**: 5-10 minutes

---

*For questions or issues, check the troubleshooting section or consult the full documentation.*
