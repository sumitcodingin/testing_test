/* file: frontend/src/pages/StudentDashboard.jsx */
import { useState } from "react";

import Courses from "./student/Courses";
import StudentProfile from "./student/StudentProfile";
import StudentRecords from "./student/StudentRecords";
import StudentTimetable from "./student/StudentTimetable";
import CourseInstructorFeedback from "./student/CourseInstructorFeedback";
import AcademicEvents from "./student/AcademicEvents";
import StudentProjects from "./student/StudentProjects";
import StudentPrograms from "./student/StudentPrograms";

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("courses");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ================= TOP BAR (MOBILE) ================= */}
      <div className="md:hidden flex items-center justify-between bg-neutral-900 text-white px-4 py-3">
        <button onClick={() => setSidebarOpen(true)}>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-semibold">Student Portal</span>
      </div>

      {/* ================= SIDEBAR ================= */}
      <nav
        className={`
          fixed top-0 left-0 h-screen w-64 bg-neutral-900 text-neutral-200 shadow-lg
          flex flex-col justify-between z-50
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* HEADER */}
        <div>
          <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-700">
            <h1 className="text-lg font-semibold tracking-wide">Student Portal</h1>

            {/* CLOSE BUTTON (MOBILE) */}
            <button
              className="md:hidden text-neutral-400"
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* NAV ITEMS */}
          <div className="flex flex-col mt-4">
            <NavButton label="Courses" active={activeTab === "courses"} onClick={() => { setActiveTab("courses"); setSidebarOpen(false); }} />
            <NavButton label="Degree Programs" active={activeTab === "programs"} onClick={() => { setActiveTab("programs"); setSidebarOpen(false); }} />
            <NavButton label="Projects" active={activeTab === "projects"} onClick={() => { setActiveTab("projects"); setSidebarOpen(false); }} />
            <NavButton label="Records" active={activeTab === "records"} onClick={() => { setActiveTab("records"); setSidebarOpen(false); }} />
            <NavButton label="Timetable" active={activeTab === "timetable"} onClick={() => { setActiveTab("timetable"); setSidebarOpen(false); }} />
            <NavButton label="Feedback" active={activeTab === "feedback"} onClick={() => { setActiveTab("feedback"); setSidebarOpen(false); }} />
            <NavButton label="Academic Events" active={activeTab === "academic-events"} onClick={() => { setActiveTab("academic-events"); setSidebarOpen(false); }} />
            <NavButton label="Profile" active={activeTab === "profile"} onClick={() => { setActiveTab("profile"); setSidebarOpen(false); }} />
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-neutral-700">
          <p className="text-sm text-neutral-400 mb-3">
            {user?.name || "Student"}
          </p>

          <button
            onClick={logout}
            className="w-full bg-neutral-700 hover:bg-neutral-600 px-3 py-2 rounded-md text-sm text-white transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* OVERLAY (MOBILE) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================= MAIN CONTENT ================= */}
      <main className="md:ml-64 p-6 min-h-screen overflow-y-auto">
        {activeTab === "courses" && <Courses />}
        {activeTab === "programs" && <StudentPrograms />}
        {activeTab === "projects" && <StudentProjects />}
        {activeTab === "records" && <StudentRecords />}
        {activeTab === "timetable" && <StudentTimetable />}
        {activeTab === "academic-events" && <AcademicEvents />}
        {activeTab === "feedback" && <CourseInstructorFeedback />}
        {activeTab === "profile" && <StudentProfile />}
      </main>
    </div>
  );
}

/* ---------------------------
   NAV BUTTON
---------------------------- */
function NavButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`text-left px-6 py-3 text-sm transition-colors
        ${
          active
            ? "bg-neutral-800 text-white font-medium border-l-4 border-indigo-500"
            : "text-neutral-300 hover:bg-neutral-800 border-l-4 border-transparent"
        }`}
    >
      {label}
    </button>
  );
}
