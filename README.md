# Travellopedia - AI-Powered Travel Planner

A modern travel planning application powered by **Google Gemini AI** with a stunning glassmorphism UI design.

![Travellopedia](https://img.shields.io/badge/AI-Google%20Gemini-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-13-black?style=for-the-badge)
![Framer Motion](https://img.shields.io/badge/Animations-Framer%20Motion-pink?style=for-the-badge)

## ✨ Features

- 🤖 **AI-Powered Recommendations** - Get personalized travel suggestions using Google Gemini
- 🎨 **Modern Glassmorphism UI** - Beautiful dark theme with gradient accents and animations
- 🔐 **Authentication** - Secure sign-in with Clerk
- 📚 **Bookmarks** - Save your favorite destinations
- 📝 **Todo Lists** - Plan your travel tasks
- 📊 **Travel History** - Track your adventures
- 🚀 **Guest Mode** - Try the app without signing up (5 queries/day)

## 🛠️ Tech Stack

- **Framework**: Next.js 13 (App Router)
- **AI**: Google Gemini 1.5 Flash
- **Authentication**: Clerk
- **Database**: MongoDB
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS + Glassmorphism
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database
- Google Gemini API key
- Clerk account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/travellopedia.git
   cd travellopedia
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` with:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # MongoDB
   MONGODB_URI=your_mongodb_connection_string
   
   # Google Gemini AI
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## 🎨 Design Features

- **Floating Orbs** - Animated gradient background elements
- **Cursor Glow** - Custom cursor with gradient spotlight effect
- **Glassmorphism Cards** - Translucent cards with blur effects
- **Gradient Text** - Beautiful gradient typography
- **Hover Effects** - Lift and glow animations on interactive elements
- **Shimmer Loading** - Elegant skeleton loading states

## 📁 Project Structure

```
├── app/                 # Next.js app router pages
│   ├── api/            # API routes (explore, bookmarks, todos, history)
│   ├── explore/        # Travel search page
│   └── ...
├── components/         # React components
│   ├── ui/            # shadcn/ui components
│   ├── cursor-glow.tsx # Custom cursor effect
│   ├── floating-orbs.tsx # Animated background
│   └── ...
├── lib/               # Utilities
│   ├── gemini.ts     # Google Gemini AI client
│   ├── mongodb.ts    # Database connection
│   └── rate-limiter.ts # Guest rate limiting
└── ...
```

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `MONGODB_URI` | MongoDB connection string |
| `GOOGLE_GEMINI_API_KEY` | Google Gemini API key |
| `GOOGLE_GEMINI_MODEL` | Gemini model (default: `gemini-1.5-flash`) |

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

Made with ❤️ for travelers everywhere.