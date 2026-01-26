import { useEffect, useState } from "react";
import api from "../../services/api";
import { Mail, Video, Calendar, CheckSquare, Square, Clock, ChevronRight, User } from "lucide-react";

export default function MyStudents() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [courses, setCourses] = useState([]);

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);

  /* ============ SELECTION STATE ============ */
  const [selectedEmails, setSelectedEmails] = useState([]);

  /* ============ MODAL STATES ============ */
  const [showMail, setShowMail] = useState(false);
  const [mailData, setMailData] = useState({
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    message: "",
  });

  const [showMeet, setShowMeet] = useState(false);
  
  const [meetData, setMeetData] = useState({
    date: "",
    startHour: "10",
    startMinute: "00",
    startPeriod: "AM",
    endHour: "11",
    endMinute: "00",
    endPeriod: "AM",
    topic: "",
    link: "",
    description: ""
  });

  /* ================= FETCH STUDENTS ================= */

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/advisor/all-students", {
        params: { advisor_id: user.id },
      });
      setStudents(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDetails = async (student) => {
    try {
      const res = await api.get("/advisor/student-details", {
        params: {
          advisor_id: user.id,
          student_id: student.user_id,
        },
      });

      setSelectedStudent(res.data.student);
      setCourses(res.data.courses || []);
    } catch {
      setCourses([]);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  /* ================= FILTER ================= */

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      (!search ||
        s.full_name.toLowerCase().includes(q) ||
        s.entry_no?.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)) &&
      (!department || s.department === department)
    );
  });

  const departments = [
    ...new Set(students.map((s) => s.department).filter(Boolean)),
  ];

  /* ================= SELECTION LOGIC ================= */

  const toggleSelectAll = () => {
    if (selectedEmails.length === filtered.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(filtered.map(s => s.email));
    }
  };

  const toggleStudent = (email) => {
    if (selectedEmails.includes(email)) {
      setSelectedEmails(selectedEmails.filter(e => e !== email));
    } else {
      setSelectedEmails([...selectedEmails, email]);
    }
  };

  /* ================= ACTIONS ================= */

  const sendMail = async () => {
    try {
      await api.post("/advisor/send-student-email", {
        advisor_id: user.id,
        to: mailData.to,
        cc: mailData.cc.split(",").filter(Boolean),
        bcc: mailData.bcc.split(",").filter(Boolean),
        subject: mailData.subject,
        message: mailData.message,
      });

      alert("Mail sent successfully");
      setShowMail(false);
    } catch (error) {
      alert("Failed to send mail");
    }
  };

  const scheduleMeeting = async () => {
    if (!meetData.date || !meetData.topic) {
      alert("Please fill in Date and Topic");
      return;
    }

    const startTime = `${meetData.startHour}:${meetData.startMinute} ${meetData.startPeriod}`;
    const endTime = `${meetData.endHour}:${meetData.endMinute} ${meetData.endPeriod}`;
    const targets = selectedEmails.length > 0 ? selectedEmails : [];
    
    if (targets.length === 0) {
      alert("Please select at least one student to schedule a meeting.");
      return;
    }

    try {
      await api.post("/advisor/schedule-meeting", {
        advisor_id: user.id,
        student_emails: targets,
        date: meetData.date,
        start_time: startTime,
        end_time: endTime,
        topic: meetData.topic,
        meet_link: meetData.link || "https://meet.google.com/new",
        description: meetData.description
      });

      alert("Meeting scheduled! Invites sent.");
      setShowMeet(false);
      setSelectedEmails([]); 
    } catch (error) {
      console.error(error);
      alert("Failed to schedule meeting.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-0">

      {/* ================= LIST VIEW ================= */}
      {!selectedStudent && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold">My Students</h2>
            
            <button
              onClick={() => {
                if(selectedEmails.length === 0) {
                    alert("Select students from the list first!");
                    return;
                }
                setShowMeet(true);
              }}
              className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2 text-sm font-semibold hover:bg-blue-700 transition"
            >
              <Video size={16} />
              Organize a Meet ({selectedEmails.length})
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <input
              placeholder="Search name / entry no / email"
              className="border rounded px-4 py-2 text-sm w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="border rounded px-4 py-2 text-sm w-full bg-white"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            
            <button 
              onClick={toggleSelectAll}
              className="md:hidden border rounded px-4 py-2 text-sm font-semibold bg-gray-50 flex items-center justify-between"
            >
              {selectedEmails.length === filtered.length ? "Deselect All" : "Select All Visible"}
              {selectedEmails.length === filtered.length ? <CheckSquare size={16} className="text-blue-600"/> : <Square size={16}/>}
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : (
            <>
              {/* DESKTOP TABLE VIEW (Hidden on Mobile) */}
              <div className="hidden md:block bg-white border rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-3 w-10">
                          <button onClick={toggleSelectAll} className="text-gray-600 hover:text-black">
                              {filtered.length > 0 && selectedEmails.length === filtered.length ? (
                                  <CheckSquare size={18} className="text-blue-600"/>
                              ) : (
                                  <Square size={18}/>
                              )}
                          </button>
                      </th>
                      <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-xs text-gray-500">Student</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-gray-500">Entry No</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-gray-500">Department</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs text-gray-500">Email</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s) => {
                      const isSelected = selectedEmails.includes(s.email);
                      return (
                        <tr key={s.user_id} className={`border-t transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                          <td className="px-4 py-3 text-center">
                              <button onClick={() => toggleStudent(s.email)} className="text-gray-500 hover:text-blue-600">
                                  {isSelected ? <CheckSquare size={18} className="text-blue-600"/> : <Square size={18}/>}
                              </button>
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900">{s.full_name}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{s.entry_no || "—"}</td>
                          <td className="px-4 py-3 text-center text-gray-600">{s.department}</td>
                          <td className="px-4 py-3 text-center text-gray-500 text-xs font-mono">{s.email}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => {
                                  setMailData({ ...mailData, to: s.email });
                                  setShowMail(true);
                                }}
                                className="border p-2 rounded hover:bg-gray-200 transition"
                                title="Send Mail"
                              >
                                <Mail size={14} />
                              </button>
                              <button
                                onClick={() => fetchStudentDetails(s)}
                                className="bg-gray-900 text-white px-3 py-1 text-xs rounded hover:bg-black transition"
                              >
                                View Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARD VIEW (Hidden on Desktop) */}
              <div className="md:hidden space-y-3">
                {filtered.map((s) => {
                  const isSelected = selectedEmails.includes(s.email);
                  return (
                    <div 
                      key={s.user_id} 
                      className={`p-4 rounded-lg border-2 transition-all shadow-sm ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div onClick={() => toggleStudent(s.email)} className="flex gap-3 cursor-pointer">
                          <div className="mt-1">
                            {isSelected ? <CheckSquare size={20} className="text-blue-600"/> : <Square size={20} className="text-gray-400"/>}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{s.full_name}</p>
                            <p className="text-xs text-gray-500 font-mono">{s.entry_no || "No Entry No."}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => fetchStudentDetails(s)}
                          className="text-blue-600 bg-blue-50 p-2 rounded-full"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100">
                        <div className="text-[10px] uppercase font-bold text-gray-400">Department</div>
                        <div className="text-[10px] uppercase font-bold text-gray-400 text-right">Email</div>
                        <div className="text-sm font-medium">{s.department}</div>
                        <div className="text-xs text-right overflow-hidden text-ellipsis">{s.email}</div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button 
                          onClick={() => {
                            setMailData({ ...mailData, to: s.email });
                            setShowMail(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 bg-gray-100 py-2 rounded text-xs font-bold"
                        >
                          <Mail size={14} /> Mail
                        </button>
                        <button 
                           onClick={() => fetchStudentDetails(s)}
                           className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-2 rounded text-xs font-bold"
                        >
                          Profile
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* ================= STUDENT DETAIL VIEW ================= */}
      {selectedStudent && (
        <div className="animate-in fade-in duration-300">
          <button
            onClick={() => {
              setSelectedStudent(null);
              setCourses([]);
            }}
            className="flex items-center gap-1 text-blue-600 text-sm font-bold mb-6 hover:underline"
          >
            ← Back to Student List
          </button>

          <div className="bg-white border-2 border-black p-6 sm:p-10 mb-6 shadow-lg">
            <h1 className="text-center text-xl md:text-2xl font-black mb-1 tracking-tighter uppercase">
              Indian Institute of Technology Ropar
            </h1>
            <p className="text-center text-gray-500 font-bold text-xs mb-8 tracking-widest uppercase">
              Official Student Academic Record
            </p>

            <h3 className="font-black text-sm mb-4 bg-gray-100 inline-block px-2 py-1">I. PERSONAL DETAILS</h3>

            <div className="overflow-hidden border border-gray-200">
              <table className="w-full text-sm">
                <tbody>
                  <Row label="Full Name" value={selectedStudent.full_name} />
                  <Row label="Entry Number" value={selectedStudent.entry_no || "—"} />
                  <Row label="Department" value={selectedStudent.department} />
                  <Row label="Email" value={selectedStudent.email} />
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border-2 border-black p-6 shadow-lg">
            <h3 className="font-black text-sm mb-4 bg-gray-100 inline-block px-2 py-1 uppercase">II. COURSE REGISTRATION</h3>

            <div className="overflow-x-auto md:overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b-2 border-black">
                  <tr>
                    <th className="px-3 py-3 text-left font-black uppercase text-[10px]">Code</th>
                    <th className="px-3 py-3 text-left font-black uppercase text-[10px]">Course Title</th>
                    <th className="px-3 py-3 font-black uppercase text-[10px]">Status</th>
                    <th className="px-3 py-3 font-black uppercase text-[10px]">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-gray-400 italic">
                        No academic records found for this student.
                      </td>
                    </tr>
                  ) : (
                    courses.map((c, i) => (
                      <tr key={i} className="border-t border-gray-100 hover:bg-gray-50 transition">
                        <td className="px-3 py-3 font-bold text-blue-700">{c.course.course_code}</td>
                        <td className="px-3 py-3 font-medium text-gray-800">{c.course.title}</td>
                        <td className="px-3 py-3 text-center">
                          <Status status={c.status} />
                        </td>
                        <td className="px-3 py-3 text-center font-black">{c.grade || "—"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= MAIL MODAL ================= */}
      {showMail && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-none border-2 border-black w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2">
                <h3 className="font-black uppercase tracking-tight text-lg">New Email Message</h3>
                <button onClick={() => setShowMail(false)} className="text-2xl">&times;</button>
            </div>

            <Input label="To" value={mailData.to} disabled />
            <Input label="CC" value={mailData.cc} onChange={(v) => setMailData({ ...mailData, cc: v })} placeholder="Separated by commas"/>
            <Input label="BCC" value={mailData.bcc} onChange={(v) => setMailData({ ...mailData, bcc: v })} />
            <Input label="Subject" value={mailData.subject} onChange={(v) => setMailData({ ...mailData, subject: v })} />

            <textarea
              rows={5}
              placeholder="Write your message here..."
              className="border-2 border-gray-200 rounded-none w-full px-3 py-2 text-sm mb-6 focus:border-black outline-none transition"
              value={mailData.message}
              onChange={(e) => setMailData({ ...mailData, message: e.target.value })}
            />

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowMail(false)} className="font-bold text-sm px-6 py-2 border-2 border-black hover:bg-gray-100">
                DISCARD
              </button>
              <button onClick={sendMail} className="font-bold text-sm px-6 py-2 bg-black text-white hover:bg-gray-800 transition shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                SEND MAIL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MEET SCHEDULER MODAL ================= */}
      {showMeet && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white border-2 border-black w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 mb-6 border-b-2 border-black pb-2 text-blue-700">
                <Video size={24} strokeWidth={3} />
                <h3 className="font-black uppercase tracking-tight text-lg">Schedule Meeting</h3>
            </div>
            
            <div className="bg-blue-50 p-3 border border-blue-200 mb-6">
                <p className="text-xs text-blue-800 font-bold uppercase tracking-widest">Recipients</p>
                <p className="text-sm font-medium">{selectedEmails.length} Students Selected</p>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-4">
                <Input type="date" label="Meeting Date" value={meetData.date} onChange={(v) => setMeetData({...meetData, date: v})} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="text-[10px] text-gray-500 font-black uppercase mb-1 block">Start Time</label>
                    <div className="flex gap-1">
                        <select className="border-2 border-gray-200 rounded-none p-2 text-xs w-full focus:border-black" value={meetData.startHour} onChange={(e) => setMeetData({...meetData, startHour: e.target.value})}>
                            {[...Array(12)].map((_, i) => <option key={i} value={String(i+1).padStart(2,'0')}>{String(i+1).padStart(2,'0')}</option>)}
                        </select>
                        <select className="border-2 border-gray-200 rounded-none p-2 text-xs w-full focus:border-black" value={meetData.startMinute} onChange={(e) => setMeetData({...meetData, startMinute: e.target.value})}>
                            {["00", "15", "30", "45"].map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select className="border-2 border-gray-200 rounded-none p-2 text-xs font-bold focus:border-black" value={meetData.startPeriod} onChange={(e) => setMeetData({...meetData, startPeriod: e.target.value})}>
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="text-[10px] text-gray-500 font-black uppercase mb-1 block">End Time</label>
                    <div className="flex gap-1">
                        <select className="border-2 border-gray-200 rounded-none p-2 text-xs w-full focus:border-black" value={meetData.endHour} onChange={(e) => setMeetData({...meetData, endHour: e.target.value})}>
                            {[...Array(12)].map((_, i) => <option key={i} value={String(i+1).padStart(2,'0')}>{String(i+1).padStart(2,'0')}</option>)}
                        </select>
                        <select className="border-2 border-gray-200 rounded-none p-2 text-xs w-full focus:border-black" value={meetData.endMinute} onChange={(e) => setMeetData({...meetData, endMinute: e.target.value})}>
                            {["00", "15", "30", "45"].map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select className="border-2 border-gray-200 rounded-none p-2 text-xs font-bold focus:border-black" value={meetData.endPeriod} onChange={(e) => setMeetData({...meetData, endPeriod: e.target.value})}>
                            <option value="AM">AM</option>
                            <option value="PM">PM</option>
                        </select>
                    </div>
                </div>
            </div>

            <Input 
                label="Meeting Topic" 
                value={meetData.topic} 
                onChange={(v) => setMeetData({...meetData, topic: v})} 
                placeholder="Brief title for the meet"
            />

            <Input 
                label="Google Meet URL" 
                value={meetData.link} 
                onChange={(v) => setMeetData({...meetData, link: v})} 
                placeholder="Paste link or leave for default"
            />

            <textarea
              rows={3}
              placeholder="Agenda / Meeting Notes"
              className="border-2 border-gray-200 rounded-none w-full px-3 py-2 text-sm mb-6 focus:border-black outline-none transition"
              value={meetData.description}
              onChange={(e) => setMeetData({ ...meetData, description: e.target.value })}
            />

            <div className="flex justify-end gap-3 pt-4 border-t-2 border-gray-100">
              <button onClick={() => setShowMeet(false)} className="font-bold text-sm px-6 py-2 border-2 border-black hover:bg-gray-50 uppercase tracking-widest">
                Cancel
              </button>
              <button onClick={scheduleMeeting} className="font-bold text-sm px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(37,99,235,0.3)]">
                <Calendar size={16} />
                CONFIRM MEET
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* ================= HELPERS ================= */

function Row({ label, value }) {
  return (
    <tr className="border-t border-gray-100">
      <td className="bg-gray-50 px-4 py-3 font-bold text-[10px] uppercase text-gray-400 w-1/3 border-r border-gray-100">{label}</td>
      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{value}</td>
    </tr>
  );
}

function Status({ status }) {
  let cls = "px-2 py-1 text-[10px] font-black uppercase tracking-tighter border-2 ";
  if (status === "ENROLLED") cls += "bg-green-50 text-green-700 border-green-200";
  else if (status?.includes("PENDING")) cls += "bg-yellow-50 text-yellow-700 border-yellow-200";
  else if (status?.includes("REJECTED") || status?.includes("DROPPED"))
    cls += "bg-red-50 text-red-700 border-red-200";
  else cls += "bg-gray-50 text-gray-700 border-gray-200";

  return <span className={cls}>{status.replace(/_/g, " ")}</span>;
}

function Input({ label, value, onChange, disabled, type = "text", placeholder }) {
  return (
    <div className="mb-4">
      <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1 block">{label}</label>
      <input
        type={type}
        className="border-2 border-gray-200 rounded-none w-full px-3 py-2 text-sm focus:border-black outline-none transition disabled:bg-gray-100 disabled:text-gray-500"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}