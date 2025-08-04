# Clarnote - AI-Powered Meeting Assistant

Clarnote is a comprehensive AI-powered meeting assistant that transforms your audio and video recordings into actionable insights. Upload your meetings and get automated transcriptions, intelligent summaries, action items, and follow-up emails powered by OpenAI's cutting-edge technology.

## ✨ Features

- **🎤 Smart Transcription**: Upload audio/video files and get accurate transcriptions using OpenAI Whisper
- **🧠 AI Summaries**: Generate intelligent summaries, action items, and key decisions with GPT-4 Turbo
- **📧 Follow-up Emails**: Automatically create professional follow-up emails for meeting participants
- **📱 Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS
- **📱 Mobile App**: Native iOS and Android apps built with Capacitor
- **🎯 Speaker Identification**: Automatically identify and label different speakers in your meetings
- **📊 Meeting Analytics**: Track meeting patterns and productivity insights
- **🔒 Secure Authentication**: Built-in user authentication and secure data handling
- **🎨 Beautiful Design**: Modern, accessible interface with smooth animations
- **📄 Export Options**: Export meeting summaries as PDF or share via email
- **🔍 Search & Filter**: Easily find meetings with powerful search and filtering
- **🏷️ Tag System**: Organize meetings with custom tags
- **🌍 Multi-language**: Support for 9+ languages including English, Spanish, French, German, and more

## 🚀 Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **AI Services**: OpenAI GPT-4 Turbo, Whisper API
- **UI Components**: Custom components with Radix UI primitives
- **File Storage**: Local file system (easily configurable for S3/Firebase)
- **PDF Generation**: jsPDF for export functionality

## 📱 Mobile Development

Clarnote includes native iOS and Android apps built with Capacitor.

### Mobile Development Setup

1. **Build for mobile:**
   ```bash
   npm run build:mobile
   ```

2. **Open in Xcode (iOS):**
   ```bash
   npm run open:ios
   ```

3. **Open in Android Studio:**
   ```bash
   npm run open:android
   ```

4. **Run on device:**
   ```bash
   # iOS (requires Xcode)
   npm run dev:ios
   
   # Android (requires Android Studio)
   npm run dev:android
   ```

### Mobile Features
- 📱 **Native App Experience**: Full-screen mobile app with native navigation
- 🔄 **Offline Support**: PWA capabilities for offline functionality
- 📷 **Device Integration**: Access to camera and file system
- 🔔 **Push Notifications**: Real-time meeting updates (coming soon)
- 📲 **App Store Ready**: Configured for iOS App Store and Google Play deployment

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- OpenAI API key
- Google OAuth credentials (optional)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd clarnote
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/clarnote"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# File Upload
MAX_FILE_SIZE=25000000  # 25MB in bytes
ALLOWED_FILE_TYPES="audio/mpeg,audio/wav,audio/mp4,video/mp4,audio/m4a"
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Usage

### 1. Sign Up / Sign In
- Create an account with email/password or use Google OAuth
- Access your personalized dashboard

### 2. Upload Meeting Recordings
- Drag and drop audio/video files (MP3, WAV, MP4, M4A)
- Add meeting title, description, and tags
- Select the primary language spoken in the meeting

### 3. AI Processing
- Automatic transcription using OpenAI Whisper
- AI analysis with GPT-4 Turbo for summaries and action items
- Real-time status updates during processing

### 4. Review & Export
- View detailed meeting summaries with action items
- Read full transcripts with timestamps
- Export as PDF or share via email
- Search and filter your meeting history

## 🔧 Configuration

### Supported File Formats
- **Audio**: MP3, WAV, M4A
- **Video**: MP4
- **Max Size**: 25MB per file

### Supported Languages
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Chinese (zh)
- Japanese (ja)
- Korean (ko)

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket

2. Connect your repository to Vercel

3. Configure environment variables in Vercel dashboard

4. Set up your database (recommended: Supabase, PlanetScale, or Railway)

5. Deploy!

### Environment Variables for Production

```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-production-secret"
OPENAI_API_KEY="your-openai-api-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## 🔒 Security Features

- **Authentication**: Secure user authentication with NextAuth.js
- **File Validation**: Server-side file type and size validation
- **API Protection**: All API routes protected with authentication
- **Input Validation**: Zod schema validation for all inputs
- **SQL Injection Protection**: Prisma ORM prevents SQL injection
- **HTTPS**: Secure data transmission in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for Whisper and GPT-4 APIs
- [Next.js](https://nextjs.org/) for the incredible framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Prisma](https://prisma.io/) for the excellent database toolkit
- [NextAuth.js](https://next-auth.js.org/) for authentication

## 🐛 Issues & Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Include error messages, browser version, and steps to reproduce

---

**Clarnote** - Transform your meetings into actionable insights with AI! 🚀
