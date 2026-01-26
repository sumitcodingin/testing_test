import { useEffect, useState } from "react";
import api from "../../services/api";

export default function StudentRecords() {
  const [records, setRecords] = useState([]);
  const [sgpa, setSgpa] = useState("0.00");
  const [allRecordsData, setAllRecordsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("current");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [semesterFilter, setSemesterFilter] = useState("ALL");

  const user = JSON.parse(localStorage.getItem("user"));
  const CURRENT_SESSION = "2025-II";

  useEffect(() => {
    if (!user || !user.id) return;

    setLoading(true);
    Promise.all([
      api.get("/student/records", {
        params: { student_id: user.id, session: CURRENT_SESSION },
      }),
      api.get("/student/all-records", {
        params: { student_id: user.id },
      }),
    ])
      .then(([recordsRes, allRes]) => {
        const recordsData = recordsRes.data.records || recordsRes.data;
        setRecords(Array.isArray(recordsData) ? recordsData : []);
        setSgpa(recordsRes.data.sgpa || "0.00");
        setAllRecordsData(allRes.data);
      })
      .catch(() => {
        setRecords([]);
        setSgpa("0.00");
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  const isEarnedGrade = (grade) =>
    grade && !["NP", "NF", "I", "W"].includes(grade);

  const getCredits = (r) => Number(r.courses?.credits || 0);

  const statusText = (status) => {
    switch (status) {
      case "PENDING_INSTRUCTOR_APPROVAL": return "Pending Instructor Approval";
      case "PENDING_ADVISOR_APPROVAL": return "Pending Advisor Approval";
      case "ENROLLED": return "Enrolled";
      case "INSTRUCTOR_REJECTED": return "Rejected (Instructor)";
      case "ADVISOR_REJECTED": return "Rejected (Advisor)";
      case "DROPPED_BY_STUDENT": return "Dropped";
      default: return status;
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case "ENROLLED": return "bg-green-100 text-green-700";
      case "PENDING_INSTRUCTOR_APPROVAL":
      case "PENDING_ADVISOR_APPROVAL": return "bg-yellow-100 text-yellow-700";
      case "INSTRUCTOR_REJECTED":
      case "ADVISOR_REJECTED":
      case "DROPPED_BY_STUDENT": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const filteredRecords = records.filter((r) => {
    if (!r.courses) return false;
    const matchesSearch =
      r.courses.course_code.toLowerCase().includes(search.toLowerCase()) ||
      r.courses.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const registeredCredits = records
    .filter((r) => r.status === "ENROLLED")
    .reduce((sum, r) => sum + getCredits(r), 0);

  const earnedCreditsCurrent = records
    .filter((r) => isEarnedGrade(r.grade))
    .reduce((sum, r) => sum + getCredits(r), 0);

  const cumulativeEarnedCredits = allRecordsData
    ? Object.values(allRecordsData.sessions).reduce((total, s) => {
        return (
          total +
          (s.records || [])
            .filter((r) => isEarnedGrade(r.grade))
            .reduce((sum, r) => sum + getCredits(r), 0)
        );
      }, 0)
    : 0;

  if (!user) return <p className="p-6 text-sm">Loading session...</p>;

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold mb-6 text-gray-800">Academics</h1>

      {/* Tabs */}
      <div className="flex mb-6 overflow-hidden rounded-md border w-fit">
        <button
          onClick={() => { setViewMode("current"); setSearch(""); setStatusFilter("ALL"); }}
          className={`px-4 py-2 text-xs md:text-sm transition-colors ${viewMode === "current" ? "bg-black text-white" : "bg-gray-100"}`}
        >
          Current Semester
        </button>
        <button
          onClick={() => { setViewMode("all"); setSearch(""); setStatusFilter("ALL"); setSemesterFilter("ALL"); }}
          className={`px-4 py-2 text-xs md:text-sm border-l transition-colors ${viewMode === "all" ? "bg-black text-white" : "bg-gray-100"}`}
        >
          All Semesters
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 w-full md:w-64 text-sm outline-none rounded"
        />
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-3 py-2 flex-1 md:flex-none text-sm outline-none bg-white rounded"
          >
            <option value="ALL">Status</option>
            <option value="ENROLLED">Enrolled</option>
            <option value="PENDING_INSTRUCTOR_APPROVAL">Pending Inst.</option>
            <option value="PENDING_ADVISOR_APPROVAL">Pending Adv.</option>
            <option value="DROPPED_BY_STUDENT">Dropped</option>
          </select>
          {viewMode === "all" && allRecordsData && (
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="border px-3 py-2 flex-1 md:flex-none text-sm outline-none bg-white rounded"
            >
              <option value="ALL">All Semesters</option>
              {Object.keys(allRecordsData.sessions).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading records...</p>
      ) : (
        <div className="max-w-full">
          {viewMode === "current" && (
            <>
              {/* Stat Header with CGPA added */}
              <div className="bg-gray-900 text-white px-4 py-3 text-[10px] md:text-sm mb-1 rounded-t flex flex-wrap gap-x-4 gap-y-2">
                <span className="whitespace-nowrap">Session: <b>{CURRENT_SESSION}</b></span>
                <span className="whitespace-nowrap">SGPA: <b>{sgpa}</b></span>
                <span className="whitespace-nowrap text-yellow-400">CGPA: <b>{allRecordsData?.cgpa || "—"}</b></span>
                <span className="whitespace-nowrap">Earned Credits: <b>{earnedCreditsCurrent}</b></span>
                <span className="whitespace-nowrap">Cumulative Earned: <b>{cumulativeEarnedCredits}</b></span>
              </div>

              <table className="w-full text-left border-collapse">
                <thead className="hidden md:table-header-group bg-gray-50 border-b">
                  <tr>
                    <th className="px-3 py-2 font-semibold text-gray-600 w-10">#</th>
                    <th className="px-3 py-2 font-semibold text-gray-600">Course Details</th>
                    <th className="px-3 py-2 font-semibold text-gray-600">Status</th>
                    <th className="px-3 py-2 font-semibold text-gray-600 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((r, i) => (
                    <tr key={r.enrollment_id} className={`flex flex-col md:table-row border-b md:border-none ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                      <td className="hidden md:table-cell px-3 py-4 w-10 text-gray-500">{i + 1}</td>
                      <td className="px-3 pt-4 md:py-4">
                        <div className="flex items-center gap-2">
                          <span className="md:hidden text-gray-400 text-[10px]">#{i+1}</span>
                          <div className="font-bold text-sm md:text-base">{r.courses.course_code}</div>
                        </div>
                        <div className="text-gray-600 text-xs md:text-sm">{r.courses.title}</div>
                      </td>
                      <td className="px-3 py-2 md:py-4">
                        <div className="flex md:contents items-center justify-between">
                          <span className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold rounded ${statusColor(r.status)}`}>
                            {statusText(r.status)}
                          </span>
                          <div className="md:table-cell text-right md:text-center font-bold text-lg md:px-3">
                            <span className="md:hidden text-[10px] font-normal text-gray-400 mr-2 uppercase">Grade:</span>
                            {r.grade || "—"}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {viewMode === "all" && allRecordsData &&
            Object.entries(allRecordsData.sessions)
              .filter(([s]) => semesterFilter === "ALL" || s === semesterFilter)
              .map(([session, data]) => (
                <div key={session} className="mb-10">
                  <div className="bg-gray-900 text-white px-4 py-3 text-[10px] md:text-sm rounded-t flex flex-wrap gap-x-4 gap-y-2">
                    <span className="whitespace-nowrap">Session: <b>{session}</b></span>
                    <span className="whitespace-nowrap">SGPA: <b>{data.sgpa}</b></span>
                    <span className="whitespace-nowrap text-yellow-400">CGPA: <b>{allRecordsData.cgpa}</b></span>
                    <span className="whitespace-nowrap">Earned: <b>{(data.records || []).filter(r => isEarnedGrade(r.grade)).reduce((sum, r) => sum + getCredits(r), 0)}</b></span>
                  </div>
                  <table className="w-full text-left border-collapse">
                    <thead className="hidden md:table-header-group bg-gray-50 border-b">
                      <tr>
                        <th className="px-3 py-2 font-semibold text-gray-600 w-10">#</th>
                        <th className="px-3 py-2 font-semibold text-gray-600">Course Details</th>
                        <th className="px-3 py-2 font-semibold text-gray-600">Status</th>
                        <th className="px-3 py-2 font-semibold text-gray-600 text-center">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.records || []).map((r, i) => (
                        <tr key={r.enrollment_id} className={`flex flex-col md:table-row border-b md:border-none ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                          <td className="hidden md:table-cell px-3 py-4 w-10 text-gray-500">{i + 1}</td>
                          <td className="px-3 pt-4 md:py-4">
                            <div className="flex items-center gap-2">
                              <span className="md:hidden text-gray-400 text-[10px]">#{i+1}</span>
                              <div className="font-bold text-sm md:text-base">{r.courses.course_code}</div>
                            </div>
                            <div className="text-gray-600 text-xs md:text-sm">{r.courses.title}</div>
                          </td>
                          <td className="px-3 py-2 md:py-4">
                            <div className="flex md:contents items-center justify-between">
                              <span className={`inline-block px-2 py-0.5 text-[10px] uppercase font-bold rounded ${statusColor(r.status)}`}>
                                {statusText(r.status)}
                              </span>
                              <div className="md:table-cell text-right md:text-center font-bold text-lg md:px-3">
                                <span className="md:hidden text-[10px] font-normal text-gray-400 mr-2 uppercase">Grade:</span>
                                {r.grade || "—"}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
        </div>
      )}
    </div>
  );
}