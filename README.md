# Travellopedia - AI-Powered Travel Planner

A modern travel planning application powered by **Google Gemini AI** with a clean, professional UI design.

## ✨ Features

- 🤖 **AI-Powered Recommendations** - Get personalized travel suggestions using Google Gemini
- 🎨 **Professional UI** - Clean dark theme with emerald accents
- 🔐 **Email/Password Auth** - Secure sign-up and sign-in with NextAuth
- 📚 **Bookmarks** - Save your favorite destinations
- 📝 **Todo Lists** - Plan your travel tasks
- 📊 **Travel History** - Track your adventures
- 🚀 **Guest Mode** - Try the app without signing up (5 queries/day)

## 🛠️ Tech Stack

- **Framework**: Next.js 13 (App Router)
- **AI**: Google Gemini 1.5 Flash
- **Authentication**: NextAuth.js (Email/Password)
- **Database**: MongoDB
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database
- Google Gemini API key

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
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_random_secret_here
   
   # MongoDB
   MONGODB_URI=your_mongodb_connection_string
   
   # Google Gemini AI
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key
   GOOGLE_GEMINI_MODEL=gemini-1.5-flash
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXTAUTH_URL` | Your app URL |
| `NEXTAUTH_SECRET` | Random secret for JWT encryption |
| `MONGODB_URI` | MongoDB connection string |
| `GOOGLE_GEMINI_API_KEY` | Google Gemini API key |
| `GOOGLE_GEMINI_MODEL` | Gemini model (default: `gemini-1.5-flash`) |

## 📄 License

MIT License

---

Made with ❤️ for travelers everywhere.