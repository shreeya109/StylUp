# StyleFinder 👗✨

AI-powered visual fashion discovery — upload inspiration images, search eBay, and generate outfit suggestions.

## 📝 Overview

StyleFinder is a **minimum viable product (MVP)** that takes fashion inspiration images and helps users discover similar items online. Upload your style inspiration and let AI find matching pieces to create complete outfits.

### How it works
1. **Upload** up to 20 inspiration images  
2. **Extract** style keywords using OpenAI vision  
3. **Search** eBay for matching inventory  
4. **Re-rank** results using CLIP for visual similarity  
5. **Categorize** items (top/bottom/jacket/footwear/accessory)  
6. **Generate** outfit suggestions with smart scoring

## ✨ Features

- **Visual Search**: Upload up to 20 images with live previews
- **AI-Powered Keywords**: OpenAI GPT-4 vision extracts style descriptors
- **Smart Similarity**: CLIP embeddings re-rank results for visual similarity
- **Auto-Categorization**: Items classified into clothing categories
- **Outfit Generator**: Creates complete looks with compatibility scoring
- **Debug Panel**: View CLIP statistics and re-ranking effectiveness

## 🛠️ Tech Stack

- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **AI/ML**: 
  - OpenAI GPT-4 vision for keyword extraction
  - CLIP via `@xenova/transformers` for visual similarity
- **Data**: eBay Browse API
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+
- OpenAI API key
- eBay developer account

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/stylefinder.git
cd stylefinder
npm install
```

### 2. Environment Setup

Create a `.env.local` file:

```bash
# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# eBay API Configuration
EBAY_APP_ID=your_ebay_client_id
EBAY_CERT_ID=your_ebay_client_secret  
EBAY_DEV_ID=your_ebay_dev_id
EBAY_ENV=SANDBOX                      # Use SANDBOX for testing, PRODUCTION for live
EBAY_MARKETPLACE_ID=EBAY_US
EBAY_OAUTH_TOKEN=your_oauth_token     # See setup guide below
```

### 3. Get eBay OAuth Token

You need an application token with browse scope:

```bash
# 1. Base64 encode your CLIENT_ID:CLIENT_SECRET
echo -n "your_app_id:your_cert_id" | base64

# 2. Request token (replace BASE64_CREDENTIALS and use correct URL)
# Sandbox:
curl -X POST 'https://api.sandbox.ebay.com/identity/v1/oauth2/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -H 'Authorization: Basic BASE64_CREDENTIALS' \
  -d 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope/buy.browse.readonly'

# Production:
curl -X POST 'https://api.ebay.com/identity/v1/oauth2/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -H 'Authorization: Basic BASE64_CREDENTIALS' \
  -d 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope/buy.browse.readonly'
```

Copy the `access_token` from the response into your `EBAY_OAUTH_TOKEN`.

> **Note**: Tokens expire (~2 hours). Refresh as needed during development.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
stylefinder/
├── app/
│   ├── api/
│   │   ├── extract-keywords/route.ts    # OpenAI vision → keywords
│   │   ├── extract-categories/route.ts  # Item categorization  
│   │   ├── clip-rerank/route.ts         # CLIP similarity ranking
│   │   └── search-ebay/route.ts         # eBay API wrapper
│   └── search/
│       └── page.tsx                     # Main search interface
├── lib/
│   ├── outfitBuilder.ts                 # Outfit generation logic
│   └── types.ts                         # TypeScript definitions
└── public/
    └── placeholder.png
```

## 🔧 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/extract-keywords` | POST | Extract style keywords from images |
| `/api/clip-rerank` | POST | Re-rank eBay items by visual similarity |
| `/api/search-ebay` | GET | Search eBay with filters |
| `/api/extract-categories` | POST | Categorize items and extract attributes |

## 🚨 Troubleshooting

### Common Issues

**500 Error on `/api/extract-categories`**
- Check `OPENAI_API_KEY` is set correctly
- Verify image upload format
- Check OpenAI API quota/billing

**401/403 from eBay API**
- `EBAY_OAUTH_TOKEN` may be expired
- Verify you're using the correct OAuth endpoint for your `EBAY_ENV`
- Check your eBay app credentials

**Slow First CLIP Call**
- Normal behavior: model downloads and initializes on first use
- Subsequent calls will be faster

**Few Outfit Suggestions**
- Ensure items are being categorized properly
- Check that multiple items exist in each category bucket
- Verify CLIP re-ranking is working

## 🚢 Deploy to Vercel

1. Push your code to GitHub
2. Import the repository on [Vercel](https://vercel.com)
3. Add all environment variables in Project Settings → Environment Variables
4. Set Node.js version to 18
5. Deploy

## 🛣️ Roadmap

- **Enhanced Rules**: Better color harmony and formality matching
- **ML-Guided Composition**: Train model for compatibility scoring  
- **User Controls**: Vibe sliders, palette preferences, budget limits
- **Multi-Source**: Support additional retailers beyond eBay
- **Social Features**: Save and share outfit collections



**Note**: This is an MVP focused on core functionality. Future versions will include more sophisticated ML models and enhanced user controls.