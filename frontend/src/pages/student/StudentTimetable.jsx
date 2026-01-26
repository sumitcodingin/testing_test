import { useEffect, useState } from "react";
import api from "../../services/api";

export default function StudentTimetable() {
  const [enrolled, setEnrolled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("personal");

  const user = JSON.parse(localStorage.getItem("user"));
  const CURRENT_SESSION = "2025-II";

  const TIMES = [
    { label: "8:00-8:50", value: "8:00-8:50", isTutorial: true },
    { label: "9:00-9:50", value: "9:00-9:50" },
    { label: "10:00-10:50", value: "10:00-10:50" },
    { label: "11:00-11:50", value: "11:00-11:50" },
    { label: "12:00-12:50", value: "12:00-12:50" },
    { label: "Lunch Break", value: "lunch" },
    { label: "2:00-2:50", value: "2:00-2:50" },
    { label: "3:00-3:50", value: "3:00-3:50" },
    { label: "4:00-4:50", value: "4:00-4:50" },
    { label: "5:00-5:50", value: "5:00-5:50" },
    { label: "6:00-6:50", value: "6:00-6:50", isTutorial: true },
  ];

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const GENERIC_TIMETABLE = {
    "Monday-8:00-8:50": "PCE-1",
    "Monday-9:00-9:50": "PC-1",
    "Monday-10:00-10:50": "PC-2",
    "Monday-11:00-11:50": "PC-3",
    "Monday-12:00-12:50": "PC-4",
    "Monday-2:00-2:50": "—",
    "Monday-3:00-3:50": "—",
    "Monday-4:00-4:50": "PCE-1",
    "Monday-5:00-5:50": "PCE-2",
    "Monday-6:00-6:50": "PC-1",

    "Tuesday-8:00-8:50": "PCE-3",
    "Tuesday-9:00-9:50": "PC-1",
    "Tuesday-10:10-10:50": "PC-2",
    "Tuesday-11:00-11:50": "PC-3",
    "Tuesday-12:00-12:50": "HSPE",
    "Tuesday-2:00-2:50": "PCE-1 LAB",
    "Tuesday-3:00-3:50": "PCE-1 LAB",
    "Tuesday-4:00-4:50": "PCE-3",
    "Tuesday-5:00-5:50": "PCE-4",
    "Tuesday-6:00-6:50": "PC-2",

    "Wednesday-8:00-8:50": "PCE-4",
    "Wednesday-9:00-9:50": "PC-1",
    "Wednesday-10:00-10:50": "PC-2",
    "Wednesday-11:00-11:50": "PC-3",
    "Wednesday-12:00-12:50": "PCE-3",
    "Wednesday-2:00-2:50": "PCE-4 LAB",
    "Wednesday-3:00-3:50": "PCE-4 LAB",
    "Wednesday-4:00-4:50": "HSME",
    "Wednesday-5:00-5:50": "PCE-4",
    "Wednesday-6:00-6:50": "PC-3",

    "Thursday-8:00-8:50": "PCE-2",
    "Thursday-9:00-9:50": "PCE-3 LAB",
    "Thursday-10:00-10:50": "PCE-3 LAB",
    "Thursday-11:00-11:50": "PC-4",
    "Thursday-12:00-12:50": "HSPE",
    "Thursday-2:00-2:50": "HSME",
    "Thursday-3:00-3:50": "PCE-1",
    "Thursday-4:00-4:50": "PCE-2",
    "Thursday-5:00-5:50": "PCE-4",
    "Thursday-6:00-6:50": "PC-4",

    "Friday-8:00-8:50": "HSME",
    "Friday-9:00-9:50": "PCE-2 LAB",
    "Friday-10:00-10:50": "PCE-2 LAB",
    "Friday-11:00-11:50": "PC-4",
    "Friday-12:00-12:50": "HSPE",
    "Friday-2:00-2:50": "HSME",
    "Friday-3:00-3:50": "PCE-1",
    "Friday-4:00-4:50": "PCE-2",
    "Friday-5:00-5:50": "PCE-3",
    "Friday-6:00-6:50": "HSPE",
  };

  useEffect(() => {
    if (!user || !user.id) {
      setLoading(false);
      setError("Session expired. Please login again.");
      return;
    }

    setLoading(true);
    api
      .get("/student/records", {
        params: { student_id: user.id, session: CURRENT_SESSION },
      })
      .then((res) => {
        const records = res.data?.records || [];
        setEnrolled(records.filter(r => r.status === "ENROLLED"));
        setError(null);
      })
      .catch(() => {
        setError("Failed to load timetable");
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  const getStudentCourseAtSlot = (day, time) => {
    if (time === "lunch") return null;
    const expected = GENERIC_TIMETABLE[`${day}-${time}`];
    return enrolled.find(r => {
      const slot = r.courses?.slot;
      return slot && expected && slot.split(" ")[0] === expected.split(" ")[0];
    });
  };

  if (loading) {
    return <div className="p-6 md:p-10 text-gray-500 text-center">Loading academic records...</div>;
  }

  if (error) {
    return <div className="p-6 md:p-10 text-red-600 font-bold text-center">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-3 md:p-6">
      <div className="mb-6 text-center">
        <h1 className="text-lg md:text-xl font-bold uppercase">Indian Institute of Technology Ropar</h1>
        <h2 className="text-sm md:text-base font-semibold text-gray-700">
          Academic Timetable {CURRENT_SESSION}
        </h2>
      </div>

      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-white border rounded shadow-sm overflow-hidden">
          <button
            onClick={() => setViewMode("personal")}
            className={`px-4 py-2 text-xs md:text-sm font-semibold transition-colors ${
              viewMode === "personal" ? "bg-gray-800 text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            My Timetable
          </button>
          <button
            onClick={() => setViewMode("generic")}
            className={`px-4 py-2 text-xs md:text-sm font-semibold border-l transition-colors ${
              viewMode === "generic" ? "bg-gray-800 text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            General Template
          </button>
        </div>
      </div>

      {/* Helper text for mobile users */}
      <p className="md:hidden text-center text-[10px] text-gray-400 mb-2">← Swipe horizontally to view full days →</p>

      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-[11px] md:text-sm">
            <thead>
              <tr className="bg-gray-50 font-bold text-center">
                <th className="sticky left-0 z-10 bg-gray-50 border border-gray-300 p-2 md:p-3 text-left shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  Timings
                </th>
                {DAYS.map(day => (
                  <th key={day} className="border border-gray-300 p-2 md:p-3 min-w-[100px] md:min-w-0">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIMES.map(t => (
                <tr key={t.value} className={t.value === "lunch" ? "bg-blue-50/50" : "hover:bg-gray-50 transition-colors"}>
                  <td className="sticky left-0 z-10 bg-white border border-gray-300 p-2 md:p-3 font-semibold shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    <span className="block">{t.label}</span>
                    {t.isTutorial && <span className="text-[9px] md:text-[10px] text-indigo-600 uppercase">Tut</span>}
                  </td>
                  {DAYS.map(day => {
                    const course = getStudentCourseAtSlot(day, t.value);
                    const generic = GENERIC_TIMETABLE[`${day}-${t.value}`];
                    
                    return (
                      <td key={day + t.value} className={`border border-gray-300 p-2 md:p-3 text-center ${t.value === "lunch" ? "italic text-gray-400" : ""}`}>
                        {t.value === "lunch" ? (
                          "Break"
                        ) : viewMode === "personal" ? (
                          course ? (
                            <div className="font-bold text-blue-700">
                              {course.courses.course_code}
                            </div>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )
                        ) : (
                          <span className={generic && generic !== "—" ? "font-medium" : "text-gray-300"}>
                            {generic || "—"}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-[10px] md:text-xs text-gray-500 text-center italic">
        * Tut denotes Tutorial Slots. PC: Program Core, PCE: Program Core Elective, HSPE/HSME: Humanities/Management Electives.
      </div>
    </div>
  );
}