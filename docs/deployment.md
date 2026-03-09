# Deployment Guide (Google Cloud Platform)

This guide provides step-by-step instructions for deploying the FindMyLawyer platform on Google Cloud Platform (GCP) using a Compute Engine Virtual Machine.

## Prerequisites
- A Google Cloud Platform account.
- A domain name (optional, for SSL/HTTPS).
- Necessary environment variables (see `.env.example`).

---

## 1. Create a VM Instance
1. Go to **Compute Engine** > **VM instances** in the GCP Console.
2. Click **Create Instance**.
3. Select a region and machine type (e.g., `e2-medium` or `e2-micro` for low traffic).
4. For **Boot disk**, choose **Ubuntu 22.04 LTS**.
5. Under **Firewall**, check **Allow HTTP traffic** and **Allow HTTPS traffic**.
6. Click **Create**.

## 2. Server Configuration
SSH into your instance and run the following commands:

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js (LTS version)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Git
sudo apt install git -y
```

## 3. Clone Repository & Install Dependencies
```bash
git clone https://github.com/raziquehasan/FindMyLawyer.git
cd FindMyLawyer

# Install Backend dependencies
cd backend
npm install
cd ../backend-lawyer
npm install

# Install Frontend dependencies
cd ../frontend-user
npm install
cd ../frontend-lawyer
npm install
```

## 4. Setup Environment Variables
Create `.env` files for each module based on `.env.example`.
```bash
nano .env # Repeat for each module directory
```
*Never commit these files to version control.*

## 5. Running the Backend Services (PM2)
```bash
cd ~/FindMyLawyer/backend
pm2 start server.js --name "backend-user"

cd ~/FindMyLawyer/backend-lawyer
pm2 start src/server.js --name "backend-lawyer"

# Save PM2 process list
pm2 save
pm2 startup
```

## 6. Building Frontends
```bash
cd ~/FindMyLawyer/frontend-user
npm run build

cd ~/FindMyLawyer/frontend-lawyer
npm run build
```

## 7. Nginx Reverse Proxy Setup
```bash
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/find-my-lawyer
```

**Example Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend User
    location / {
        root /home/YOUR_USER/FindMyLawyer/frontend-user/dist;
        index index.html;
        try_files $uri /index.html;
    }

    # Frontend Lawyer
    location /lawyer {
        alias /home/YOUR_USER/FindMyLawyer/frontend-lawyer/dist;
        index index.html;
        try_files $uri /lawyer/index.html;
    }

    # Backend User API
    location /api/user {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend Lawyer API
    location /api/lawyer {
        proxy_pass http://localhost:5001; # Ensure unique ports
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/find-my-lawyer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 8. Domain & SSL (Certbot)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```
