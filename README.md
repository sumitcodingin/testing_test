# 🎓 IIT Ropar Academic Portal (AIMS-micro)

An institutional-grade platform designed to digitize and automate complex academic workflows—from OTP-based secure onboarding and multi-tier course registration to research collaboration and automated grade analytics.



## 🚀 Advanced Academic Workflows

### 1. **Automated Academic Analytics**
* **GPA Calculation Engine**: Implements real-time logic to calculate **SGPA** for individual sessions and **CGPA** cumulatively by mapping institutional grade points.
* **Workload Enforcement**: Automatically validates enrollment requests against a strict **24-credit limit** per semester to ensure academic balance.
* **Earned vs. Registered Credits**: Dynamically tracks progress by filtering non-passing grades (F, NP, NF, I, W, U) from the cumulative earned credit total.

### 2. **Course Registration & Scheduling**
* **Collision Detection**: Prevents students from enrolling in courses with overlapping **Time Slots** (e.g., PC-1, PCE-2) within the same session.
* **Multi-Tier Enrollment State Machine**: Orchestrates a secure status flow: `Pending Instructor` $\rightarrow$ `Pending Advisor` $\rightarrow$ `Enrolled`.
* **Dynamic Registration Modes**: Supports diverse paths including **CREDIT**, **AUDIT**, **CONCENTRATION**, and **MINOR**.

### 3. **Academic Events & Scheduling Tools**
* **Centralized Academic Calendar**: Provides a synchronized repository for official academic events, Senate meeting schedules, and registration dates, all available for offline use via PDF download.
* **Dynamic Timetable Generator**: A tool that automatically maps a student's specific enrolled course slots onto a weekly visual schedule, allowing users to toggle between their personalized timetable and the general institute template.

### 4. **Research & Project Lifecycle**
* **Faculty Project Portal**: Instructors can "float" projects with specific visibility (Private/Public), student modes (Limited/Open), and prerequisite skill sets.
* **Integrated Application System**: Students browse institute-wide projects and submit join requests with personalized statements.
* **Automated Slot Control**: The system maintains real-time availability by decrementing slots immediately upon instructor acceptance.

---

## 👥 Stakeholder Features



### **Students**
* **Registration**: Add/drop courses and apply for specialized programs like Minors, Concentrations, or Internships.
* **Analytics**: Access real-time session-wise SGPA and cumulative CGPA records.
* **Engagement**: Submit quantitative and qualitative feedback for instructors across multiple performance metrics.
* **Tools**: Access personalized weekly timetables and browse available research projects.

### **Instructors**
* **Course Management**: Float new courses and manage enrollment approvals or student removals.
* **Grading**: Award grades individually or through efficient mass-grading via CSV uploads.
* **Communication**: Export class lists to CSV and send bulk emails to all enrolled students directly from the portal.
* **Research**: Manage the full lifecycle of research projects, including student join requests and member oversight.

### **Advisors**
* **Approvals**: Perform final checks and record decisions on student course enrollments and floated courses.
* **Oversight**: View the complete academic history, current workload, and profile details of assigned advisees.
* **Meeting Scheduler**: Coordinate with students via an integrated tool that generates and emails **.ics calendar invitations**.

### **Administrators**
* **User Management**: Oversee the user lifecycle, including approving, rejecting, or blocking accounts.
* **Governance**: Globally toggle system-wide windows for course registration and grade submission.
* **Course Validation**: Provide final review and approval for all courses floated by instructors.

---

## 🏗️ Technical Architecture & Security

### **Infrastructure & Reliability**
* **IPv4 SMTP Priority**: Solves Gmail SMTP latency issues by forcing IPv4 first in DNS resolution at the server level.
* **Secure OTP Auth**: Implementation of a dual-stage OTP verification system (Login & Signup) restricted strictly to institutional domains (`@iitrpr.ac.in`).
* **Session Persistence**: Utilizes `localStorage` for cross-tab session synchronization, ensuring a unified session across multiple browser windows.

### **Database Design (Supabase / PostgreSQL)**
* **Relational Integrity**: Leverages complex foreign key relationships across `users`, `student_profile`, `enrollments`, and `courses`.
* **Least-Loaded Assignment**: Employs a specific algorithm to automatically assign students to the advisor with the minimum current engagements in their department.

---

## 🛠️ Setup & Installation

1.  **Dependencies**: Run `npm install` in both `backend` and `frontend` folders.
2.  **Environment**: Configure `.env` in the `backend` folder with:
    * `SUPABASE_URL`, `SUPABASE_KEY`
    * `EMAIL_USER`, `EMAIL_PASS` (Gmail App Password)
3.  **Deployment**:
    * **Backend**: `node server.js`
    * **Frontend**: `npm start`
