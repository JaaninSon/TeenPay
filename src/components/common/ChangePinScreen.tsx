import { useState, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import AuthContext from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ChangePinScreen() {
  const { user, role } = useContext(AuthContext);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [storedPin, setStoredPin] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPin = async () => {
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        setStoredPin(data.pin || "");
      }
    };
    fetchPin();
  }, [user]);

  const handleChange = async () => {
    if (!currentPin || !newPin || !confirmPin) {
      toast.error("모든 항목을 입력해주세요.");
      return;
    }

    if (currentPin !== storedPin) {
      toast.error("현재 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (newPin !== confirmPin) {
      toast.error("새로운 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (newPin.length !== 6 || isNaN(Number(newPin))) {
      toast.error("6자리 숫자를 입력해주세요.");
      return;
    }

    if (newPin === currentPin) {
      toast.error("기존 비밀번호와 동일합니다.");
      return;
    }

    // 실제 처리: 현재 PIN 확인 → Firestore에 새로운 PIN 저장

    try {
      const userRef = doc(db, "users", user!.uid);
      await updateDoc(userRef, { pin: newPin });
      toast.success("비밀번호가 성공적으로 변경되었습니다.");
      role === "parent" ? navigate("/parent-send-money") : navigate("/teen-send-money");
    } catch (err: any) {
      console.error(err.message);
      toast.error("비밀번호 변경 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-[360px] bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-center text-[#1D3557] mt-4">비밀번호 변경</h1>

        <input
          type="password"
          maxLength={6}
          pattern="[0-9]*"
          placeholder="현재 비밀번호 입력"
          value={currentPin}
          onChange={(e) => setCurrentPin(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm mt-10"
        />
        <input
          type="password"
          maxLength={6}
          pattern="[0-9]*"
          placeholder="새로운 비밀번호 입력"
          value={newPin}
          onChange={(e) => setNewPin(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm mt-4"
        />
        <input
          type="password"
          maxLength={6}
          pattern="[0-9]*"
          placeholder="새로운 비밀번호 재확인"
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm mt-4"
        />

        <button
          onClick={handleChange}
          className="w-full py-3 bg-[#A8DADC] text-white font-semibold rounded-xl mt-8"
        >
          변경하기
        </button>
      </div>
    </div>
  );
}
