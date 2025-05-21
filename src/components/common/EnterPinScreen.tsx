// PIN번호 입력 후 송금 처리 화면 (EnterPinScreen.tsx)

import { useLocation, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { toast } from "react-toastify";
import AuthContext from "../../contexts/AuthContext";
import { transferBalance } from "../../utils/firestore/transferBalance";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function EnterPinScreen() {
  const { user, role } = useContext(AuthContext);

  const location = useLocation();
  const state = location.state as {
    selectedChild: string;
    amount: number;
    note?: string;
    childUID?: string;
    bank?: string;
    account?: string;
    category?: string;
  };

  const navigate = useNavigate();
  const [pin, setPin] = useState("");

  const handleInput = (digit: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleSubmit = async () => {
    if (pin.length !== 6) {
      toast.error("6자리를 모두 입력해주세요.");
      setPin("");
      return;
    }

    try {
      // PIN 조회
      const userRef = doc(db, "users", user!.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) throw new Error("사용자 정보를 찾을 수 없습니다.");

      const userData = userSnap.data();
      const correctPin = userData?.pin;

      if (pin !== correctPin) {
        toast.error("비밀번호가 일치하지 않습니다.");
        setPin("");
        return;
      }

      const transferParams: any = {
        fromUID: user!.uid,
        amount: state.amount,
        memo: state.note,
        type: role === "parent" ? "deposit" : "withdraw",
        role,
        toUID: role === "parent" ? state.childUID : undefined,
        bank: role === "teen" ? state.bank : undefined,
        account: role === "teen" ? state.account : undefined,
        category: role === "teen" ? state.category : undefined,
      };

      await transferBalance(transferParams);

      toast.success(
        `₩${state.amount.toLocaleString()} ${
          role === "parent"
            ? `를 ${state.selectedChild}에게 충전했습니다!`
            : `이 송금 처리되었습니다!`
        }`,
      );

      navigate(role === "parent" ? "/parent-home" : "/teen-home");
    } catch (err: any) {
      console.error("송금/충전 에러메세지:", err.message);
      toast.error("송금 중 오류가 발생했습니다.");
    } finally {
      setPin("");
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4">
      <div className="w-[360px] bg-white rounded-xl shadow-md p-6">
        <h1 className="text-center text-2xl font-bold mt-4">비밀번호 입력</h1>

        <div className="flex justify-center gap-3 my-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full"
              style={{
                border: "1px solid #888888",
                backgroundColor: pin.length > i ? "#1D3557" : "transparent",
              }}
            ></div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 text-center text-xl font-bold text-[#1D3557]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, "←", 0, "✓"].map((key) => (
            <button
              key={key}
              onClick={() => {
                if (key === "←") handleDelete();
                else if (key === "✓") handleSubmit();
                else handleInput(key.toString());
              }}
              className="bg-[#F1FAEE] rounded-full py-3"
            >
              {key}
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate(-1)}
          className="w-full mt-12 bg-gray-100 text-gray-700 py-3 rounded-xl text-sm hover:bg-gray-300 hover:text-black opacity-80 transition"
        >
          돌아가기
        </button>
      </div>
    </div>
  );
}
