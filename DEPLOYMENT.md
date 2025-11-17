# Deployment Guide

This static site can be deployed to various platforms. Here are the easiest options:

## 🚀 Quick Deploy Options

### 1. **Vercel** (Recommended - Easiest)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd qustin/qustin-blog
vercel

# Follow prompts, then add your custom domain in Vercel dashboard
```

**Pros:**
- Free tier with generous limits
- Automatic HTTPS
- Global CDN
- Easy custom domain setup
- Zero config needed (vercel.json included)

### 2. **Netlify**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
cd qustin/qustin-blog
netlify deploy --prod

# Follow prompts, then add custom domain in Netlify dashboard
```

**Pros:**
- Free tier
- Automatic HTTPS
- Global CDN
- Easy custom domain
- Drag-and-drop deploy also available

### 3. **fly.io** (You mentioned this)
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch (from qustin/qustin-blog directory)
fly launch

# Follow prompts:
# - App name: qustin-blog (or your choice)
# - Region: choose closest to you
# - Postgres: No
# - Redis: No

# Deploy
fly deploy

# Add custom domain
fly certs add yourdomain.com
```

**Pros:**
- Good for containerized apps
- Global edge locations
- Custom domain support
- Free tier available

**Note:** For static sites, Vercel/Netlify are simpler, but fly.io works great too!

### 4. **Cloudflare Pages** (Also very easy)
1. Push your code to GitHub
2. Go to Cloudflare Dashboard → Pages
3. Connect your repository
4. Build command: (leave empty, it's static)
5. Build output directory: `qustin/qustin-blog`
6. Deploy!

**Pros:**
- Free unlimited bandwidth
- Fast global CDN
- Easy custom domain
- Automatic HTTPS

### 5. **GitHub Pages**
```bash
# Push to GitHub, then:
# 1. Go to repo Settings → Pages
# 2. Select branch and folder (qustin/qustin-blog)
# 3. Add custom domain in Pages settings
```

**Pros:**
- Free
- Simple if you're already on GitHub
- Custom domain support

## 🔧 Custom Domain Setup

For any platform:

1. **Add domain in platform dashboard:**
   - Vercel: Project Settings → Domains
   - Netlify: Site Settings → Domain Management
   - fly.io: `fly certs add yourdomain.com`
   - Cloudflare: Pages → Custom Domain

2. **Update DNS records:**
   - Platform will give you DNS instructions
   - Usually a CNAME record pointing to their hostname
   - Or A records for IP addresses

3. **Wait for SSL certificate** (usually automatic, takes a few minutes)

## 📝 Recommended: Vercel

For a static site like this, **Vercel is the easiest**:
- Zero configuration needed
- Fastest deployment
- Best developer experience
- Free tier is very generous

Just run:
```bash
npm i -g vercel
cd qustin/qustin-blog
vercel
```

Then add your custom domain in the Vercel dashboard!

