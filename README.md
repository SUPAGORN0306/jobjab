# JOBJAB — AI-Powered Job Matching Platform

A full-stack web application that connects job seekers with employers in the technology industry. The platform features an algorithmic match scoring system that evaluates candidate-job fit based on skills, experience, and industry alignment, providing personalized job recommendations instead of generic search results.

## Live Demo

- **Frontend Application:** https://jobjab-one.vercel.app
- **Backend API:** https://jobjab-api.onrender.com

## Overview

JOBJAB provides a complete recruitment workflow for both job seekers and employers. Candidates can create detailed profiles, upload resumes, browse job listings, and submit applications. Employers can post job openings, review applications, and manage candidate status through a dedicated dashboard.

The core feature is the match scoring algorithm that ranks job listings for each authenticated candidate. Rather than displaying jobs in chronological order, the platform surfaces the most relevant opportunities first based on the candidate's profile.

## Features

### For Job Seekers

- Multi-role authentication supporting candidate and employer accounts
- Personalized match score displayed for every job listing
- Comprehensive profile management covering skills, work experience, and education
- Resume and profile image upload with cloud storage
- Job application submission with customizable cover letter
- Favorites system for saving interesting positions
- Application tracking with status updates (applied, reviewing, interview, rejected)

### For Employers

- Job posting interface with structured requirements
- Applicant management dashboard with filtering
- Application status workflow management
- Detailed candidate profile viewing with resume access
- Job performance metrics and applicant counts

### Platform Features

- Dark mode interface designed for extended use
- Responsive layout supporting desktop, tablet, and mobile devices
- Cloud-based file storage with automatic image optimization
- RESTful API architecture with consistent response formats

## Technology Stack

### Frontend

- React 18 with Vite build tool
- React Router for client-side navigation
- Context API for authentication state management
- CSS Modules for component-scoped styling
- Lucide React for iconography
- Deployed on Vercel with automatic HTTPS and CDN distribution

### Backend

- Python 3.12 with Flask framework
- SQLAlchemy ORM with raw SQL for complex queries
- PostgreSQL database hosted on Neon (serverless)
- bcrypt for password hashing with 12 rounds
- Cloudinary SDK for file storage
- Gunicorn as production WSGI server
- Deployed on Render with automatic deployments from GitHub

### Infrastructure

- Vercel for frontend hosting, SSL, and edge caching
- Render for backend API hosting
- Neon for serverless PostgreSQL database
- Cloudinary for file storage and image transformation
- UptimeRobot for continuous availability monitoring

## Match Score Algorithm

The match score evaluates candidate-job fit using three weighted criteria that combine into a single overall score.
Overall Score = (Skills Match × 0.50) + (Experience Match × 0.30) + (Industry Match × 0.20)


### Skills Match (50% weight)

Measures the percentage of required job skills that appear in the candidate's profile. Uses substring matching to handle related skill names.

### Experience Match (30% weight)

Compares the candidate's total years of work experience against the job's required experience level.

| Job Level | Required Years | Scoring |
|-----------|----------------|---------|
| Entry     | 0              | Full score |
| Junior    | 0              | Full score |
| Mid       | 2              | Scaled |
| Senior    | 5              | Scaled |
| Lead      | 7              | Scaled |

Candidates exceeding the requirement receive a maximum score of 100. Candidates below the requirement receive a proportional score.

### Industry Match (20% weight)

Evaluates industry alignment between the candidate and job posting:

- Exact industry match: 100 points
- Related industry (predefined mappings): 75 points
- Different industry: 40 points
- Missing data on either side: 50 points (neutral)

### Score Breakdown

Each job listing displays the three component scores along with two lists:

- **Matched Skills:** Skills the candidate has that match the job requirements
- **Missing Skills:** Skills the job requires that the candidate does not have

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Backend API running (see backend repository)

### Frontend Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/SUPAGORN0306/jobjab.git
cd jobjab
npm install

Create a .env file in the project root:
VITE_API_URL=http://localhost:5000

Start the development server:
npm run dev
The application will be available at http://localhost:5173.

Backend Setup
For full setup including the backend API, refer to the backend repository:

https://github.com/SUPAGORN0306/jobjab-backend

Production Deployment
Pushing to the main branch triggers automatic deployment on Vercel.

Environment variables must be configured in the Vercel dashboard for production deployments:

Variable	Value
VITE_API_URL	https://jobjab-api.onrender.com
API Reference
Authentication
Method	Endpoint	Description
POST	/api/auth/register	Create a new user account
POST	/api/auth/login	Authenticate existing user
POST	/api/auth/add-role	Add a secondary role to an existing account
Jobs
Method	Endpoint	Description
GET	/api/jobs	List all jobs with match scores
GET	/api/jobs/:id	Retrieve detailed job information
GET	/api/match-score/:job_id	Get standalone match score calculation
Profile
Method	Endpoint	Description
GET	/api/profile/:id	Retrieve basic profile information
GET	/api/profile/:id/full	Retrieve complete profile with skills, experience, and education
PUT	/api/profile/:id	Update profile information
POST	/api/upload/resume	Upload resume file to Cloudinary
DELETE	/api/resume/:id	Delete existing resume
POST	/api/upload/avatar	Upload profile image to Cloudinary
Applications
Method	Endpoint	Description
POST	/api/applications	Submit job application
GET	/api/applications/user/:id	Retrieve applications submitted by a user
GET	/api/applications/:id/detail	Get detailed application information
GET	/api/employer/jobs/:id/applications	Retrieve all applications for a specific job
PUT	/api/employer/applications/:id/status	Update application status
Employer
Method	Endpoint	Description
GET	/api/employer/jobs	Retrieve jobs posted by the authenticated employer
POST	/api/employer/jobs	Create a new job posting
Utilities
Method	Endpoint	Description
GET	/api/skills	Retrieve available skills for autocomplete
GET	/api/favorites	Retrieve user's favorite jobs
POST	/api/favorites/toggle	Add or remove a job from favorites
Technical Highlights
Query Optimization
The match score calculation was refactored to eliminate an N+1 query problem. Loading a list of 50 jobs with personalized match scores initially required over 200 database queries. The refactored version loads the user's profile data once per request and reuses it across all job calculations, reducing the total to 5 queries per page load.

Environment Configuration
The API base URL is resolved at build time from the VITE_API_URL environment variable, allowing the same codebase to work in development (localhost) and production (Vercel deployment) without modification.

File Storage Architecture
All uploaded files are stored on Cloudinary rather than the local filesystem, ensuring persistence across deployments and server restarts. The integration provides automatic image optimization and format conversion.

Availability Monitoring
The backend API is monitored by UptimeRobot with 14-minute interval pings, preventing cold start delays on the free hosting tier.

Project Structure
jobjab/
├── public/                    # Static assets
├── screenshots/               # Application screenshots
├── src/
│   ├── api.js                 # Centralized API client functions
│   ├── components/            # Reusable UI components
│   │   ├── AvatarUploader.jsx
│   │   ├── MatchModal.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── ResumeUploader.jsx
│   ├── context/
│   │   └── AuthContext.jsx    # Authentication state provider
│   ├── pages/                 # Route-level components
│   │   ├── AllJobs.jsx
│   │   ├── Apply.jsx
│   │   ├── Edit.jsx
│   │   ├── EmployerDashboard.jsx
│   │   ├── Home.jsx
│   │   ├── JobDetail.jsx
│   │   ├── Login.jsx
│   │   ├── Profile.jsx
│   │   └── ViewApplicants.jsx
│   └── utils/
│       ├── apiUrl.js          # API URL resolution helper
│       └── cropImage.js       # Image cropping utility
├── .env.example
├── package.json
└── vite.config.js

Author
Supagorn

GitHub: @SUPAGORN0306

Frontend Repository: jobjab

Backend Repository: jobjab-backend

License
This project is licensed under the MIT License.
