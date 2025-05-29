# AI Interview Coach

An intelligent interview preparation platform built with Next.js that helps users practice and improve their interview skills using AI-powered feedback and analysis.

## 🚀 Features

- **Live Practice Arena**: Real-time interview simulation with AI-powered feedback
- **Speech Recognition**: Practice speaking and get instant feedback
- **Video Recording**: Record your interview sessions for later review
- **Performance Analytics**: Detailed feedback and improvement suggestions
- **PDF Export**: Download your interview feedback and analysis
- **Dark/Light Mode**: Seamless theme switching for comfortable practice
- **Responsive Design**: Practice on any device

## 🛠️ Tech Stack

- **Framework**: Next.js 15
- **Authentication**: Clerk
- **Database**: Neon (PostgreSQL) with Drizzle ORM
- **AI Integration**: Google Generative AI
- **Styling**: Tailwind CSS with Radix UI components
- **Animations**: Framer Motion
- **PDF Generation**: jsPDF
- **Speech Recognition**: react-hook-speech-to-text
- **Video Recording**: react-webcam

## 📋 Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn
- PostgreSQL database (Neon recommended)
- Google AI API key
- Clerk account and API keys

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-interview-coach.git
cd ai-interview-coach
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
GOOGLE_AI_API_KEY=your_google_ai_api_key
DATABASE_URL=your_database_url
```

4. Initialize the database:
```bash
npm run db:push
# or
yarn db:push
```

5. Start the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📁 Project Structure

```
ai-interview-coach/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── live-practice-arena/ # Interview practice pages
│   └── result-feedback/   # Feedback and analysis pages
├── components/            # Reusable React components
├── lib/                   # Utility functions and configurations
├── public/               # Static assets
└── utils/                # Helper functions
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org)
- [Clerk](https://clerk.com)
- [Google AI](https://ai.google.dev)
- [Neon](https://neon.tech)
- [Radix UI](https://www.radix-ui.com)
- [Tailwind CSS](https://tailwindcss.com)
