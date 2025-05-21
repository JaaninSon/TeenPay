import { useMemo } from "react";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import { CATEGORY_MAP } from "./../../utils/categoryMap";

Chart.register(ArcElement, Tooltip, Legend);

interface ExpenseChartProps {
  data: {
    category: string;
    amount: number;
  }[];
}

export default function ExpenseChart({ data }: ExpenseChartProps) {
  // 카테고리별 합산
  const summary = useMemo(() => {
    return data.reduce((acc: Record<string, number>, { category, amount }) => {
      const group = CATEGORY_MAP[category] || category || "기타";
      acc[group] = (acc[group] || 0) + amount;
      return acc;
    }, {});
  }, [data]);

  const labels = Object.keys(summary);
  const values = Object.values(summary);

  console.log("📊 chart input data", data);
  console.log("📊 summary", summary);
  console.log("📊 values", values);

  const COLOR_MAP: Record<string, string> = {
    식비: "#A8DADC",
    "생활/학교": "#457B9D",
    여가: "#E63946",
    비상금: "#F1FAEE",
    기타: "#2A9D8F",
  };

  const backgroundColor = labels.map((label) => COLOR_MAP[label] || "#999999");

  const chartData = {
    labels,
    datasets: [
      {
        label: "지출",
        data: values,
        backgroundColor,
        borderColor: "#fff",
        borderWidth: 1,
      },
    ],
  };

  if (values.length === 0) {
    return (
      <div className="w-full h-[220px] bg-gray-50 rounded-xl shadow-md text-center text-gray-400 text-sm">
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
          표시할 지출 데이터가 없습니다
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl shadow-md p-6 space-y-4">
      <h2 className="text-center text-lg font-bold">카테고리별 지출 차트</h2>
      <div className="w-full flex justify-center">
        <div className="w-60 h-60">
          <Pie data={chartData} />
        </div>
      </div>
    </div>
  );
}
