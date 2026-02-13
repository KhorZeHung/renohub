---
description: Initialize and verify the RenoHub development environment
---

# RenoHub Initialization Workflow

This workflow sets up and verifies the RenoHub development environment.

## Prerequisites Check

1. Verify Node.js is installed (v18+ required)
```bash
node --version
```

2. Verify npm is installed
```bash
npm --version
```

## Environment Setup

// turbo
3. Navigate to the project directory
```bash
cd c:\Users\admin\Desktop\renohub\renohub
```

4. Check if dependencies are installed
```bash
Test-Path "node_modules"
```

// turbo
5. If node_modules doesn't exist, install dependencies
```bash
npm install
```

## Environment Configuration

6. Check environment files exist
```bash
Get-ChildItem -Filter ".env*"
```

7. Verify `.env.local` has required variables:
   - MONGODB_URI
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL
   - RESEND_API_KEY

## Database Setup

8. Verify MongoDB connection (check `.env.local` for MONGODB_URI)

9. Ensure MongoDB Atlas cluster is accessible

## Development Server

// turbo
10. Start the development server
```bash
npm run dev
```

11. Verify the server starts successfully on http://localhost:3000

12. Open browser and navigate to http://localhost:3000

## Verification Checklist

- [ ] Node.js and npm installed
- [ ] Dependencies installed successfully
- [ ] Environment variables configured
- [ ] MongoDB connection string set
- [ ] Development server runs without errors
- [ ] Application loads in browser
- [ ] No console errors in browser

## Common Issues

**Port 3000 already in use:**
```bash
# Find and kill process on port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

**MongoDB connection error:**
- Verify MONGODB_URI in `.env.local`
- Check MongoDB Atlas IP whitelist
- Ensure database user credentials are correct

**Missing dependencies:**
```bash
rm -rf node_modules package-lock.json
npm install
```
