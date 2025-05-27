import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();

  const handleReset = async () => {
    if (!email) {
      setError("이메일을 입력해주세요.");
      setSuccess("");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess("비밀번호 재설정 링크가 이메일로 전송되었습니다.");
      setError("");
    } catch (err: any) {
      console.error(err);
      setError("이메일 전송에 실패했습니다. 올바른 이메일인지 확인해주세요.");
      setSuccess("");
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-[360px] bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-center text-[#1D3557] my-4">비밀번호 재설정</h1>
        <p className="text-sm text-center text-gray-500 my-5">
          가입 시 사용한 이메일 주소를 입력하면
          <br /> 재설정 링크를 보내드립니다.
        </p>

        <input
          type="email"
          placeholder="이메일을 입력하세요"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm my-4 outline-none"
        />

        {error && <p className="text-sm text-red-500 text-center mb-2">{error}</p>}
        {success && <p className="text-sm text-green-500 text-center mb-2">{success}</p>}

        <button
          onClick={handleReset}
          className="w-full py-3 bg-[#A8DADC] text-white font-semibold rounded-xl mt-2"
        >
          재설정 링크 전송
        </button>

        <div className="text-xs text-center text-gray-400 my-6">
          <button onClick={() => navigate("/")} className="underline">
            로그인으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
