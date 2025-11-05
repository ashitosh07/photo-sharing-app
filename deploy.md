# 🚀 Deployment Guide

## Deploy to Vercel

### Option 1: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/photo-sharing-app)

### Option 2: Manual Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Build the project**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Follow the prompts**
   - Link to existing project or create new
   - Set project name
   - Confirm deployment

### Option 3: GitHub Integration

1. Push code to GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect React Router and deploy

## Environment Setup

The app works without environment variables for demo purposes. For production:

```env
# Optional: Real Storacha integration
STORACHA_API_KEY=your_api_key
STORACHA_SPACE_DID=your_space_did
```

## Post-Deployment

After deployment:

1. **Test the app** - Upload and share photos
2. **Update README** - Add your live demo URL
3. **Share the link** - Let others try your decentralized photo sharing!

## Troubleshooting

**Build fails?**
- Check Node.js version (18+ recommended)
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

**Routes not working?**
- Vercel should auto-configure, but check `vercel.json` is present

**Functions timeout?**
- Increase timeout in `vercel.json` if needed

## Success! 🎉

Your decentralized photo sharing app is now live and accessible worldwide!