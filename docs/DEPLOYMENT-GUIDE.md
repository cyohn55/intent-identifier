# Deployment Guide: Running Server as System Service

This guide shows you how to keep your Intent Identifier server running 24/7 using different methods.

---

## Option A: PM2 Process Manager (Recommended)

PM2 is the easiest and most reliable way to keep your Node.js server running.

### Features:
- ✅ Auto-restart on crash
- ✅ Auto-start on system boot
- ✅ Log management
- ✅ Monitoring dashboard
- ✅ Zero-downtime restarts
- ✅ Memory/CPU monitoring

### Installation & Setup

1. **Install PM2 globally:**
```bash
npm install -g pm2
```

2. **Start your server with PM2:**
```bash
cd /mnt/c/Users/cyohn/Desktop/Portfolio/Souloxy/intent-identifier
PORT=8888 pm2 start Frontend/server.js --name "intent-identifier"
```

3. **Save the PM2 process list (so it restarts after reboot):**
```bash
pm2 save
```

4. **Enable PM2 to start on boot:**
```bash
pm2 startup
# Follow the command it outputs (will be specific to your system)
```

### Common PM2 Commands

```bash
# View running processes
pm2 list

# View logs (live)
pm2 logs intent-identifier

# View logs (last 100 lines)
pm2 logs intent-identifier --lines 100

# Stop the server
pm2 stop intent-identifier

# Restart the server (zero-downtime)
pm2 restart intent-identifier

# Delete from PM2
pm2 delete intent-identifier

# Monitor (real-time dashboard)
pm2 monit

# View detailed info
pm2 show intent-identifier

# Stop all processes
pm2 stop all

# Restart all processes
pm2 restart all
```

### PM2 Configuration File (Optional)

Create `ecosystem.config.js` in your project root:

```javascript
module.exports = {
  apps: [{
    name: 'intent-identifier',
    script: './Frontend/server.js',
    env: {
      NODE_ENV: 'production',
      PORT: 8888
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

Then start with: `pm2 start ecosystem.config.js`

---

## Option B: Systemd Service (Linux Native)

For a more native Linux approach using systemd.

### 1. Create systemd service file

Create `/etc/systemd/system/intent-identifier.service`:

```ini
[Unit]
Description=Intent Identifier Backend Server
After=network.target

[Service]
Type=simple
User=cyohn
WorkingDirectory=/mnt/c/Users/cyohn/Desktop/Portfolio/Souloxy/intent-identifier
Environment="PORT=8888"
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node /mnt/c/Users/cyohn/Desktop/Portfolio/Souloxy/intent-identifier/Frontend/server.js
Restart=always
RestartSec=10
StandardOutput=append:/var/log/intent-identifier/output.log
StandardError=append:/var/log/intent-identifier/error.log

[Install]
WantedBy=multi-user.target
```

### 2. Create log directory

```bash
sudo mkdir -p /var/log/intent-identifier
sudo chown cyohn:cyohn /var/log/intent-identifier
```

### 3. Enable and start the service

```bash
# Reload systemd to recognize new service
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable intent-identifier

# Start the service now
sudo systemctl start intent-identifier

# Check status
sudo systemctl status intent-identifier
```

### Systemd Commands

```bash
# Start service
sudo systemctl start intent-identifier

# Stop service
sudo systemctl stop intent-identifier

# Restart service
sudo systemctl restart intent-identifier

# Check status
sudo systemctl status intent-identifier

# View logs (last 50 lines)
sudo journalctl -u intent-identifier -n 50

# View logs (live/follow)
sudo journalctl -u intent-identifier -f

# Disable auto-start
sudo systemctl disable intent-identifier
```

---

## Option C: Docker Container

Run your server in a Docker container for better isolation and portability.

### 1. Create Dockerfile

Create `Dockerfile` in project root:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Expose port
EXPOSE 8888

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8888

# Start server
CMD ["node", "Frontend/server.js"]
```

### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  intent-identifier:
    build: .
    container_name: intent-identifier
    restart: always
    ports:
      - "8888:8888"
    environment:
      - NODE_ENV=production
      - PORT=8888
    volumes:
      - ./logs:/app/logs
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 3. Run with Docker

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Restart
docker-compose restart
```

---

## Option D: Windows Task Scheduler + WSL

If you want Windows to automatically start WSL and your server.

### 1. Create startup script

Create `start-server.bat` in project directory:

```batch
@echo off
wsl -d Ubuntu -e bash -c "cd /mnt/c/Users/cyohn/Desktop/Portfolio/Souloxy/intent-identifier && PORT=8888 node Frontend/server.js"
```

### 2. Create Task in Task Scheduler

1. Open Task Scheduler (search in Start menu)
2. Click "Create Task" (right panel)
3. **General Tab:**
   - Name: "Intent Identifier Server"
   - Run whether user is logged on or not
   - Run with highest privileges
4. **Triggers Tab:**
   - New → At startup
5. **Actions Tab:**
   - New → Start a program
   - Program: Path to `start-server.bat`
6. **Conditions Tab:**
   - Uncheck "Start only if on AC power"
7. **Settings Tab:**
   - Check "Run task as soon as possible after scheduled start is missed"

---

## Comparison of Options

| Method | Pros | Cons | Best For |
|--------|------|------|----------|
| **PM2** | Easy setup, great features, logs, monitoring | Requires PM2 installed | Most users |
| **Systemd** | Native Linux, robust, low overhead | Requires root, more complex | Linux experts |
| **Docker** | Isolated, portable, easy to scale | Requires Docker, more setup | Production/teams |
| **Task Scheduler** | Windows native, auto-start WSL | WSL-specific, less control | Windows users |

---

## Important Notes for WSL Users

⚠️ **WSL Limitation:** WSL shuts down when no terminal is open or when Windows sleeps. Even with these methods:

1. **Computer must stay awake** - Configure Windows power settings
2. **WSL must stay running** - Keep a WSL terminal open or use Windows Task Scheduler
3. **Better alternative:** Deploy to a real Linux server or cloud service

### Windows Power Settings

To keep WSL running:
1. Settings → System → Power & Battery
2. Screen and Sleep → Set both to "Never"
3. Or use: `powercfg /change standby-timeout-ac 0`

---

## Monitoring Your Server

### Check if server is running:

```bash
# Check process
ps aux | grep "node Frontend/server.js"

# Check port
netstat -tuln | grep 8888

# Test API
curl http://localhost:8888/api/health
```

### View logs:

```bash
# PM2 logs
pm2 logs intent-identifier

# Systemd logs
sudo journalctl -u intent-identifier -f

# Docker logs
docker-compose logs -f
```

---

## Troubleshooting

### Server not starting:
1. Check if port 8888 is already in use: `lsof -i :8888`
2. Check if Ollama is running: `curl http://localhost:11434`
3. Check logs for errors

### Server stops after WSL closes:
- Use PM2 with WSL startup script
- Or deploy to a real server/cloud

### Auto-start not working:
- Verify startup script/service is enabled
- Check logs for errors
- Ensure all paths are absolute, not relative

---

## Recommended Setup

For development/personal use on WSL:
1. **Install PM2** (easiest)
2. **Configure Windows power settings** (never sleep)
3. **Set up PM2 startup** (auto-restart)

For production/public use:
1. **Deploy to cloud service** (Railway, Heroku, DigitalOcean)
2. True 24/7 uptime without keeping personal computer on
