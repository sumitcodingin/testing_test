import { useEffect, useState, useCallback } from "react";
import api from "../../services/api";

export default function AllCourses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState({
    code: "",
    dept: "",
    session: "2025-II",
    title: "",
    instructor: "" 
  });

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [enrollmentList, setEnrollmentList] = useState([]);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);

  const [viewingEnrollmentMeta, setViewingEnrollmentMeta] = useState({
    title: "",
    enrolledCount: 0,
    capacity: 0
  });

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get("/courses/search", { params: search });
      setCourses(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (e) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  const handleShowEnrollments = async (e, course) => {
    e.stopPropagation();
    try {
      const res = await api.get(`/courses/${course.course_id}/public-enrollments`);
      const list = res.data || [];
      const enrolled = list.filter(r => r.status === "ENROLLED").length;

      setEnrollmentList(list);
      setViewingEnrollmentMeta({
        title: course.title,
        enrolledCount: enrolled,
        capacity: course.capacity
      });

      setShowEnrollmentModal(true);
    } catch {
      alert("Failed to fetch enrollment list.");
    }
  };

  const statusClass = (status) => {
    if (status === "ENROLLED") return "text-green-700";
    if (status.includes("PENDING")) return "text-yellow-700";
    return "text-gray-600";
  };

  return (
    <div className="p-4 md:p-0">
      <h2 className="text-xl font-bold mb-6">All Available Courses</h2>

      {/* SEARCH SECTION */}
      <div className="border border-gray-400 p-4 mb-6 bg-white shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input name="code" placeholder="Course Code" className="border px-3 py-2 md:py-1 text-sm rounded-none" value={search.code} onChange={handleChange} />
          <input name="title" placeholder="Course Title" className="border px-3 py-2 md:py-1 text-sm rounded-none" value={search.title} onChange={handleChange} />
          <input name="dept" placeholder="Department" className="border px-3 py-2 md:py-1 text-sm rounded-none" value={search.dept} onChange={handleChange} />
          <input name="instructor" placeholder="Coordinator Name" className="border px-3 py-2 md:py-1 text-sm rounded-none" value={search.instructor} onChange={handleChange} />
          <select name="session" className="border px-3 py-2 md:py-1 text-sm bg-white rounded-none" value={search.session} onChange={handleChange}>
            <option value="2025-II">2025-II</option>
            <option value="2025-I">2025-I</option>
            <option value="2024-II">2024-II</option>
          </select>
        </div>
      </div>

      {/* DATA CONTENT */}
      {courses.length === 0 ? (
        <p className="text-gray-600">No courses found.</p>
      ) : (
        <>
          {/* PC TABLE VIEW: Hidden on Mobile */}
          <div className="hidden md:block overflow-x-auto bg-white border border-gray-400">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b border-gray-400">
                <tr>
                  <th className="px-3 py-2 text-left">Course</th>
                  <th className="px-3 py-2 text-left">Coordinator</th>
                  <th className="px-3 py-2 text-left">Co-Instructors</th>
                  <th className="px-3 py-2 text-left">Department</th>
                  <th className="px-3 py-2 text-left">Session</th>
                  <th className="px-3 py-2 text-left">Enrolled</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr
                    key={c.course_id}
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedCourse(c)}
                  >
                    <td className="px-3 py-2">
                      <p className="font-semibold">{c.title}</p>
                      <p className="text-xs text-gray-500">{c.course_code}</p>
                    </td>
                    <td className="px-3 py-2 font-medium">{c.coordinator?.full_name || "—"}</td>
                    <td className="px-3 py-2 text-gray-600">
                      {c.co_instructor_names?.length > 0 
                        ? c.co_instructor_names.join(", ") 
                        : <span className="text-gray-400 italic">None</span>}
                    </td>
                    <td className="px-3 py-2">{c.department}</td>
                    <td className="px-3 py-2">{c.acad_session}</td>
                    <td className="px-3 py-2">{c.enrolled_count}/{c.capacity}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={(e) => handleShowEnrollments(e, c)}
                        className="border border-black px-3 py-1 text-xs hover:bg-black hover:text-white transition"
                      >
                        View Enrollments
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARD VIEW: Visible only on Mobile */}
          <div className="md:hidden space-y-4">
            {courses.map((c) => (
              <div 
                key={c.course_id} 
                className="bg-white border border-gray-300 p-5 shadow-sm active:bg-gray-50 transition"
                onClick={() => setSelectedCourse(c)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs font-bold text-blue-700 uppercase">{c.course_code}</p>
                    <h3 className="text-lg font-bold leading-tight">{c.title}</h3>
                  </div>
                  <span className="text-xs bg-gray-100 px-2 py-1 border border-gray-300 font-medium">
                    {c.acad_session}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-700 border-t border-gray-100 pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Coordinator:</span>
                    <span className="font-medium text-black">{c.coordinator?.full_name || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dept:</span>
                    <span>{c.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Enrolled:</span>
                    <span className="font-bold">{c.enrolled_count} / {c.capacity}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => handleShowEnrollments(e, c)}
                  className="w-full mt-4 bg-black text-white py-2 text-sm font-bold uppercase tracking-wider"
                >
                  View Enrollment List
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* COURSE DETAILS MODAL */}
      {selectedCourse && (
        <Modal onClose={() => setSelectedCourse(null)} title="Course Details">
          <Detail label="Course" value={`${selectedCourse.course_code} – ${selectedCourse.title}`} />
          <Detail label="Coordinator" value={selectedCourse.coordinator?.full_name || "—"} />
          <Detail 
            label="Co-Instructors" 
            value={selectedCourse.co_instructor_names?.length ? selectedCourse.co_instructor_names.join(", ") : "None"} 
          />
          <Detail label="Department" value={selectedCourse.department} />
          <Detail label="Session" value={selectedCourse.acad_session} />
          <Detail label="Seats" value={`${selectedCourse.enrolled_count}/${selectedCourse.capacity}`} />
        </Modal>
      )}

      {/* ENROLLMENTS MODAL */}
      {showEnrollmentModal && (
        <Modal onClose={() => setShowEnrollmentModal(false)} title="Enrollment List">
          <div className="mb-4 pb-2 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-900">{viewingEnrollmentMeta.title}</p>
            <p className="text-xs text-gray-500">
              Seats: <span className="font-bold text-black">{viewingEnrollmentMeta.enrolledCount} / {viewingEnrollmentMeta.capacity}</span>
            </p>
          </div>

          {enrollmentList.length === 0 ? (
            <p className="text-sm text-gray-600">No enrollments yet.</p>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto">
              <ul className="space-y-2">
                {enrollmentList.map((r, i) => (
                  <li key={i} className="border border-gray-200 p-3 flex justify-between items-center bg-white shadow-sm">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{r.student?.full_name || "—"}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide">{r.student?.department}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 bg-gray-50 border rounded ${statusClass(r.status)}`}>
                      {r.status.replace(/_/g, " ")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

/* ================= HELPERS ================= */

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[999] p-4">
      <div className="bg-white border border-black p-6 w-full max-w-lg relative shadow-2xl">
        <button onClick={onClose} className="absolute top-2 right-4 text-3xl font-light text-gray-500 hover:text-black transition">
          ×
        </button>
        <h3 className="text-lg font-bold mb-5 border-b border-gray-100 pb-2 uppercase tracking-wide">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between border-b border-gray-50 py-3 text-sm">
      <span className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">{label}</span>
      <span className="text-left sm:text-right font-medium text-black mt-1 sm:mt-0">{value}</span>
    </div>
  );
}