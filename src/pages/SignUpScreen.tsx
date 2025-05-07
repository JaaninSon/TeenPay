import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import CustomInput from "../components/common/CustomInput";
import RoleToggle from "../components/common/RoleToggle";

export default function SignUpScreen() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"teen" | "parent">("teen");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email,
        nickname,
        role,
      });

      alert("회원가입이 완료되었습니다.");
      navigate("/");
    } catch (error: any) {
      alert("회원가입 실패: " + error.message);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSignUp}
        className="w-[360px] max-h-[90vh] bg-white rounded-xl shadow-md p-6 space-y-4"
      >
        <div className="h-1 mt-2" />
        <h1 className="text-2xl font-bold text-center text-[#1D3557]">TEENPAY</h1>
        <div className="h-1" />

        <CustomInput
          type="text"
          placeholder="닉네임을 입력해주세요."
          value={nickname}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNickname(e.target.value)}
        />
        <CustomInput
          type="email"
          placeholder="이메일을 입력해주세요."
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        />
        <CustomInput
          type="password"
          placeholder="비밀번호를 입력해주세요."
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        />
        <CustomInput
          type="password"
          placeholder="비밀번호를 다시 한 번 입력해주세요."
          value={confirmPassword}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
        />

        <div className="h-1" />

        <RoleToggle selectedRole={role} onSelectRole={setRole} />

        <div className="h-1" />

        <button
          type="submit"
          className="w-full py-3 bg-[#A8DADC] text-white font-semibold rounded-md"
        >
          회원가입
        </button>

        <div className="text-xs text-center text-gray-400">
          <button onClick={() => navigate("/")} className="underline">
            로그인으로 돌아가기
          </button>
        </div>
        <div className="h-1" />
      </form>
    </div>
  );
}
