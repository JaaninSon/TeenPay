import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../services/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import AuthContext from "../contexts/AuthContext";

function SelectRolePage() {
  const { user } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"parent" | "teen" | "">("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!name || !phone || !role) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    if (!user) {
      alert("인증되지 않은 사용자입니다.");
      return;
    }

    try {
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name,
        phone,
        role,
        createdAt: serverTimestamp(),
      });

      navigate(role === "parent" ? "/parent-home" : "/teen-home");
    } catch (error) {
      console.error("사용자 정보 저장 실패:", error);
      alert("사용자 정보를 저장하는 데 실패했습니다.");
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-[360px] bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-center text-[#1D3557] mt-4">추가 정보 입력</h1>

        <input
          type="text"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-10 mb-3 w-full px-4 py-2 border rounded-xl"
        />

        <input
          type="tel"
          placeholder="전화번호"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="my-3 w-full px-4 py-2 border rounded-xl"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value as "parent" | "teen")}
          className="my-3 w-full px-4 py-2 border rounded-xl"
        >
          <option value="">역할 선택</option>
          <option value="parent">부모</option>
          <option value="teen">자녀</option>
        </select>

        <button
          onClick={handleSubmit}
          className="w-full my-4 bg-[#457B9D] text-white py-3 rounded-xl font-semibold"
        >
          시작하기
        </button>
      </div>
    </div>
  );
}

export default SelectRolePage;
