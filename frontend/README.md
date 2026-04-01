# AIMS (Academic Information Management System)

AIMS is a comprehensive, full-stack web application designed to manage academic operations. It provides role-based access and dedicated dashboards for Students, Instructors, Advisors, and Administrators, streamlining everything from course registration and grading to timetable management and academic approvals.

## 🚀 Live Demo
- **Frontend (Vercel):** [Insert your Vercel URL here]
- **Backend API (Render):** `https://aims-micro.onrender.com`

---

## 🛠️ Tech Stack

**Frontend:**
- React.js
- Tailwind CSS (for styling)
- Axios (for API requests and session interception)

**Backend:**
- Node.js & Express.js
- Supabase (PostgreSQL database & backend services)
- Nodemailer (for OTP and email notifications)

**Deployment:**
- **Frontend:** Vercel (Continuous Deployment via GitHub)
- **Backend:** Render (Web Service)
- **Ping Service:** UptimeRobot (Keeps the free Render tier awake 24/7)

---

## ✨ Features

- **Role-Based Authentication:** Secure login and access control for Admin, Advisor, Instructor, and Student roles.
- **Student Dashboard:** View timetables, register for courses, submit feedback, and view academic records.
- **Instructor Dashboard:** Manage floated courses, approve student enrollments, grade students, and oversee academic projects.
- **Advisor Dashboard:** Review student progress, approve academic requests, and manage student groups.
- **Admin Dashboard:** System-wide controls and user management.
- **OTP Verification:** Secure email-based OTP verification for signups and critical actions.
- **Persistent Sessions:** Custom Axios interceptors handling `x-user-id` and `x-session-id` headers with automatic 401 logout handling.

---

## 📂 Project Structure

The repository is organized into a monorepo structure:

```text
AIMS-MICRO/
│
├── backend/                # Node.js / Express backend
│   ├── config/             # Database and server configurations
│   ├── controllers/        # Route logic and business operations
│   ├── middleware/         # Auth and session handling
│   ├── routes/             # Express API routes
│   ├── utils/              # Helper functions (e.g., Mailer)
│   └── server.js           # Backend entry point
│
└── frontend/               # React.js frontend
    ├── public/             # Static assets
    ├── src/
    │   ├── assets/         # Images and icons
    │   ├── components/     # Reusable UI components
    │   ├── pages/          # Role-specific dashboard views
    │   ├── services/       # API integration (axios config)
    │   └── App.js          # Main React router