import { useState, useEffect, useContext } from "react";
import { db } from "../services/firebase";
import { collection, query, where, orderBy, limit, onSnapshot, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { handleLogout } from "../utils/logout";
import AuthContext from "../contexts/AuthContext";

export default function TeenHome() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);

  const [openMemo, setOpenMemo] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;

    console.log("자녀 UID 확인", user.uid);

    const userRef = doc(db, "users", user.uid);
    const unsubscribeBalance = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setBalance(userData.balance || 0);

        console.log("balance snapshot", docSnap.data());
      }
    });

    const q = query(
      collection(db, "transactions"),
      where("childUID", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(5),
    );

    const unsubscribeTx = onSnapshot(q, (snapshot) => {
      const txList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(txList);
    });

    return () => {
      unsubscribeBalance();
      unsubscribeTx();
    };
  }, [user]);

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-[360px] bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-center text-[#1D3557] mt-4">Teenager Home</h1>

        <div className="bg-[#F1FAEE] p-10 rounded-md text-center mt-5">
          <p className="text-sm text-gray-500">현재 잔액</p>
          <p className="text-2xl font-bold text-[#1D3557]">₩{balance.toLocaleString()}</p>
        </div>

        <button
          onClick={() => navigate("/teen-send-money")}
          className="w-full bg-[#A8DADC] text-white text-sm py-3 rounded-xl font-semibold mt-10"
        >
          송금하기
        </button>

        <div className="space-y-2 my-8">
          <h2 className="font-semibold text-sm">최근 거래 내역</h2>

          <ul className="h-[120px] overflow-y-auto rounded-xl bg-gray-50 p-3 transition-all">
            {transactions.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
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
          onClick={() => navigate("/expense-analytics")}
          className="w-full bg-[#457B9D] mt-4 text-white text-sm py-3 rounded-xl font-semibold"
        >
          전체 지출 내역 보기
        </button>

        <button
          onClick={() => handleLogout(navigate)}
          className="w-full mt-10 bg-gray-100 text-gray-700 py-3 rounded-xl text-sm hover:bg-gray-300 hover:text-black opacity-80 transition"
        >
          로그아웃
        </button>
      </div>

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
