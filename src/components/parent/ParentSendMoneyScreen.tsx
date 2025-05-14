import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useChildren } from "../../hooks/useChildren";
import { toast } from "react-toastify";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../services/firebase";
import AuthContext from "../../contexts/AuthContext";

export default function ParentSendMoneyScreen() {
  const { user } = useContext(AuthContext);
  const [selectedChild, setSelectedChild] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const navigate = useNavigate();
  const { children, loading } = useChildren();

  useEffect(() => {
    if (children.length > 0) {
      setSelectedChild(children[0].nickname || children[0].phone);
    }
  }, [children]);

  const handleSendMoney = async () => {
    const numericAmount = parseInt(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("유효한 금액을 입력해주세요.");
      return;
    }

    const selected = children.find((child) => child.nickname === selectedChild);

    if (!selected) {
      toast.error("선택된 자녀 정보를 찾을 수 없습니다.");
      return;
    }

    try {
      const userRef = doc(db, "users", user!.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : null;

      if (!userData?.pin) {
        navigate("/set-pin", {
          state: {
            selectedChild,
            amount: numericAmount,
            note,
            childUID: selected.uid,
          },
        });
      } else {
        navigate("/enter-pin", {
          state: {
            selectedChild,
            amount: numericAmount,
            note,
            childUID: selected.uid,
          },
        });
      }
    } catch (err) {
      console.error("PIN번호 확인 중 오류 발생:", err);
      toast.error("정보를 불러오지 못했습니다.");
    }
  };

  const isDisabled = loading || children.length === 0;

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {loading ? (
        <div className="w-full h-[300px] flex items-center justify-center">
          <p className="text-sm text-gray-400">자녀 정보를 불러오는 중입니다...</p>
        </div>
      ) : (
        <div className="w-[360px] bg-white rounded-xl shadow-md p-6">
          <h1 className="text-2xl font-bold text-center text-[#1D3557] mt-4">용돈 충전</h1>

          <div className="mt-10 mb-5">
            <label className="block text-sm font-medium mb-3">자녀 선택</label>
            <select
              value={selectedChild || ""}
              onChange={(e) => setSelectedChild(e.target.value)}
              disabled={isDisabled}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm outline-none disabled:bg-gray-100 disabled:text-gray-400"
            >
              {isDisabled ? (
                <option>자녀를 추가해주세요</option>
              ) : (
                children.map((child) => (
                  <option key={child.phone}>{child.nickname || child.phone}</option>
                ))
              )}
            </select>
          </div>

          <div className="mt-3 mb-5">
            <label className="block text-sm font-medium mb-3">충전 금액</label>
            <input
              type="number"
              placeholder="금액 입력"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isDisabled}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>

          <div className="mt-3">
            <label className="block text-sm font-medium mb-3">메모 (선택)</label>
            <input
              type="text"
              placeholder="ex) 시험 보느라 고생했어!"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isDisabled}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>

          <div className="mt-10">
            <button
              onClick={handleSendMoney}
              disabled={isDisabled}
              className="w-full bg-[#A8DADC] text-white py-3 rounded-xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              용돈 충전하기
            </button>

            <button
              type="button"
              onClick={() => navigate("/change-pin")}
              disabled={isDisabled}
              className="block mx-auto mt-5 underline text-xs text-[#457B9D] hover:opacity-80 transition disabled:text-gray-400"
            >
              🔑 충전 비밀번호 변경
            </button>
          </div>

          <button
            onClick={() => navigate("/parent-home")}
            className="w-full mt-12 bg-gray-100 text-gray-700 py-3 rounded-xl text-sm hover:bg-gray-300 hover:text-black opacity-80 transition"
          >
            돌아가기
          </button>
        </div>
      )}
    </div>
  );
}
