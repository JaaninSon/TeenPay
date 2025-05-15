// PIN 최초 설정 화면 (SetPinNumberScreen.tsx)

import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import AuthContext from "../../contexts/AuthContext";
import { toast } from "react-toastify";

export default function SetPinNumberScreen() {
  const { user, role } = useContext(AuthContext);
  const navigate = useNavigate();
  const { state } = useLocation();

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
      toast.error("6자리 비밀번호를 설정해주세요.");
      return;
    }

    try {
      const userRef = doc(db, "users", user!.uid);
      const snapshot = await getDoc(userRef);
      const alreadyHasBalance = snapshot.exists() && snapshot.data().balance !== undefined;

      await updateDoc(userRef, {
        pin,
        ...(alreadyHasBalance ? {} : { balance: role === "parent" ? 100000 : 0 }),
      });

      toast.success("비밀번호가 설정되었습니다.");
      navigate("/enter-pin", { state });
    } catch (err: any) {
      console.error(err.message);
      toast.error("비밀번호 저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6">
      <div className="w-[360px] bg-white rounded-xl shadow-md p-6">
        <h1 className="text-center text-2xl font-bold mt-4">비밀번호 설정</h1>
        <p className="text-sm text-center text-gray-500 mt-3">
          송금 시 사용할 6자리 비밀번호를 입력해주세요
        </p>

        <div className="flex justify-center gap-4 my-10">
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
          onClick={() =>
            role === "parent" ? navigate("/parent-send-money") : navigate("/teen-send-money")
          }
          className="w-full mt-12 bg-gray-100 text-gray-700 py-3 rounded-xl text-sm hover:bg-gray-300 hover:text-black opacity-80 transition"
        >
          돌아가기
        </button>
      </div>
    </div>
  );
}
