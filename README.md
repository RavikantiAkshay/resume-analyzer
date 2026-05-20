# ResumeAI — AI-Powered ATS Resume Analyzer

An intelligent, full-stack web application that analyzes resumes against job descriptions using **AI-powered ATS (Applicant Tracking System) scoring**. Upload a PDF resume, paste a job description, and receive a comprehensive compatibility report with actionable suggestions to improve your chances of landing interviews.

---

## ✨ Features

- **PDF Resume Parsing** — Upload any PDF resume; the parser handles multi-page documents and extracts all text content
- **ATS Compatibility Score** — Keyword-by-keyword comparison between your resume and the target job description
- **AI-Powered Analysis** — Powered by Groq's LLaMA 3.3 70B model for deep, contextual resume analysis
- **Section-by-Section Breakdown** — Scores for skills match, experience relevance, education fit, formatting quality, and keyword optimization
- **Missing Skills Detection** — Priority-ranked (critical/important/nice-to-have) missing skills with actionable suggestions
- **Bullet Point Rewrites** — AI suggests improved, metrics-driven versions of your resume bullet points
- **Keyword Analysis** — Visual tag clouds showing well-used, underused, and missing keywords
- **Action Verb Analysis** — Identifies strong verbs you're using and suggests better alternatives
- **Google OAuth Integration** — Sign in with Google for seamless authentication
- **JWT Authentication** — Secure token-based auth with protected routes
- **Premium Monochrome UI** — Sleek black & white design with glassmorphism, gradient buttons, and micro-animations

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| React Router v7 | Client-side routing |
| Vite 8 | Build tool & dev server |
| Vanilla CSS | Custom design system with CSS variables |
| Google Identity Services | OAuth 2.0 sign-in |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JWT (jsonwebtoken) | Authentication tokens |
| Multer | File upload handling (memory storage) |
| pdfjs-dist | PDF text extraction |
| Groq API (LLaMA 3.3 70B) | AI-powered resume analysis |
| google-auth-library | Google OAuth verification |

---

## 📁 Project Structure

```
ResumeAnalyzer/
├── client/                          # Frontend (React + Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Contact/             # Contact page
│   │   │   ├── Home/                # Landing page with hero, features, CTA
│   │   │   ├── Login/               # Login form + Google Sign-In
│   │   │   ├── Navbar/              # Responsive navbar with auth state
│   │   │   ├── ProtectedRoute/      # Route guard (checks JWT in localStorage)
│   │   │   ├── Register/            # Registration form + Google Sign-Up
│   │   │   └── YourResumes/         # Dashboard: upload, JD input, results
│   │   ├── App.jsx                  # Route definitions
│   │   ├── main.jsx                 # App entry point
│   │   └── index.css                # Global design system & tokens
│   ├── .env                         # VITE_GOOGLE_CLIENT_ID
│   └── index.html                   # HTML entry with SEO meta tags
│
├── server/                          # Backend (Express + MongoDB)
│   ├── controllers/
│   │   ├── authController.js        # Register, Login, Google Auth, Profile
│   │   └── resumeController.js      # Upload PDF, Analyze resume
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT verification middleware
│   │   └── upload.js                # Multer config (memory storage, PDF filter)
│   ├── models/
│   │   ├── User.js                  # User schema (name, email, password, googleId)
│   │   └── Resume.js                # Resume schema (userId, text, atsScore, suggestions)
│   ├── routes/
│   │   ├── authRoutes.js            # /auth/* routes
│   │   └── resumeRoutes.js          # /resume/* routes
│   ├── utils/
│   │   ├── aiAnalyzer.js            # Groq API integration (LLaMA 3.3 70B)
│   │   ├── atsScore.js              # Keyword match percentage calculator
│   │   ├── keywordExtractor.js      # Regex-based keyword extraction
│   │   └── resumeParser.js          # PDF text extraction using pdfjs-dist
│   ├── server.js                    # Express app entry point
│   └── .env                         # Environment variables
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and **npm**
- **MongoDB** (local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier)
- **Groq API Key** — Get a free key at [console.groq.com](https://console.groq.com)
- **Google OAuth Client ID** *(optional)* — From [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

### 1. Clone the Repository

```bash
git clone https://github.com/RavikantiAkshay/resume-analyzer.git
cd resume-analyzer
```

### 2. Setup the Backend

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Start the backend server:

```bash
npm run dev
```

### 3. Setup the Frontend

```bash
cd ../client
npm install
```

Create a `.env` file in the `client/` directory:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Start the frontend dev server:

```bash
npm run dev
```

### 4. Open the App

Visit **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register a new user | ✗ |
| POST | `/auth/login` | Login with email/password | ✗ |
| POST | `/auth/google` | Authenticate via Google OAuth | ✗ |
| GET | `/auth/profile` | Get authenticated user profile | ✓ |

### Resume

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/resume/upload` | Upload and parse a PDF resume | ✓ |
| POST | `/resume/analyze` | Analyze resume against a job description | ✓ |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ping` | Server health check |

---

## 🔒 Environment Variables

### Server (`server/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `GROQ_API_KEY` | Groq API key for AI analysis |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

### Client (`client/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID (exposed to browser) |

---

## 🎨 Design System

The app follows a **monochrome (black & white) design system** with:

- **Dark theme** — Pure black backgrounds with elevated surface layers
- **Glassmorphism** — Subtle transparency and backdrop blur on cards
- **Premium gradients** — Metallic white gradient buttons with skew-glare hover effects
- **Micro-animations** — Smooth fade-ins, slide-ups, and shimmer transitions
- **Inter font** — Clean, modern typography loaded from Google Fonts
- **Responsive layout** — Mobile-first with breakpoints at 640px and 768px

---

## 📊 How the Analysis Works

1. **Upload** — Your PDF resume is parsed server-side using `pdfjs-dist`, extracting all readable text
2. **Keyword Extraction** — Both resume and job description are tokenized into lowercase 3+ character words
3. **ATS Score** — Calculates the percentage of unique JD keywords found in your resume
4. **AI Analysis** — The full resume and JD text are sent to Groq's LLaMA 3.3 70B model, which returns:
   - Overall compatibility score & letter grade
   - Section-by-section scores (skills, experience, education, formatting, keywords)
   - Strengths and weaknesses
   - Priority-ranked missing skills with suggestions
   - Keyword analysis (well-used, underused, missing)
   - Action verb analysis
   - Bullet point improvement suggestions
5. **Results** — Everything is displayed in a tabbed, interactive dashboard with visual score rings and tag clouds

---

## 🙏 Acknowledgements

- [Groq](https://groq.com) — Ultra-fast AI inference
- [Meta LLaMA 3.3](https://ai.meta.com/llama/) — Open-source large language model
- [Mozilla PDF.js](https://mozilla.github.io/pdf.js/) — PDF parsing library
- [Google Identity Services](https://developers.google.com/identity) — OAuth 2.0 authentication

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).