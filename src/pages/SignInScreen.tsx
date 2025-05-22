import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import CustomInput from "../components/common/CustomInput";
import { toast } from "react-toastify";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // 실제로는 Firebase 로그인 처리
    // alert("로그인 시도됨 (역할: ${role}, Firebase Auth 연결 예정)");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential;

      console.log("로그인 성공", user);
      navigate("/after-login");
    } catch (error: any) {
      toast.error("로그인 실패 : " + error.message);
      console.error("로그인 실패", error);
    }
  };

  const handleKakaoLogin = async () => {
    const Kakao = (window as any)?.Kakao;

    if (!Kakao) {
      toast.error("Kakao SDK 가 아직 로드되지 않았습니다.");
      return;
    }

    const KakaoKey = import.meta.env.VITE_KAKAO_JS_KEY;

    if (!Kakao.isInitialized()) {
      Kakao.init(KakaoKey);
      console.log("✅ Kakao SDK 초기화 완료");
    }

    Kakao.Auth?.authorize({
      redirectUri: import.meta.env.VITE_REDIRECT_URI,
      scope: "profile_nickname, account_email",
    });
  };

  return (
    <div className="w-[360px] max-h-[90vh] bg-white rounded-xl shadow-md p-6">
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 rounded-full border">
          <img className="object-cover" src="/images/teenpay_icon.png" />
        </div>
        <h1 className="text-2xl font-bold text-center text-[#1D3557] mt-5">TEENPAY</h1>
      </div>

      <form onSubmit={handleLogin} className="mt-10 space-y-5">
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
        <button
          type="submit"
          className="w-full py-3 bg-[#A8DADC] text-white font-semibold rounded-xl"
        >
          로그인
        </button>
      </form>

      <button
        type="button"
        onClick={handleKakaoLogin}
        className="w-full h-12 py-3 bg-kakao text-[#3C1E1E] font-semibold text-sm rounded-xl flex justify-center items-center mt-5"
      >
        <img src="/images/kakao.svg" className="w-5 h-5" alt="kakao" />
        <span className="pl-3">카카오계정으로 로그인</span>
      </button>

      <div className="text-xs text-center text-gray-500 space-y-1">
        <button
          onClick={() => navigate("/reset-password")}
          className="text-[#457B9D] underline mt-5"
        >
          비밀번호를 잊으셨나요?
        </button>
        <div>
          계정이 없으신가요?&nbsp;
          <button onClick={() => navigate("/signup")} className="text-[#457B9D] underline">
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}
