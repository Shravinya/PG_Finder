# PG Finder - React Frontend Setup & Deployment Guide

This is the modern React/Next.js frontend for PG Finder, an AI-powered PG discovery platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running on `http://localhost:8000`

### Installation

```bash
cd frontend_react

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Update .env.local with your API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
frontend_react/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── page.tsx           # Landing page
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Global styles
│   │   ├── login/page.tsx     # Login page
│   │   ├── signup/page.tsx    # Signup page
│   │   ├── chat/page.tsx      # Main chat interface (60/40 layout)
│   │   └── pg/[id]/page.tsx   # PG detail page
│   ├── components/
│   │   ├── layout/            # Layout components (Navbar, Footer)
│   │   └── landing/           # Landing page components
│   ├── lib/
│   │   ├── api.ts            # API client
│   │   └── store.ts          # Zustand stores (auth, chat, PG)
│   └── types/                 # TypeScript types
├── public/                    # Static assets
├── tailwind.config.ts         # Tailwind CSS config
├── tsconfig.json             # TypeScript config
└── next.config.js            # Next.js config
```

## 🎨 Design System

The UI is built with a custom Tailwind theme matching the HTML reference design:

### Colors
- **Primary**: `#E8531A` (Accent/Orange)
- **Background**: `#F5F3EF` (Surface)
- **Text**: `#0D0D0D` (Ink)
- **Secondary**: `#7A7A7A` (Muted)

### Fonts
- **Syne**: Headlines (400-800 weight)
- **DM Sans**: Body text (300-500 weight)

### Components
See `globals.css` for utility classes:
- `.btn-primary` - Primary action button
- `.btn-ghost` - Secondary button  
- `.input-field` - Form input

## 📱 Pages Overview

### Landing Page (`/`)
- Hero section with chat preview
- "How it works" (3 steps)
- Features section (6 key differentiators)
- CTA section

### Chat Interface (`/chat`)
- 60% chat panel on left, 40% results on right
- Real-time conversation with PG Buddy
- Progress bar showing conversation completion
- Results panel with PG cards
- Map placeholder (integration ready)

### Authentication
- **Signup** (`/signup`): Email, password, optional name/phone
- **Login** (`/login`): Split layout design

### PG Detail (`/pg/[id]`)
- Full PG information display
- Amenities grid
- Room type pricing
- Reviews section
- Contact owner card
- Save to favorites

## 🔌 API Integration

All API calls go through `lib/api.ts`. Key endpoints:

```typescript
// Auth
await apiClient.signup(email, password, name, phone)
await apiClient.login(email, password)

// Chat
await apiClient.getNewSession()
await apiClient.sendMessage(sessionId, message)

// PGs
await apiClient.searchPGs(filters)
await apiClient.getPGDetails(pgId)
await apiClient.createPG(pgData)

// Reviews
await apiClient.getReviews(pgId)
await apiClient.submitReview(pgId, reviewData)
```

## 🎯 State Management

Using Zustand stores (`lib/store.ts`):

- `useAuthStore` - User authentication and profile
- `useChatStore` - Chat messages and session
- `usePGStore` - PG selection, favorites, filters

## 🚢 Production Build

```bash
# Build for production
npm run build

# Start production server
npm start

# Or deploy to Vercel (recommended)
npm install -g vercel
vercel
```

## 📦 Deployment

### Option 1: Vercel (Recommended)
```bash
vercel deploy --prod
```

### Option 2: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Option 3: Traditional Server
```bash
npm run build
PM2 start npm --name pg-finder-frontend -- start
```

## 🔧 Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_REVIEWS=true
```

## 📈 Performance Optimization

- ✅ Code splitting with Next.js
- ✅ Image optimization
- ✅ CSS-in-JS with Tailwind (minimal bundle)
- ✅ API response caching (ready)
- ✅ Lazy loading for components

## 🧪 Testing

```bash
# Run tests (when configured)
npm test

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 🎓 Key Technologies

- **Next.js 14**: React framework with SSR
- **React 18**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **Zustand**: Lightweight state management
- **Axios**: HTTP client
- **Framer Motion**: Animations (ready to use)
- **React Hot Toast**: Toast notifications
- **Lucide React**: Icons

## 📝 Notes

- Backend must be running on port 8000
- CORS is enabled on backend
- Token stored in localStorage
- Session-based chat management
- Real-time updates ready for WebSocket

## 🤝 Contributing

1. Follow the component structure
2. Use TypeScript for all new code
3. Add types to `lib/types/` if needed
4. Test locally before pushing
5. Follow design system (colors, typography)

## 📞 Support

For issues with the frontend, check:
1. Backend is running (`http://localhost:8000/health`)
2. Environment variables set correctly
3. Browser console for errors
4. Network tab for API issues

---

Built with ❤️ using React + Next.js
