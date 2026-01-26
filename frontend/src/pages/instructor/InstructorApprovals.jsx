/* frontend/src/pages/instructor/InstructorApprovals.jsx */
import { useEffect, useState } from "react";
import api from "../../services/api";

// CSV Download function
const downloadEnrolledStudentsCSV = async (course_id, course_code, instructor_id) => {
  const res = await api.get(`/instructor/course-students/${course_id}`, {
    params: { instructor_id },
  });
  const students = res.data || [];
  if (!students.length) { alert("No enrolled students"); return; }
  const csv = ["Student Name,Email", ...students.map(s => `"${s.name}","${s.email}"`)].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${course_code}_students.csv`;
  link.click();
};

export default function InstructorApprovals() {
  const [courses, setCourses] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // ✅ Selection State for Bulk Actions
  const [selectedIds, setSelectedIds] = useState(new Set());
  
  // ✅ State for Modals
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [activeModalCourse, setActiveModalCourse] = useState(null);

  // Tabs: PENDING vs PROCESSED (includes Enrolled, Advisor Pending, Advisor Rejected)
  const [viewMode, setViewMode] = useState("PENDING");

  const [courseSearch, setCourseSearch] = useState("");
  const [courseDept, setCourseDept] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [studentDept, setStudentDept] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const isSessionValid = Boolean(user && user.id);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (!isSessionValid) return;
    api.get("/instructor/courses", { params: { instructor_id: user.id } })
      .then(res => setCourses(res.data || []))
      .catch(() => setCourses([]));
  }, [isSessionValid, user?.id]);

  useEffect(() => {
    if (!isSessionValid || !selectedCourse) return;
    api.get("/instructor/applications", { params: { course_id: selectedCourse.course_id } })
      .then(res => {
        setApplications(res.data || []);
        setSelectedIds(new Set()); // Reset selection on fresh load
      })
      .catch(() => setApplications([]));
  }, [isSessionValid, selectedCourse]);

  /* ================= SINGLE ACTION ================= */
  const handleAction = async (enrollmentId, action) => {
    if (!isSessionValid) return;
    if (action === "REMOVE" && !window.confirm("Remove student?")) return;

    await api.post("/instructor/approve-student", {
      enrollmentId,
      action,
      instructor_id: user.id,
    });

    if (action === "ACCEPT") {
       setApplications(prev => prev.map(a => 
         a.enrollment_id === enrollmentId ? { ...a, status: "PENDING_ADVISOR_APPROVAL" } : a
       ));
    } else {
       setApplications(prev => prev.filter(a => a.enrollment_id !== enrollmentId));
    }
    // Remove from selection if present
    setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(enrollmentId);
        return next;
    });
  };

  /* ================= BULK ACTIONS ================= */
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = filteredStudents.map(s => s.enrollment_id);
      setSelectedIds(new Set(allIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to ${action} ${selectedIds.size} students?`)) return;

    try {
      await api.post("/instructor/bulk-approve-student", {
        enrollmentIds: Array.from(selectedIds),
        action,
        instructor_id: user.id
      });
      
      alert("Success!");
      // Refresh Data
      const res = await api.get("/instructor/applications", { params: { course_id: selectedCourse.course_id } });
      setApplications(res.data || []);
      setSelectedIds(new Set());

    } catch (err) {
      alert("Bulk action failed.");
    }
  };

  // ✅ Open Details Modal
  const handleOpenDetails = (course) => {
    setActiveModalCourse(course);
    setShowDetailsModal(true);
  };

  // ✅ Open Email Modal
  const handleOpenEmail = (course) => {
    setActiveModalCourse(course);
    setShowEmailModal(true);
  };

  /* ================= FILTERING ================= */
  const filteredCourses = courses.filter(c => {
    const q = courseSearch.toLowerCase();
    return (
      (c.course_code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)) &&
      (!courseDept || c.department === courseDept)
    );
  });

  const filteredStudents = applications
    .filter(a => {
      if (viewMode === "PENDING") {
        return a.status === "PENDING_INSTRUCTOR_APPROVAL";
      } else {
        // Show: Enrolled, Pending Advisor, AND Advisor Rejected
        return ["ENROLLED", "PENDING_ADVISOR_APPROVAL", "ADVISOR_REJECTED"].includes(a.status);
      }
    })
    .filter(a => {
      const q = studentSearch.toLowerCase();
      const name = a.student?.full_name?.toLowerCase() || "";
      const entry = a.student?.entry_no?.toLowerCase() || "";
      return (
        (!studentSearch || name.includes(q) || entry.includes(q)) &&
        (!studentDept || a.student?.department === studentDept)
      );
    });

  if (!isSessionValid) return <div className="p-10 text-red-600">Session expired.</div>;

  return (
    <div className="max-w-6xl">
      {!selectedCourse && (
        <>
          <h2 className="text-xl font-bold mb-4">My Courses</h2>
          <div className="grid md:grid-cols-3 gap-3 mb-4">
             <input placeholder="Search course..." className="border px-3 py-2 text-sm" value={courseSearch} onChange={e => setCourseSearch(e.target.value)} />
             {/* Add Department Select here if needed */}
          </div>
          <div className="bg-white border">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left">Course</th>
                  <th className="px-3 py-2">Department</th>
                  <th className="px-3 py-2">Enrolled</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map(c => (
                  <tr key={c.course_id} className="border-t">
                    <td className="px-3 py-2"><b>{c.course_code}</b><br/><span className="text-xs">{c.title}</span></td>
                    <td className="px-3 py-2">{c.department}</td>
                    <td className="px-3 py-2">{c.enrolled_count}/{c.capacity}</td>
                    <td className="px-3 py-2 text-right space-x-2">
                      {/* ✅ View Details Button */}
                      <button 
                        onClick={() => handleOpenDetails(c)} 
                        className="border px-2 py-1 bg-gray-50 hover:bg-gray-200 text-xs rounded"
                        title="View Course Details"
                      >
                        ℹ️ Info
                      </button>

                      {/* ✅ Gmail / Email Button */}
                      <button 
                        onClick={() => handleOpenEmail(c)} 
                        className="border px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs rounded"
                        title="Email Class"
                      >
                        ✉️ Email
                      </button>

                      {/* Manage Button */}
                      <button 
                        onClick={() => setSelectedCourse(c)} 
                        className="border px-3 py-1 bg-neutral-800 text-white hover:bg-neutral-900 text-xs rounded"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {selectedCourse && (
        <>
          <button onClick={() => setSelectedCourse(null)} className="text-blue-700 text-sm mb-4">← Back to Courses</button>
          <div className="border bg-white p-4 mb-4 flex justify-between items-center">
            <h3 className="text-lg font-bold">{selectedCourse.course_code} — {selectedCourse.title}</h3>
            <button onClick={() => downloadEnrolledStudentsCSV(selectedCourse.course_id, selectedCourse.course_code, user.id)} className="border px-4 py-1 text-sm">Download CSV</button>
          </div>

          <div className="flex gap-4 mb-4 border-b">
            <button 
              className={`pb-2 px-1 ${viewMode === 'PENDING' ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}
              onClick={() => { setViewMode('PENDING'); setSelectedIds(new Set()); }}
            >
              Pending Requests
            </button>
            <button 
              className={`pb-2 px-1 ${viewMode === 'APPROVED' ? 'border-b-2 border-black font-bold' : 'text-gray-500'}`}
              onClick={() => { setViewMode('APPROVED'); setSelectedIds(new Set()); }}
            >
              Processed (Enrolled / Advisor Status)
            </button>
          </div>

          {/* ✅ BULK ACTION BAR */}
          {viewMode === "PENDING" && selectedIds.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 p-2 mb-3 flex items-center gap-4 rounded">
              <span className="text-sm font-bold text-blue-800">{selectedIds.size} Selected</span>
              <button onClick={() => handleBulkAction("ACCEPT")} className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700">Accept Selected</button>
              <button onClick={() => handleBulkAction("REJECT")} className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700">Reject Selected</button>
            </div>
          )}

          <div className="bg-white border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                   {/* ✅ SELECT ALL CHECKBOX */}
                   {viewMode === "PENDING" && (
                     <th className="px-3 py-2 w-10">
                       <input type="checkbox" onChange={handleSelectAll} checked={filteredStudents.length > 0 && selectedIds.size === filteredStudents.length} />
                     </th>
                   )}
                   <th className="px-3 py-2 text-left">Student Name</th>
                   <th className="px-3 py-2 text-left">Department</th>
                   <th className="px-3 py-2 text-right">Status / Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? <tr><td colSpan="4" className="p-4 text-center text-gray-500">No records found.</td></tr> :
                filteredStudents.map(a => (
                  <tr key={a.enrollment_id} className={`border-t ${selectedIds.has(a.enrollment_id) ? 'bg-blue-50' : ''}`}>
                    {/* ✅ ROW CHECKBOX */}
                    {viewMode === "PENDING" && (
                      <td className="px-3 py-2">
                        <input type="checkbox" checked={selectedIds.has(a.enrollment_id)} onChange={() => handleSelectOne(a.enrollment_id)} />
                      </td>
                    )}
                    <td className="px-3 py-2">
                      <b>{a.student?.full_name}</b><br/>
                      <span className="text-xs text-gray-500">{a.student?.email}</span>
                    </td>
                    <td className="px-3 py-2">{a.student?.department}</td>
                    <td className="px-3 py-2 text-right">
                      {viewMode === "PENDING" ? (
                        <>
                          <button onClick={() => handleAction(a.enrollment_id, "ACCEPT")} className="text-green-600 font-bold mr-3">Accept</button>
                          <button onClick={() => handleAction(a.enrollment_id, "REJECT")} className="text-red-600 font-bold">Reject</button>
                        </>
                      ) : (
                        <>
                          {/* 1. ENROLLED */}
                          {a.status === "ENROLLED" && (
                            <button onClick={() => handleAction(a.enrollment_id, "REMOVE")} className="text-red-600 underline">Remove</button>
                          )}

                          {/* 2. PENDING ADVISOR */}
                          {a.status === "PENDING_ADVISOR_APPROVAL" && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded border border-yellow-200">
                              Waiting for Advisor
                            </span>
                          )}

                          {/* 3. REJECTED BY ADVISOR */}
                          {a.status === "ADVISOR_REJECTED" && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded border border-red-200 font-bold">
                              Rejected by Advisor
                            </span>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ✅ Course Details Modal */}
      {showDetailsModal && activeModalCourse && (
        <CourseDetailsModal 
          course={activeModalCourse} 
          onClose={() => setShowDetailsModal(false)} 
        />
      )}

      {/* ✅ Email Class Modal */}
      {showEmailModal && activeModalCourse && (
        <EmailClassModal 
          course={activeModalCourse} 
          instructorId={user.id}
          onClose={() => setShowEmailModal(false)} 
        />
      )}

    </div>
  );
}

/* ================= HELPERS & MODALS ================= */

// ✅ Modal: Course Details
function CourseDetailsModal({ course, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-2 right-4 text-xl font-bold text-gray-500 hover:text-black">×</button>
        <h3 className="text-xl font-bold mb-4 border-b pb-2">Course Details</h3>
        
        <div className="space-y-3 text-sm">
          <DetailRow label="Title" value={course.title} />
          <DetailRow label="Code" value={course.course_code} />
          <DetailRow label="Department" value={course.department} />
          <DetailRow label="Credits" value={course.credits} />
          <DetailRow label="Slot" value={course.slot} />
          <DetailRow label="Session" value={course.acad_session} />
          <DetailRow label="Capacity" value={`${course.enrolled_count} / ${course.capacity}`} />
          <DetailRow label="Status" value={course.status} />
        </div>

        <div className="mt-6 text-right">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm">Close</button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between border-b border-gray-100 pb-1">
      <span className="font-semibold text-gray-600">{label}:</span>
      <span className="text-gray-800 text-right">{value || "—"}</span>
    </div>
  );
}

// ✅ Modal: Send Email
function EmailClassModal({ course, instructorId, onClose }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) return alert("Please fill all fields.");
    setSending(true);

    try {
      await api.post("/instructor/send-course-email", {
        course_id: course.course_id,
        instructor_id: instructorId,
        subject,
        message
      });
      alert("Email sent successfully!");
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to send email.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full relative">
        <button onClick={onClose} className="absolute top-2 right-4 text-xl font-bold text-gray-500 hover:text-black">×</button>
        <h3 className="text-xl font-bold mb-4">Email Enrolled Students</h3>
        <p className="text-sm text-gray-600 mb-4">
          Sending to all enrolled students of <b>{course.course_code}</b>.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Subject</label>
            <input 
              className="w-full border p-2 rounded text-sm" 
              value={subject} 
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g. Mid-term Exam Schedule"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Message</label>
            <textarea 
              className="w-full border p-2 rounded text-sm h-32" 
              value={message} 
              onChange={e => setMessage(e.target.value)}
              placeholder="Type your message here..."
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm">Cancel</button>
          <button 
            onClick={handleSend} 
            disabled={sending}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send Email"}
          </button>
        </div>
      </div>
    </div>
  );
}