# GAA Marketplace - Backend API

This directory contains the backend API that will be deployed to Vercel.

## Structure

```
api/
├── items.js          # Get all GAA items
├── item.js           # Get single item by ID
├── bids.js           # Handle bids
├── users.js          # User operations
└── auth.js           # Authentication endpoints
```

## Setup

1. These files will be deployed as Vercel Serverless Functions
2. Each file exports a default handler function
3. They connect to Supabase for database operations

## Environment Variables Needed

Create `.env.local` (not committed) with:
```
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
```

## Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

Your API will be available at: `https://your-project.vercel.app/api/items`
