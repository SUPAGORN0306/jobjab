cat > /mnt/d/JobMarket/frontend/README.md << 'README_EOF'
# JOBJAB — Job Matching Platform

React frontend for the JOBJAB job matching platform. Handles user interface, authentication flows, profile management, job browsing, application submission, and the employer dashboard.

## Live Application

- **Frontend:** https://jobjab-one.vercel.app
- **Backend API:** https://jobjab-api.onrender.com

## Overview

This is the frontend application for JOBJAB, a job matching platform connecting job seekers with employers in the technology industry. The application provides an intuitive interface for browsing jobs, managing profiles, submitting applications, and viewing personalized match scores.

The interface features a dark mode design optimized for extended use, responsive layouts supporting desktop and mobile devices, and real-time match score visualization.

## Features

### Authentication

- User registration with role selection (candidate or employer)
- Login with email and password
- Multi-role support allowing users to switch between candidate and employer modes
- Persistent session via localStorage

### Job Seeker Interface

- Job browsing with personalized match scores
- Detailed job view with matched and missing skills highlighted
- Profile management with skills, experience, and education
- Resume and profile image upload
- Job application submission with editable cover letter
- Application tracking with status indicators
- Favorites management

### Employer Interface

- Job posting form with structured fields
- Employer dashboard with job statistics
- Applicant viewing with full candidate profiles
- Application status management
- Resume access for candidates

## Technology Stack

### Core

- React 18
- Vite build tool
- React Router for client-side navigation
- Context API for state management

### UI

- CSS Modules for component-scoped styling
- Lucide React for iconography
- Custom dark mode design system

### Utilities

- Axios-free fetch API with centralized client functions
- Environment-based API URL resolution
- Client-side image cropping for avatars

### Infrastructure

- Vercel for hosting with automatic HTTPS and edge CDN
- Automatic deployments from GitHub main branch

## Match Score Display

Each job listing displays a personalized match score calculated by the backend.

Overall Score = (Skills Match x 0.50) + (Experience Match x 0.30) + (Industry Match x 0.20)

### Score Presentation

- Overall score displayed as a percentage badge on each job card
- Detailed breakdown modal showing three component scores
- Matched skills highlighted in green
- Missing skills highlighted in red
- Skill gap analysis to guide learning priorities

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Backend API running (see backend repository)

### Installation

Clone the repository and install dependencies:

    git clone https://github.com/SUPAGORN0306/jobjab.git
    cd jobjab
    npm install

### Configuration

Create a .env file in the project root:

    VITE_API_URL=http://localhost:5000

### Running the Development Server

Start the Vite development server:

    npm run dev

The application will be available at http://localhost:5173.

### Building for Production

Create an optimized production build:

    npm run build

Preview the production build locally:

    npm run preview

## Production Deployment

Pushing to the main branch triggers automatic deployment on Vercel.

Environment variables must be configured in the Vercel dashboard:

| Variable     | Value                           |
|--------------|---------------------------------|
| VITE_API_URL | https://jobjab-api.onrender.com |

## Application Routes

### Public Routes

| Route      | Component | Description                        |
|------------|-----------|------------------------------------|
| /          | Landing   | Welcome page with login and signup |
| /login     | Login     | User authentication                |
| /signup    | Signup    | New user registration              |

### Authenticated Routes (Job Seeker)

| Route          | Component | Description                               |
|----------------|-----------|-------------------------------------------|
| /home          | Home      | Personalized job recommendations          |
| /jobs          | AllJobs   | Full job listing with filters             |
| /job/:id       | JobDetail | Detailed job view with match breakdown    |
| /apply/:id     | Apply     | Application form with editable profile    |
| /profile       | Profile   | User profile overview                     |
| /profile/edit  | Edit      | Profile editing interface                 |
| /status        | AppStatus | Application tracking                      |
| /favorites     | Favorite  | Saved jobs                                |

### Authenticated Routes (Employer)

| Route                    | Component          | Description                    |
|--------------------------|--------------------|--------------------------------|
| /employer/dashboard      | EmployerDashboard  | Job statistics and overview    |
| /employer/post-job       | EmployerApp        | Create new job posting         |
| /employer/jobs/:id       | ViewApplicants     | View applicants for a job      |

## Technical Highlights

### Centralized API Client

All backend communication is handled through a single module that exports typed functions for each endpoint. This pattern ensures consistent error handling and simplifies the process of updating endpoints or adding authentication headers in the future.

### Environment-Based Configuration

The API base URL is resolved at build time from the VITE_API_URL environment variable, allowing the same codebase to work in development (localhost) and production (Vercel deployment) without modification.

### Image Handling

Profile images are processed client-side using the react-easy-crop library before upload, allowing users to crop and position their avatar. The backend then stores the optimized image on Cloudinary.

### Match Score Visualization

Match scores are visualized through a combination of percentage badges, color coding (green for high matches, yellow for medium, red for low), and a detailed breakdown modal. Matched and missing skills are shown side by side to help candidates understand their fit for each role.

### Responsive Design

All pages use CSS Grid and Flexbox layouts that adapt from desktop (three-column layouts) to tablet (two-column) to mobile (single-column). The navigation collapses into a hamburger menu on smaller screens.

## Project Structure

    jobjab/
    ├── public/                    # Static assets
    │   ├── home.svg
    │   ├── heart.svg
    │   └── human.svg
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
    │   │   ├── AppStatus.jsx
    │   │   ├── Edit.jsx
    │   │   ├── EmployerDashboard.jsx
    │   │   ├── Favorite.jsx
    │   │   ├── Home.jsx
    │   │   ├── JobDetail.jsx
    │   │   ├── Login.jsx
    │   │   ├── Profile.jsx
    │   │   └── ViewApplicants.jsx
    │   └── utils/
    │       ├── apiUrl.js          # API URL resolution helper
    │       └── cropImage.js       # Image cropping utility
    ├── .env.example
    ├── index.html
    ├── package.json
    └── vite.config.js

## Environment Variables

| Variable     | Description                    | Example                |
|--------------|--------------------------------|------------------------|
| VITE_API_URL | Backend API base URL           | http://localhost:5000  |

## Author

Supagorn

- GitHub: @SUPAGORN0306
- Frontend Repository: jobjab
- Backend Repository: jobjab-backend

## License

This project is licensed under the MIT License.
README_EOF

echo ""
echo "=== File created ==="
wc -l /mnt/d/JobMarket/frontend/README.md
echo ""
echo "=== First 5 lines ==="
head -5 /mnt/d/JobMarket/frontend/README.md