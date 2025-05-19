import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../services/firebase";
import AuthContext from "../../contexts/AuthContext";
import { toast } from "react-toastify";

function TeenSendMoneyScreen() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [bank, setBank] = useState("");
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendMoney = async () => {
    const numericAmount = parseInt(amount);
    if (!bank || !account || isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("유효한 금액을 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      const userRef = doc(db, "users", user!.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : null;

      if (!userData?.pin) {
        navigate("/set-pin", {
          state: {
            bank,
            account,
            amount: numericAmount,
            note,
          },
        });
      } else {
        navigate("/enter-pin", {
          state: {
            bank,
            account,
            amount: numericAmount,
            note,
          },
        });
      }
    } catch (err) {
      console.error("PIN번호 확인 중 오류 발생:", err);
      toast.error("정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {loading ? (
        <div className="w-full h-[300px] flex items-center justify-center">
          <p className="text-sm text-gray-400">송금 화면을 불러오는 중입니다...</p>
        </div>
      ) : (
        <div className="w-[360px] bg-white rounded-xl shadow-md p-6">
          <h1 className="text-2xl font-bold text-center text-[#1D3557] mt-4">송금하기</h1>

          <div className="mt-10 mb-5">
            <label className="block text-sm font-medium mb-3">은행</label>
            <input
              type="text"
              placeholder="은행명 입력('은행명'만 입력, 예: 신한, 국민)"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none"
            />
          </div>

          <div className="mt-3 mb-5">
            <label className="block text-sm font-medium mb-3">계좌번호</label>
            <input
              type="text"
              placeholder="계좌번호 입력"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none"
            />
          </div>

          <div className="mt-3 mb-5">
            <label className="block text-sm font-medium mb-3">송금 금액</label>
            <input
              type="number"
              placeholder="금액 입력"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none"
            />
          </div>

          <div className="mt-3">
            <label className="block text-sm font-medium mb-3">메모 (선택)</label>
            <input
              type="text"
              placeholder="메모 입력"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none"
            />
          </div>

          <div className="mt-10">
            <button
              onClick={handleSendMoney}
              className="w-full bg-[#A8DADC] text-white py-3 rounded-xl font-semibold"
            >
              송금하기
            </button>

            <button
              type="button"
              onClick={() => navigate("/change-pin")}
              className="block mx-auto mt-5 underline text-xs text-[#457B9D] hover:opacity-80 transition"
            >
              🔑 송금 비밀번호 변경
            </button>
          </div>

          <button
            onClick={() => navigate("/teen-home")}
            className="w-full mt-12 bg-gray-100 text-gray-700 py-3 rounded-xl text-sm hover:bg-gray-300 hover:text-black opacity-80 transition"
          >
            돌아가기
          </button>
        </div>
      )}
    </div>
  );
}

export default TeenSendMoneyScreen;
