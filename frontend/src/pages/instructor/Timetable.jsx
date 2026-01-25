export default function StudentTimetable() {
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const TIMES = [
    "8:00–8:50",
    "9:00–9:50",
    "10:00–10:50",
    "11:00–11:50",
    "12:00–12:50",
    "Lunch",
    "2:00–2:50",
    "3:00–3:50",
    "4:00–4:50",
    "5:00–5:50",
    "6:00–6:50",
  ];

  const TIMETABLE = {
    "Monday-8:00–8:50": "PCE-1",
    "Monday-9:00–9:50": "PC-1",
    "Monday-10:00–10:50": "PC-2",
    "Monday-11:00–11:50": "PC-3",
    "Monday-12:00–12:50": "PC-4",
    "Monday-2:00–2:50": "—",
    "Monday-3:00–3:50": "—",
    "Monday-4:00–4:50": "PCE-1",
    "Monday-5:00–5:50": "PCE-2",
    "Monday-6:00–6:50": "PC-1",

    "Tuesday-8:00–8:50": "PCE-3",
    "Tuesday-9:00–9:50": "PC-1",
    "Tuesday-10:00–10:50": "PC-2",
    "Tuesday-11:00–11:50": "PC-3",
    "Tuesday-12:00–12:50": "HSPE",
    "Tuesday-2:00–2:50": "PCE-1 LAB",
    "Tuesday-3:00–3:50": "PCE-1 LAB",
    "Tuesday-4:00–4:50": "PCE-3",
    "Tuesday-5:00–5:50": "PCE-4",
    "Tuesday-6:00–6:50": "PC-2",

    "Wednesday-8:00–8:50": "PCE-4",
    "Wednesday-9:00–9:50": "PC-1",
    "Wednesday-10:00–10:50": "PC-2",
    "Wednesday-11:00–11:50": "PC-3",
    "Wednesday-12:00–12:50": "PCE-3",
    "Wednesday-2:00–2:50": "PCE-4 LAB",
    "Wednesday-3:00–3:50": "PCE-4 LAB",
    "Wednesday-4:00–4:50": "HSME",
    "Wednesday-5:00–5:50": "PCE-4",
    "Wednesday-6:00–6:50": "PC-3",

    "Thursday-8:00–8:50": "PCE-2",
    "Thursday-9:00–9:50": "PCE-3 LAB",
    "Thursday-10:00–10:50": "PCE-3 LAB",
    "Thursday-11:00–11:50": "PC-4",
    "Thursday-12:00–12:50": "HSPE",
    "Thursday-2:00–2:50": "HSME",
    "Thursday-3:00–3:50": "PCE-1",
    "Thursday-4:00–4:50": "PCE-2",
    "Thursday-5:00–5:50": "PCE-4",
    "Thursday-6:00–6:50": "PC-4",

    "Friday-8:00–8:50": "HSME",
    "Friday-9:00–9:50": "PCE-2 LAB",
    "Friday-10:00–10:50": "PCE-2 LAB",
    "Friday-11:00–11:50": "PC-4",
    "Friday-12:00–12:50": "HSPE",
    "Friday-2:00–2:50": "HSME",
    "Friday-3:00–3:50": "PCE-1",
    "Friday-4:00–4:50": "PCE-2",
    "Friday-5:00–5:50": "PCE-3",
    "Friday-6:00–6:50": "HSPE",
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold">INDIAN INSTITUTE OF TECHNOLOGY ROPAR</h1>
        <h2 className="font-semibold">
          Academic Timetable 2025-II for UG / PG / PhD
        </h2>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded">
        <table className="min-w-full border border-black text-sm">
          <thead>
            <tr className="font-bold text-center">
              <th className="border border-black p-2 text-left">Time</th>
              {DAYS.map(day => (
                <th key={day} className="border border-black p-2">
                  {day}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {TIMES.map(time => (
              <tr key={time}>
                <td className="border border-black p-2 font-semibold">
                  {time}
                </td>

                {DAYS.map(day => (
                  <td
                    key={day + time}
                    className="border border-black p-2 text-center"
                  >
                    {time === "Lunch"
                      ? "Break"
                      : TIMETABLE[`${day}-${time}`] || "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
