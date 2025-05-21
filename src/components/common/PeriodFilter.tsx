import { useState, useEffect } from "react";
import dayjs from "dayjs";

interface PeriodFilterProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
}

export default function PeriodFilter({ startDate, endDate, onChange }: PeriodFilterProps) {
  const [quick, setQuick] = useState("최근 7일");

  useEffect(() => {
    const today = dayjs();
    let start = "";
    let end = today.format("YYYY-MM-DD");

    switch (quick) {
      case "오늘":
        start = today.format("YYYY-MM-DD");
        break;
      case "어제":
        start = today.subtract(1, "day").format("YYYY-MM-DD");
        break;
      case "최근 7일":
        start = today.subtract(6, "day").format("YYYY-MM-DD");
        break;
      case "이번 달":
        start = today.startOf("month").format("YYYY-MM-DD");
        end = today.endOf("month").format("YYYY-MM-DD");
        break;
    }

    onChange(start, end);
  }, [quick]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 text-xs">
        {["오늘", "어제", "최근 7일", "이번 달"].map((label) => (
          <button
            key={label}
            onClick={() => setQuick(label)}
            className={`px-3 py-1 rounded-full border ${
              quick === label ? "bg-[#A8DADC] text-white" : "border-gray-300 text-gray-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex justify-between gap-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onChange(e.target.value, endDate)}
          className="w-1/2 border border-gray-300 rounded-md px-2 py-1 text-sm"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => onChange(startDate, e.target.value)}
          className="w-1/2 border border-gray-300 rounded-md px-2 py-1 text-sm"
        />
      </div>
    </div>
  );
}
