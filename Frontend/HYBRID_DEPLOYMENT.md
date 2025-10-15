# Hybrid Deployment Guide

## Overview

This deployment uses a **hybrid architecture**:
- **Frontend**: Deployed on GitHub Pages (static hosting)
- **Backend**: Runs locally or on your server with Ollama

## Architecture

```
┌─────────────────────────────────────┐
│   GitHub Pages (Static Frontend)    │
│   https://username.github.io/repo   │
└──────────────┬──────────────────────┘
               │ HTTP/HTTPS
               │ (CORS enabled)
               ↓
┌─────────────────────────────────────┐
│   Your Server (Backend + Ollama)    │
│   http://your-ip:3000               │
│   - Node.js + Express                │
│   - IntentAgent                      │
│   - Ollama + Llama 3.2               │
└─────────────────────────────────────┘
```

## Prerequisites

1. ✅ Ollama installed and running
2. ✅ Llama 3.2 model pulled
3. ✅ Node.js and npm installed
4. ✅ Port 3000 available
5. ✅ Public IP or domain (for internet access)

## Step 1: Configure Backend URL

### Find Your Server's Public IP

**On your server, run:**
```bash
# Linux/Mac
curl ifconfig.me

# Or
ip addr show

# Windows
ipconfig
```

### Update Frontend Configuration

Edit `Frontend/config.js`:

```javascript
const API_CONFIG = {
    // UPDATE THIS to your server's public URL
    BACKEND_API_URL: 'http://YOUR_PUBLIC_IP:3000',
    // Example: 'http://192.168.1.100:3000'
    // Example: 'https://yourdomain.com'

    // ... rest of config
};
```

**Important:**
- For **local network** access: Use local IP (192.168.x.x)
- For **internet** access: Use public IP or domain name
- For **HTTPS**: Configure SSL certificate (recommended for production)

## Step 2: Start Backend Server

On the machine with Ollama:

```bash
# 1. Ensure Ollama is running
ollama serve

# 2. Verify Llama 3.2 is available
ollama list

# 3. Navigate to project directory
cd /path/to/intent-identifier

# 4. Start the backend server
npm start

# You should see:
# ═══════════════════════════════════════
#   Intent Identifier Server
# ═══════════════════════════════════════
#   Server running on: http://localhost:3000
```

### Keep Server Running

**Option A: Use screen/tmux (Linux/Mac)**
```bash
screen -S intent-server
npm start
# Press Ctrl+A, then D to detach
# Reconnect: screen -r intent-server
```

**Option B: Use pm2 (Recommended for production)**
```bash
npm install -g pm2
pm2 start Frontend/server.js --name intent-server
pm2 save
pm2 startup  # Enable auto-start on boot
```

**Option C: Windows Service**
```bash
npm install -g node-windows
# Then create a Windows service script
```

## Step 3: Configure Firewall

### Allow Port 3000

**Linux (UFW):**
```bash
sudo ufw allow 3000/tcp
sudo ufw status
```

**Linux (iptables):**
```bash
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
sudo service iptables save
```

**Windows Firewall:**
1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → TCP → 3000
5. Allow the connection

**Router (if needed):**
1. Log into your router admin panel
2. Set up port forwarding: External 3000 → Internal IP:3000

## Step 4: Deploy Frontend to GitHub Pages

### Update gh-pages Branch

```bash
# Switch to gh-pages branch
git checkout gh-pages

# Copy updated Frontend files
cp Frontend/index.html .
cp Frontend/styles.css .
cp Frontend/app.js .
cp Frontend/config.js .

# Add and commit
git add index.html styles.css app.js config.js
git commit -m "Update Frontend with backend API configuration"

# Push to GitHub
git push origin gh-pages
```

### Verify GitHub Pages Settings

1. Go to https://github.com/YOUR_USERNAME/intent-identifier
2. Click **Settings** → **Pages**
3. Under **Source**, select:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. Click **Save**

Wait 1-2 minutes for deployment.

## Step 5: Test the Deployment

### 1. Test Backend Locally

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "Intent Identifier Server",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "agentStatus": "ready"
}
```

### 2. Test Backend from Another Device

From another computer on your network:
```bash
curl http://YOUR_SERVER_IP:3000/api/health
```

### 3. Test Full Application

Visit: `https://YOUR_USERNAME.github.io/intent-identifier/`

You should see:
- ✅ Chat interface loads
- ✅ Status shows "Connected to Intent Identifier Server"
- ✅ Sending messages works
- ✅ Intent JSON displays in right panel

## Troubleshooting

### Issue: "Backend Unavailable"

**Cause**: Frontend can't reach backend

**Solutions**:
1. Verify backend is running: `curl http://localhost:3000/api/health`
2. Check `config.js` has correct URL
3. Verify firewall allows port 3000
4. Check router port forwarding (if needed)
5. Try backend URL in browser directly

### Issue: CORS Errors

**Cause**: Backend rejecting requests from GitHub Pages

**Solution**: Already configured in `server.js`, but verify:
```javascript
app.use(cors()); // This line should be present
```

### Issue: Mixed Content (HTTP/HTTPS)

**Cause**: GitHub Pages uses HTTPS, your backend uses HTTP

**Solutions**:
1. **Quick fix**: Browser will show warning, click "Load unsafe scripts"
2. **Proper fix**: Set up HTTPS on your backend:
   ```bash
   # Use Let's Encrypt or self-signed certificate
   # Update BACKEND_API_URL to https://...
   ```

### Issue: Slow Response Times

**Cause**: Ollama processing time

**Solutions**:
1. Normal behavior (2-5 seconds for Llama 3.2)
2. Use faster hardware
3. Consider smaller model
4. Optimize Ollama settings

## Security Considerations

### For Production Use:

1. **Enable HTTPS**
   ```bash
   # Use nginx as reverse proxy with SSL
   sudo apt install nginx certbot
   sudo certbot --nginx -d yourdomain.com
   ```

2. **Add Authentication**
   - Implement API keys
   - Add JWT tokens
   - Use OAuth

3. **Rate Limiting**
   ```javascript
   // In server.js
   const rateLimit = require('express-rate-limit');
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   app.use(limiter);
   ```

4. **Input Validation**
   - Already implemented in `server.js`
   - Messages limited to 1000 characters
   - Type checking enabled

5. **Logging & Monitoring**
   ```javascript
   // Add logging middleware
   const morgan = require('morgan');
   app.use(morgan('combined'));
   ```

## Updating the Deployment

### Update Frontend Only

```bash
git checkout gh-pages
# Make changes to files
git add .
git commit -m "Update frontend"
git push origin gh-pages
```

### Update Backend

```bash
git checkout master
# Make changes
npm start  # Restart server
```

### Update Backend URL

1. Edit `Frontend/config.js`
2. Commit and push to gh-pages
3. Wait for GitHub Pages to rebuild (1-2 minutes)

## Alternative: Use ngrok for Testing

If you don't have a public IP, use ngrok to expose localhost:

```bash
# Install ngrok
npm install -g ngrok

# Expose port 3000
ngrok http 3000

# Copy the https URL (e.g., https://abc123.ngrok.io)
# Update config.js with this URL
```

**Note**: Free ngrok URLs change every restart.

## Production Checklist

Before going live:

- [ ] HTTPS enabled on backend
- [ ] Firewall configured
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Backend runs as service (pm2 or systemd)
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] config.js updated with production URL
- [ ] gh-pages deployed and tested
- [ ] CORS configured correctly
- [ ] Error handling tested
- [ ] Load testing performed

## Monitoring

### Check Backend Status

```bash
# Check if server is running
pm2 status

# View logs
pm2 logs intent-server

# Monitor resource usage
pm2 monit
```

### Check Frontend Status

Visit: https://YOUR_USERNAME.github.io/intent-identifier/

Look for:
- Green "Connected" status
- No console errors (F12 → Console)
- Messages send successfully

## Costs

- **GitHub Pages**: Free
- **Server**: Your own hardware or VPS ($5-20/month)
- **Domain** (optional): $10-15/year
- **SSL Certificate**: Free (Let's Encrypt)

Total: **$0** (using own hardware) or **$5-20/month** (VPS)

## Support

If you encounter issues:
1. Check browser console (F12)
2. Check server logs (`pm2 logs` or terminal)
3. Verify all URLs in `config.js`
4. Test backend directly with curl
5. Check firewall and network settings

Your intent-identifier is now deployed in hybrid mode with full Ollama integration! 🚀
