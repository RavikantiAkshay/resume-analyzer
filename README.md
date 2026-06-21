# ResumeAI — AI-Powered Resume Builder & ATS Analyzer

An open-source, full-stack web application that helps you **build**, **optimize**, and **analyze** resumes using AI. Craft polished resumes with our live-preview builder, generate STAR-method bullet points with one click, and scan your resume against any job description for ATS compatibility — all in one platform.

---

## ✨ Features

### Resume Builder
- **Live-Preview Builder** — Build resumes from scratch with a real-time PDF preview
- **AI STAR Bullets** — One-click AI generation of high-impact, metrics-driven bullet points using the STAR method
- **Custom Sections** — Add any section (Certifications, Languages, Volunteering, etc.) beyond the defaults
- **PDF Import** — Upload an existing PDF resume and auto-populate the builder fields via AI parsing
- **PDF Download** — Download your finished resume as a professional PDF

### ATS Analyzer
- **ATS Compatibility Score** — Keyword-by-keyword comparison between your resume and the target job description
- **AI-Powered Analysis** — Deep, contextual analysis powered by Groq's LLaMA 3.3 70B model
- **Section-by-Section Breakdown** — Scores for skills match, experience relevance, education fit, formatting quality, and keyword optimization
- **Missing Skills Detection** — Priority-ranked (critical/important/nice-to-have) missing skills with actionable suggestions
- **Keyword Analysis** — Visual tag clouds showing well-used, underused, and missing keywords
- **Action Verb Analysis** — Identifies strong verbs and suggests better alternatives
- **Bullet Point Rewrites** — AI suggests improved, metrics-driven versions of your resume bullet points

### Platform
- **Google OAuth Integration** — Sign in with Google for seamless authentication
- **Secure Cookie-Based Auth** — HttpOnly, Secure JWT cookies with cross-origin support for production deployments
- **Rate Limiting** — API and AI endpoint rate limiting to prevent abuse
- **Open Source** — MIT licensed, contributions welcome

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| React Router v7 | Client-side routing |
| Vite 8 | Build tool & dev server |
| TailwindCSS | Utility-first CSS framework |
| Google Identity Services | OAuth 2.0 sign-in |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JWT (jsonwebtoken) | Cookie-based authentication |
| cookie-parser | HTTP cookie parsing |
| express-rate-limit | API rate limiting |
| Multer | File upload handling (disk storage) |
| pdfjs-dist | PDF text extraction |
| Groq API (LLaMA 3.3 70B) | AI-powered analysis & bullet generation |
| google-auth-library | Google OAuth verification |

---

## 📁 Project Structure

```
ResumeAI/
├── client/                          # Frontend (React + Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Builder/             # Resume builder with live PDF preview
│   │   │   ├── Contact/             # Contact page with email & open source links
│   │   │   ├── Home/                # Landing page with hero, how-it-works, features
│   │   │   ├── Login/               # Login form + Google Sign-In
│   │   │   ├── Navbar/              # Responsive navbar with auth state
│   │   │   ├── ProtectedRoute/      # Route guard (checks auth via cookie)
│   │   │   ├── Register/            # Registration form + Google Sign-Up
│   │   │   └── YourResumes/         # Dashboard: upload, JD input, ATS results
│   │   ├── App.jsx                  # Route definitions
│   │   ├── main.jsx                 # App entry point
│   │   └── index.css                # Global design system & tokens
│   ├── .env                         # VITE_GOOGLE_CLIENT_ID
│   └── index.html                   # HTML entry with SEO meta tags
│
├── server/                          # Backend (Express + MongoDB)
│   ├── controllers/
│   │   ├── authController.js        # Register, Login, Google Auth, Profile, Logout
│   │   ├── builderController.js     # CRUD resumes, AI bullets, PDF parse
│   │   └── resumeController.js      # Upload PDF, Analyze resume, History
│   ├── middleware/
│   │   ├── authMiddleware.js        # JWT verification (cookie + Bearer fallback)
│   │   ├── rateLimiter.js           # Rate limiting middleware
│   │   └── upload.js                # Multer config (disk storage, secure filenames)
│   ├── models/
│   │   ├── User.js                  # User schema (name, email, password, googleId)
│   │   ├── Resume.js                # ATS analysis results schema
│   │   └── ResumeBuilder.js         # Builder resume schema (sections, custom fields)
│   ├── routes/
│   │   ├── authRoutes.js            # /auth/* routes
│   │   ├── builderRoutes.js         # /builder/* routes
│   │   └── resumeRoutes.js          # /resume/* routes
│   ├── utils/
│   │   ├── aiAnalyzer.js            # Groq API integration (LLaMA 3.3 70B)
│   │   ├── atsScore.js              # Keyword match percentage calculator
│   │   ├── builderAi.js             # AI bullet generation & resume parsing
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
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLIENT_URL=http://localhost:5173
```

> **Note:** Set `NODE_ENV=production` and `CLIENT_URL` to your deployed frontend URL when deploying.

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
VITE_API_URL=http://localhost:5000
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
| POST | `/auth/logout` | Logout (clears cookie) | ✗ |
| GET | `/auth/profile` | Get authenticated user profile | ✓ |

### Resume (ATS Analyzer)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/resume/upload` | Upload and parse a PDF resume | ✓ |
| POST | `/resume/analyze` | Analyze resume against a job description | ✓ |
| GET | `/resume/history` | Fetch past analysis history | ✓ |

### Builder

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/builder` | Create a new builder resume | ✓ |
| GET | `/builder` | List all builder resumes | ✓ |
| GET | `/builder/:id` | Get a specific builder resume | ✓ |
| PUT | `/builder/:id` | Update a builder resume | ✓ |
| DELETE | `/builder/:id` | Delete a builder resume | ✓ |
| POST | `/builder/generate-bullets` | AI-generate STAR bullets | ✓ |
| POST | `/builder/parse-upload` | Upload PDF and auto-populate builder | ✓ |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ping` | Server health check |

---

## 🔒 Security

- **HttpOnly Cookies** — JWTs stored in HttpOnly cookies, preventing XSS token theft
- **Cross-Origin Cookie Support** — `sameSite: "none"` + `secure: true` in production for cross-domain deployments
- **Mass Assignment Protection** — Protected fields (`userId`, `_id`, `createdAt`, `updatedAt`, `__v`) are stripped from update requests
- **Secure File Uploads** — Cryptographically random filenames (no path traversal), guaranteed cleanup via `finally` blocks
- **Rate Limiting** — Separate limiters for auth, API, and AI endpoints
- **Input Validation** — Server-side validation on all endpoints

---

## 🔒 Environment Variables

### Server (`server/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | `development` or `production` |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `GROQ_API_KEY` | Groq API key for AI analysis |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `CLIENT_URL` | Frontend URL for CORS (e.g., `http://localhost:5173`) |

### Client (`client/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID (exposed to browser) |
| `VITE_API_URL` | Backend API URL (e.g., `http://localhost:5000`) |

---

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repo to [Vercel](https://vercel.com)
2. Set root directory to `client`
3. Add environment variables: `VITE_GOOGLE_CLIENT_ID`, `VITE_API_URL`
4. Deploy

### Backend (Render)
1. Connect your GitHub repo to [Render](https://render.com)
2. Set root directory to `server`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all environment variables from the table above
6. Set `NODE_ENV=production` and `CLIENT_URL` to your Vercel frontend URL

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

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🙏 Acknowledgements

- [Groq](https://groq.com) — Ultra-fast AI inference
- [Meta LLaMA 3.3](https://ai.meta.com/llama/) — Open-source large language model
- [Mozilla PDF.js](https://mozilla.github.io/pdf.js/) — PDF parsing library
- [Google Identity Services](https://developers.google.com/identity) — OAuth 2.0 authentication

---

## 📄 License

© 2026 Ravikanti Akshay. This project is open source and available under the [MIT License](LICENSE).