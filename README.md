# JOBJAB — Job Matching Platform (Frontend)

React frontend for the **JOBJAB** job matching platform. Connects **Candidates** and **Employers** with personalized match scoring, application tracking, and an employer analytics/applicant management workspace.

## Live Application

- **Frontend:** https://jobjab-one.vercel.app
- **Backend API:** https://jobjab-api.onrender.com

## Overview

Built with **React 19**, **Vite 8 (Rolldown)**, **TailwindCSS v4**, **React Router v7**, and **TanStack React Query v5**, featuring lazy-loaded route splitting, `httpOnly` cookie-authenticated API calls via Axios, and a dark-mode UI.

## Features

### Authentication & Role Switching
- Sign up and login with `httpOnly` cookie session handling (`AuthContext.jsx`)
- Protected routes separated by role (`candidate` and `employer`)
- Multi-role support for switching between Candidate and Employer views

### Candidate Interface
- **Home & All Jobs:** Browse recommended and filterable jobs with personalized Match Score badges, salary popover, and filter sheets/chips
- **Job Detail:** View responsibilities, requirements, and matched vs. missing skill breakdown (`MatchModal`)
- **Apply:** Submit job applications with editable profile/cover letter and resume upload (`ResumeUploader`)
- **Application Status:** Track submitted application progress and interview dates
- **Profile & Favorites:** Manage skills, experience, education, cropped avatar (`AvatarUploader`), and saved jobs

### Employer Interface
- **Dashboard:** Overview cards, today's tasks/action items, and interactive schedule (`EmployerCalendar`)
- **My Jobs:** Create, edit, toggle status, and manage job postings
- **Applicants:** Two-column applicant review workspace with candidate profile details, match scores, resume access, and status updates
- **Analytics:** Visual hiring metrics and charts (`Recharts`)
- **Company Profile:** Manage employer info and company logo (`CompanyLogoUploader`)

## Technology Stack

- **Core:** React 19.2, Vite 8.0 (Rolldown bundler with `advancedChunks`), React Router v7 (`react-router-dom`)
- **Data & State:** TanStack React Query v5 (`@tanstack/react-query`), Axios (`src/lib/apiClient.js`), React Context (`AuthContext`, `FavoritesContext`)
- **Styling & UI:** TailwindCSS v4 (`@tailwindcss/vite`), Shadcn / Radix UI (`@radix-ui/react-select`, `radix-ui`), CSS stylesheets (`src/styles/`)
- **Visualization & Media:** Recharts, Lucide React, Sonner (toasts), `react-calendar`, `react-easy-crop`
- **Deployment & Telemetry:** Vercel (`vercel.json`), `@vercel/speed-insights`

## Application Routes

### Public Routes
| Route | Page | Description |
|-------|------|-------------|
| `/` | `Landing` | Landing page |
| `/login` | `Login` | User sign in |
| `/signup` | `Signup` | New account registration |
| `/about` | `About` | Platform information |

### Candidate Routes (`ProtectedRoute requiredRole="candidate"`)
| Route | Page | Description |
|-------|------|-------------|
| `/home` | `Home` | Personalized job recommendations |
| `/all-jobs` | `AllJobs` | Full job catalog with filters |
| `/favorite` | `Favorite` | Saved jobs |
| `/status` | `AppStatus` | Submitted application tracker |
| `/profile` | `Profile` | Candidate profile overview |
| `/profile/edit` | `Edit` | Edit profile, skills, experience, education |
| `/job/:id` | `JobDetail` | Job details & match score breakdown |
| `/job/:id/apply` | `Apply` | Job application form |

### Employer Routes (`ProtectedRoute requiredRole="employer"`)
| Route | Page | Description |
|-------|------|-------------|
| `/employer/dashboard` | `EmployerDashboard` | Employer overview & tasks |
| `/employer/jobs` | `EmployerJobs` | Manage job postings |
| `/employer/applicants` | `EmployerApplicants` | Review applicants across jobs |
| `/employer/analytics` | `EmployerAnalytics` | Hiring analytics & charts |
| `/employer/profile` | `EmployerProfile` | Company profile view |
| `/employer/profile/edit` | `EmployerProfileEdit` | Edit company profile & logo |
| `/employer/about` | `EmployerAbout` | Employer platform info |
| `/employer/jobs/:jobId/applicants` | `JobApplicantsRedirect` | Redirects to `/employer/applicants?job=:jobId` |

## Project Structure

```text
frontend/
├── public/                        # Static images and SVG assets
├── src/
│   ├── App.jsx                    # Candidate layout & tabbar
│   ├── EmployerApp.jsx            # Employer layout & tabbar
│   ├── main.jsx                   # Router, lazy-loaded routes, providers
│   ├── components/                # Shared UI, uploaders, modals, employer widgets, ui/
│   ├── context/                   # AuthContext, FavoritesContext
│   ├── hooks/                     # Custom hooks & React Query hooks
│   ├── lib/                       # apiClient.js (Axios), queryClient.js, utils.js
│   ├── pages/                     # Route-level page components
│   ├── styles/                    # Global, candidate, employer, and component CSS
│   └── utils/                     # API helpers, image cropping, formatting utilities
├── .env.example
├── index.html
├── package.json
├── vercel.json
└── vite.config.js
```

## Getting Started

### Prerequisites
- Node.js 18+
- Backend API running locally or accessible via `VITE_API_URL`

### Installation

```bash
git clone https://github.com/SUPAGORN0306/jobjab.git
cd jobjab
npm install
```

### Configuration

Create a `.env` file in `frontend/`:

```env
VITE_API_URL=http://localhost:5000
```

> In development, `vite.config.js` also proxies `/api` requests to `http://localhost:5000`.

### Available Scripts

```bash
npm run dev      # Start Vite dev server (http://localhost:5173)
npm run build    # Production build to dist/
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

## Production Deployment

Pushing to `main` triggers automatic deployment on Vercel. Set `VITE_API_URL=https://jobjab-api.onrender.com` in the Vercel project environment variables.

## Author

Supagorn — [@SUPAGORN0306](https://github.com/SUPAGORN0306)

## License

This project is licensed under the MIT License.
