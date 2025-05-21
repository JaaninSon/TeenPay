import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChildren } from "../../hooks/useChildren";
import { db } from "../../services/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default function ChildHistoryScreen() {
  const [selectedChild, setSelectedChild] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const navigate = useNavigate();
  const { children, loading } = useChildren();
  const [openMemo, setOpenMemo] = useState<string | null>(null);

  useEffect(() => {
    if (children.length > 0) {
      setSelectedChild(children[0]?.phone);
    }
  }, [children]);

  type Transaction = {
    id: string;
    childUID: string;
    amount: number;
    tpye: "deposit" | "withdraw";
    parentName?: string;
    bank?: string;
    account?: string;
    memo?: string;
    createdAt?: any;
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      const selected = children.find((child) => child.phone === selectedChild);
      console.log("ChildHistoryScreen 선택된 자녀:", selected);

      if (!selected) return;

      try {
        const snapshot = await getDocs(
          query(collection(db, "transactions"), orderBy("createdAt", "desc")),
        );

        const txList: Transaction[] = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() }) as Transaction,
        );

        const filtered = txList.filter((tx) => tx.childUID === selected.uid);
        setTransactions(filtered.slice(0, 8));

        console.log("ChildHistoryScreen 불러온 거래내역:", txList);
      } catch (err) {
        console.error("ChildHistoryScreen 거래내역 불러오기 실패:", err);
      }
    };

    if (selectedChild && children.length > 0) {
      fetchTransactions();
    }
  }, [selectedChild, children]);

  const isDisabled = loading || children.length === 0;
  const selected = children.find((c) => c.phone === selectedChild); // 버튼 클릭시 선택된 자녀 uid 전달용

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {loading ? (
        <div className="w-full h-[300px] flex items-center justify-center">
          <p className="text-sm text-gray-400">자녀 정보를 불러오는 중입니다...</p>
        </div>
      ) : (
        <div className="w-[360px] bg-white rounded-xl shadow-md p-6">
          <h1 className="text-2xl font-bold text-center text-[#1D3557] mt-4">자녀 지출내역</h1>

          <div className="mt-10 mb-5">
            <label className="block text-sm font-medium mb-3">자녀 선택</label>
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              disabled={isDisabled}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm outline-none disabled:bg-gray-100 disabled:text-gray-400"
            >
              {isDisabled ? (
                <option>자녀를 추가해주세요</option>
              ) : (
                children.map((child) => (
                  <option key={child.phone} value={child.phone}>
                    {child.nickname || child.phone}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="my-5">
            <button
              onClick={() =>
                navigate("/expense-analytics", {
                  state: { childUID: selected?.uid },
                })
              }
              className="w-full bg-[#457B9D] mt-4 text-white text-sm py-3 rounded-xl font-semibold"
            >
              전체 지출 내역 보기
            </button>
          </div>

          <div className="space-y-2 my-8">
            <h2 className="font-semibold text-sm">최근 거래 내역</h2>

            <ul className="h-[200px] overflow-y-auto rounded-xl bg-gray-50 p-3 transition-all">
              {transactions.length === 0 ? (
                <div className="h-[120px] flex items-center justify-center h-full text-gray-400 text-sm">
                  최근 거래 내역이 없습니다.
                </div>
              ) : (
                transactions.map((tx) => (
                  <li key={tx.id} className="text-sm my-1">
                    •{" "}
                    {tx.type === "deposit" ? (
                      <>
                        부모({tx.parentName || "-"})님이 ₩{tx.amount.toLocaleString()} 충전
                        {tx.memo && (
                          <span
                            title={tx.memo}
                            className="ml-1 text-gray-500 max-w-[75px] inline-block truncate align-middle cursor-pointer hover:underline"
                            onClick={() => setOpenMemo(tx.memo)}
                          >
                            - {tx.memo}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        {tx.bank || "-"}은행({tx.account || "계좌번호"})으로 ₩
                        {tx.amount.toLocaleString()} 송금{" "}
                        {tx.memo && (
                          <span
                            title={tx.memo}
                            className="ml-1 text-gray-500 max-w-[75px] inline-block truncate align-middle cursor-pointer hover:underline"
                            onClick={() => setOpenMemo(tx.memo)}
                          >
                            - {tx.memo}
                          </span>
                        )}
                      </>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>

          <button
            onClick={() => navigate("/parent-home")}
            className="w-full mt-12 bg-gray-100 text-gray-700 py-3 rounded-xl text-sm hover:bg-gray-300 hover:text-black opacity-80 transition"
          >
            돌아가기
          </button>
        </div>
      )}

      {openMemo && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white w-[300px] rounded-xl p-5 shadow-lg text-sm relative">
            <p className="font-semibold text-[#1D3557] mb-2">메모 전체 보기</p>
            <p className="text-gray-700 whitespace-pre-wrap">{openMemo}</p>
            <button
              onClick={() => setOpenMemo(null)}
              className="absolute top-2 right-3 text-gray-500 hover:text-black text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
