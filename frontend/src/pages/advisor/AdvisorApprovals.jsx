/* frontend/src/pages/advisor/AdvisorApprovals.jsx */
import { useEffect, useState } from "react";
import api from "../../services/api";

export default function AdvisorApprovals() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  
  // ✅ Selection
  const [selectedIds, setSelectedIds] = useState(new Set());

  const [viewMode, setViewMode] = useState("PENDING");
  const [courseSearch, setCourseSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  /* ================= FETCH COURSES ================= */
  useEffect(() => {
    api
      .get("/advisor/student-courses", {
        params: { advisor_id: user.id },
      })
      .then((res) => setCourses(res.data || []))
      .catch(() => setCourses([]));
  }, [user.id]);

  /* ================= FETCH STUDENTS ================= */
  useEffect(() => {
    if (!selectedCourse) return;

    api
      .get("/advisor/course-students", {
        params: {
          advisor_id: user.id,
          course_id: selectedCourse.course_id,
        },
      })
      .then((res) => {
        setStudents(res.data || []);
        setSelectedIds(new Set()); // Reset on course change
      })
      .catch(() => setStudents([]));
  }, [selectedCourse, user.id]);

  /* ================= SINGLE ACTION ================= */
  const handleAction = async (enrollmentId, action) => {
    if (!window.confirm(`Are you sure you want to ${action}?`)) return;

    await api.post("/advisor/approve-student", {
      enrollmentId,
      action,
      advisor_id: user.id,
    });

    setStudents((prev) =>
      prev.filter((s) => s.enrollment_id !== enrollmentId)
    );
    setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(enrollmentId);
        return next;
    });
  };

  /* ================= FILTERS ================= */
  const filteredCourses = courses.filter((c) =>
    `${c.course_code} ${c.title}`
      .toLowerCase()
      .includes(courseSearch.toLowerCase())
  );

  const filteredStudents = students
    .filter((s) =>
      viewMode === "PENDING"
        ? s.status === "PENDING_ADVISOR_APPROVAL"
        : s.status === "ENROLLED"
    )
    .filter((s) => {
      const q = studentSearch.toLowerCase();
      const name = s.student?.full_name?.toLowerCase() || "";
      const entry = s.student?.entry_no?.toLowerCase() || "";
      return !studentSearch || name.includes(q) || entry.includes(q);
    });

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
     if (!window.confirm(`Confirm ${action} for ${selectedIds.size} students?`)) return;

     try {
       await api.post("/advisor/bulk-approve-student", {
         enrollmentIds: Array.from(selectedIds),
         action,
         advisor_id: user.id
       });
       
       alert("Success!");
       // Refresh list locally
       setStudents(prev => prev.filter(s => !selectedIds.has(s.enrollment_id)));
       setSelectedIds(new Set());
     } catch(e) {
       alert("Failed to process bulk action.");
     }
  };

  /* ================= UI ================= */

  return (
    <div className="max-w-6xl">

      {/* ================= COURSE LIST ================= */}
      {!selectedCourse && (
        <>
          <h2 className="text-xl font-bold mb-4">My Students' Courses</h2>

          <input
            placeholder="Search course code / title"
            className="border px-3 py-2 text-sm mb-4 w-full md:w-1/3"
            value={courseSearch}
            onChange={(e) => setCourseSearch(e.target.value)}
          />

          <div className="bg-white border">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left">Course</th>
                  <th className="px-3 py-2">Department</th>
                  <th className="px-3 py-2">Session</th>
                  <th className="px-3 py-2">Seats</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((c) => (
                  <tr key={c.course_id} className="border-t">
                    <td className="px-3 py-2">
                      <b>{c.course_code}</b>
                      <div className="text-xs text-gray-600">
                        {c.title}
                      </div>
                    </td>
                    <td className="px-3 py-2">{c.department}</td>
                    <td className="px-3 py-2">{c.acad_session}</td>
                    <td className="px-3 py-2">
                      {c.enrolled_count}/{c.capacity}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => setSelectedCourse(c)}
                        className="border px-3 py-1 text-xs hover:bg-gray-100"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ================= COURSE DETAILS ================= */}
      {selectedCourse && (
        <>
          <button
            onClick={() => {
              setSelectedCourse(null);
              setStudents([]);
            }}
            className="text-blue-700 text-sm mb-4"
          >
            ← Back to Courses
          </button>

          <div className="bg-white border p-4 mb-4">
            <h3 className="text-lg font-bold">
              {selectedCourse.course_code} — {selectedCourse.title}
            </h3>
            <p className="text-sm">
              Department: {selectedCourse.department} | Session:{" "}
              {selectedCourse.acad_session}
            </p>
          </div>

          {/* ===== VIEW MODE + SEARCH ===== */}
          <div className="grid md:grid-cols-3 gap-3 mb-3">
            <select
              className="border px-3 py-2 text-sm"
              value={viewMode}
              onChange={(e) => {
                 setViewMode(e.target.value);
                 setSelectedIds(new Set());
              }}
            >
              <option value="PENDING">Pending Requests</option>
              <option value="ENROLLED">Enrolled Students</option>
            </select>

            <input
              placeholder="Search student name / entry no"
              className="border px-3 py-2 text-sm"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
            />
          </div>

          {/* ✅ BULK ACTIONS UI */}
          {selectedIds.size > 0 && viewMode === "PENDING" && (
             <div className="bg-gray-100 p-2 mb-2 flex gap-2 items-center rounded border">
                <span className="font-bold text-sm text-gray-700 ml-2">{selectedIds.size} Selected</span>
                <Btn green onClick={() => handleBulkAction("ACCEPT")}>Accept Selected</Btn>
                <Btn red onClick={() => handleBulkAction("REJECT")}>Reject Selected</Btn>
             </div>
          )}

          {/* ===== STUDENT TABLE ===== */}
          <div className="bg-white border">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  {/* ✅ SELECT ALL HEADER */}
                  {viewMode === "PENDING" && (
                     <th className="px-3 py-2 w-10">
                        <input type="checkbox" onChange={handleSelectAll} checked={filteredStudents.length > 0 && selectedIds.size === filteredStudents.length} />
                     </th>
                  )}
                  <th className="px-3 py-2 text-left">Student</th>
                  <th className="px-3 py-2">Department</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? <tr><td colSpan="4" className="p-4 text-center">No students found.</td></tr> :
                filteredStudents.map((s) => (
                  <tr key={s.enrollment_id} className={`border-t ${selectedIds.has(s.enrollment_id) ? 'bg-blue-50' : ''}`}>
                    {/* ✅ ROW CHECKBOX */}
                    {viewMode === "PENDING" && (
                      <td className="px-3 py-2">
                        <input type="checkbox" checked={selectedIds.has(s.enrollment_id)} onChange={() => handleSelectOne(s.enrollment_id)} />
                      </td>
                    )}
                    <td className="px-3 py-2">
                      <b>{s.student?.full_name}</b>
                      <div className="text-xs text-gray-600">
                        {s.student?.entry_no || s.student?.email}
                      </div>
                    </td>
                    <td className="px-3 py-2">{s.student?.department}</td>
                    <td className="px-3 py-2 text-right space-x-2">
                      {viewMode === "PENDING" ? (
                        <>
                          <Btn green onClick={() => handleAction(s.enrollment_id, "ACCEPT")}>
                            Accept
                          </Btn>
                          <Btn red onClick={() => handleAction(s.enrollment_id, "REJECT")}>
                            Reject
                          </Btn>
                        </>
                      ) : (
                        <Btn red outline onClick={() => handleAction(s.enrollment_id, "REMOVE")}>
                          Remove
                        </Btn>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* ================= BUTTON ================= */

function Btn({ children, onClick, green, red, outline }) {
  let cls = "px-3 py-1 text-xs border rounded ";

  if (green)
    cls += "bg-green-600 text-white border-green-600 hover:bg-green-700 ";
  if (red && !outline)
    cls += "bg-red-600 text-white border-red-600 hover:bg-red-700 ";
  if (outline && red)
    cls += "text-red-600 border-red-600 hover:bg-red-50 ";

  return (
    <button onClick={onClick} className={cls}>
      {children}
    </button>
  );
}