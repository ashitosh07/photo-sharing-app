# 🔐 Decentralized Photo Sharing App

A Web3 photo sharing platform built with UCANs (User Controlled Authorization Networks) and Storacha for decentralized storage.

## ✨ Features

- 📸 **Upload photos** to decentralized Storacha storage
- 🔑 **Delegate permissions** (view/download) to specific users
- ⏰ **Set expiration dates** (1 day to 1 year)
- 🚫 **Revoke access** anytime
- 🌐 **No central authority** - you control your data

## 🚀 Live Demo

Visit the deployed app: [https://photo-sharing-rfkgj62xw-ashitoshs-projects.vercel.app](https://photo-sharing-rfkgj62xw-ashitoshs-projects.vercel.app)

## 🛠️ Tech Stack

- **Frontend**: React + React Router 7
- **Storage**: Storacha (IPFS-based)
- **Authorization**: UCANs (User Controlled Authorization Networks)
- **Styling**: TailwindCSS
- **Deployment**: Vercel

## 📖 How It Works

1. **Generate DID** - Create your decentralized identity
2. **Upload Photos** - Store photos with unique CIDs
3. **Share with UCANs** - Create permission tokens for specific users
4. **Access Control** - Recipients use cryptographic proofs to access photos
5. **Manage Permissions** - View shared users and revoke access anytime

## 🏃‍♂️ Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd photo-sharing-app

# Install dependencies
npm install

# Start development server
npm run dev

# Visit http://localhost:5173
```

## 🌐 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

Or manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 🔧 Environment Variables

No environment variables required for the demo. In production, you'd add:

```env
STORACHA_API_KEY=your_api_key
STORACHA_SPACE_DID=your_space_did
```

## 📚 Learn More

- [Blog Post](./BLOG-POST.md) - Detailed development story
- [Technical Documentation](./README-UCAN.md) - UCAN implementation details
- [UCAN Specification](https://ucan.xyz/)
- [Storacha Documentation](https://storacha.network/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the decentralized web**