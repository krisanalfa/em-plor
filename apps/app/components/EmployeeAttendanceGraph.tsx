import { DeepPartial } from "@apollo/client/utilities";
import { IEmployeeAttendance } from "@em-plor/contracts";
import { useMemo } from "react";

interface EmployeeAttendanceGraphProps {
  attendances: DeepPartial<IEmployeeAttendance>[];
}

interface DayData {
  date: Date;
  hasValidAttendance: boolean;
}

export default function EmployeeAttendanceGraph({
  attendances,
}: EmployeeAttendanceGraphProps) {
  const weeks = useMemo(() => {
    // Process attendances into a map of dates with valid check-in and check-out
    const attendanceMap = new Map<string, DayData>();

    attendances.forEach((attendance) => {
      if (
        !attendance.date ||
        !attendance.checkInTime ||
        !attendance.checkOutTime
      ) {
        return;
      }

      const checkInDate = new Date(attendance.checkInTime);
      const checkOutDate = new Date(attendance.checkOutTime);
      const attendanceDate = new Date(attendance.date);

      // Check if check-in and check-out are on the same date as the attendance date
      const isSameDay =
        checkInDate.toISOString().split("T")[0] ===
          attendanceDate.toISOString().split("T")[0] &&
        checkOutDate.toISOString().split("T")[0] ===
          attendanceDate.toISOString().split("T")[0];

      if (isSameDay) {
        const dateKey = attendanceDate.toISOString().split("T")[0];
        attendanceMap.set(dateKey, {
          date: attendanceDate,
          hasValidAttendance: true,
        });
      }
    });

    // Build weeks grid
    const weeksData: DayData[][] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 364);

    // Align to start on Sunday
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    for (let week = 0; week < 53; week++) {
      const weekData: DayData[] = [];

      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + week * 7 + day);

        const dateKey = currentDate.toISOString().split("T")[0];
        const attendance = attendanceMap.get(dateKey);

        weekData.push(
          attendance || {
            date: currentDate,
            hasValidAttendance: false,
          },
        );
      }

      weeksData.push(weekData);
    }

    return weeksData;
  }, [attendances]);

  const today = useMemo(() => new Date(), []);

  // Get color class based on valid attendance
  const getColorClass = (hasValidAttendance: boolean): string => {
    return hasValidAttendance
      ? "bg-cyan-600 dark:bg-cyan-500"
      : "bg-gray-100 dark:bg-gray-800";
  };

  const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="w-full overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="flex gap-1">
          {/* Day labels */}
          <div className="flex flex-col gap-1 pr-2">
            <div className="h-4"></div>
            {dayLabels.map((label, i) => (
              <div
                key={label}
                className="h-3 text-xs text-gray-500 dark:text-gray-400"
                style={{ lineHeight: "12px" }}
              >
                {i % 2 === 1 ? label : ""}
              </div>
            ))}
          </div>

          {/* Graph */}
          <div className="flex-1">
            {/* Month labels */}
            <div className="flex gap-1 mb-1">
              {weeks.map((week, weekIndex) => {
                const firstDay = week[0].date;
                const month = firstDay.getMonth();
                const isFirstWeekOfMonth =
                  firstDay.getDate() <= 7 ||
                  (weekIndex > 0 &&
                    weeks[weekIndex - 1][0].date.getMonth() !== month);

                return (
                  <div key={weekIndex} className="w-3">
                    {isFirstWeekOfMonth && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {monthLabels[month]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Grid */}
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => {
                    const isToday =
                      day.date.toISOString().split("T")[0] ===
                      today.toISOString().split("T")[0];

                    return (
                      <div
                        key={dayIndex}
                        className={`w-3 h-3 rounded-sm ${getColorClass(day.hasValidAttendance)} ${
                          isToday ? "ring-2 ring-blue-500" : ""
                        } hover:ring-2 hover:ring-gray-400 transition-all cursor-pointer`}
                        title={`${day.date.toLocaleDateString()}: ${
                          day.hasValidAttendance
                            ? "Valid attendance"
                            : "No attendance"
                        }`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
