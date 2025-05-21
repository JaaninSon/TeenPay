// 지출분석 화면

import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";
import AuthContext from "../../contexts/AuthContext";
import PeriodFilter from "./PeriodFilter";
import ExpenseChart from "./ExpenseChart";
import dayjs from "dayjs";
import { CATEGORY_MAP } from "../../utils/categoryMap";

/* const expenses = [
    { id: 1, category: "식비", amount: 12000 },
    { id: 2, category: "여가", amount: 5000 },
    { id: 3, category: "비상금", amount: 3000 },
    { id: 4, category: "생활/학교", amount: 7000 },
    { id: 5, category: "식비", amount: 8000 },
  ]; */

export default function ExpenseAnalyticsScreen() {
  const { user, role } = useContext(AuthContext);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState("전체");
  const navigate = useNavigate();
  const location = useLocation();

  const passedChildUID = location.state?.childUID;
  const targetUID = role === "teen" ? user?.uid : passedChildUID;

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "transactions"),
      where("childUID", "==", targetUID),
      where("type", "==", "withdraw"),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTransactions(data);
    });

    return () => unsubscribe();
  }, [targetUID]);

  const categorized = transactions.map((tx) => ({
    ...tx,
    category: CATEGORY_MAP[tx.category] || "기타",
    amount: Number(tx.amount),
    createdAt: tx.createdAt?.toDate?.() || new Date(),
  }));

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filtered = categorized.filter((tx) => {
    const inCategory = selectedType === "전체" ? true : tx.category === selectedType;

    const inPeriod =
      startDate && endDate
        ? tx.createdAt >= new Date(startDate) &&
          tx.createdAt < dayjs(endDate).add(1, "day").startOf("day").toDate()
        : true;

    return inCategory && inPeriod;
  });

  console.log("filtered:", filtered);

  const total = filtered.reduce((sum, tx) => sum + tx.amount, 0);

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  if (role === "parent" && !passedChildUID) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-sm text-gray-500">
        자녀 정보가 전달되지 않았습니다.
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-[360px] bg-white rounded-xl shadow-md p-6 space-y-5">
        <h1 className="text-center text-2xl font-bold text-[#1D3557] mt-4">지출 분석</h1>

        <div className="space-y-2 mt-10">
          <PeriodFilter startDate={startDate} endDate={endDate} onChange={handleDateChange} />

          <select
            className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option>전체</option>
            <option>식비</option>
            <option>생활/학교</option>
            <option>여가</option>
            <option>비상금</option>
            <option>기타</option>
          </select>
        </div>

        <div className="text-center text-sm text-gray-700">
          총 지출: <span className="font-bold text-[#1D3557]">₩{total.toLocaleString()}</span>
        </div>

        <ExpenseChart data={filtered} />

        <ul className="text-sm text-gray-700 space-y-1 overflow-y-auto max-h-20">
          {filtered.map((tx) => (
            <li key={tx.id}>
              • {tx.category} - ₩{tx.amount.toLocaleString()}
            </li>
          ))}
        </ul>

        <button
          onClick={() => navigate(role === "parent" ? "/parent-home" : "/teen-home")}
          className="w-full mt-12 bg-gray-100 text-gray-700 py-3 rounded-xl text-sm hover:bg-gray-300 hover:text-black opacity-80 transition"
        >
          돌아가기
        </button>
      </div>
    </div>
  );
}
