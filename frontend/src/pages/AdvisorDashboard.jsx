/* file: frontend/src/pages/AdvisorDashboard.jsx */
import { useState } from "react";
import AllCourses from "./advisor/AllCourses";
import AdvisorProfile from "./advisor/AdvisorProfile";
import AcademicEvents from "./advisor/AcademicEvents";
import MyStudents from "./advisor/MyStudents";
import AdvisorApprovals from "./advisor/AdvisorApprovals";

// ❌ HIDDEN FOR NOW
// import MyInstructorCourses from "./advisor/MyInstructorCourses";

export default function AdvisorDashboard() {
  const [activeTab, setActiveTab] = useState("students");
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <span className="font-semibold">Advisor Portal</span>
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
            <h1 className="text-lg font-semibold tracking-wide">
              Advisor Portal
            </h1>

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
            <NavBtn
              active={activeTab === "students"}
              onClick={() => {
                setActiveTab("students");
                setSidebarOpen(false);
              }}
            >
              Student Approvals
            </NavBtn>

            {/* ❌ INSTRUCTOR COURSES HIDDEN */}
            {/*
            <NavBtn
              active={activeTab === "instructor-courses"}
              onClick={() => setActiveTab("instructor-courses")}
            >
              Instructor Courses
            </NavBtn>
            */}

            <NavBtn
              active={activeTab === "all-courses"}
              onClick={() => {
                setActiveTab("all-courses");
                setSidebarOpen(false);
              }}
            >
              All Offerings
            </NavBtn>

            <NavBtn
              active={activeTab === "my-students"}
              onClick={() => {
                setActiveTab("my-students");
                setSidebarOpen(false);
              }}
            >
              My Students
            </NavBtn>

            <NavBtn
              active={activeTab === "events"}
              onClick={() => {
                setActiveTab("events");
                setSidebarOpen(false);
              }}
            >
              Academic Events
            </NavBtn>

            <NavBtn
              active={activeTab === "profile"}
              onClick={() => {
                setActiveTab("profile");
                setSidebarOpen(false);
              }}
            >
              Profile
            </NavBtn>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-neutral-700">
          <p className="text-sm text-neutral-400 mb-3">
            {user?.name || "Advisor"}
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

      {/* ================= MAIN ================= */}
      <main className="md:ml-64 p-6 min-h-screen overflow-y-auto">
        {activeTab === "students" && <AdvisorApprovals />}
        {activeTab === "all-courses" && <AllCourses />}
        {activeTab === "my-students" && <MyStudents />}
        {activeTab === "events" && <AcademicEvents />}
        {activeTab === "profile" && <AdvisorProfile />}
      </main>
    </div>
  );
}

/* ================= NAV BUTTON ================= */
function NavBtn({ active, children, ...props }) {
  return (
    <button
      {...props}
      className={`text-left px-6 py-3 text-sm transition-colors
        ${
          active
            ? "bg-neutral-800 text-white font-medium border-l-4 border-indigo-500"
            : "text-neutral-300 hover:bg-neutral-800 border-l-4 border-transparent"
        }`}
    >
      {children}
    </button>
  );
}
