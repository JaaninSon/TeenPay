import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../services/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

function KakaoRedirectHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");
    console.log("✅ KakaoRedirectHandler 진입");
    console.log("인가코드:", code);

    const alreadyUsed = sessionStorage.getItem("kakao-login-used");
    console.log("sessionStorage flag:", alreadyUsed);

    if (!code || alreadyUsed === "true") {
      console.log("code 없음 또는 중복 요청");
      return;
    }

    sessionStorage.setItem("kakao-login-used", "true");
    fetchToken(code);
  }, []);

  const fetchToken = async (code: string) => {
    try {
      // 엑세스 토큰요청
      const response = await axios.post(
        "https://kauth.kakao.com/oauth/token",
        new URLSearchParams({
          grant_type: "authorization_code",
          client_id: import.meta.env.VITE_KAKAO_REST_API_KEY,
          redirect_uri: import.meta.env.VITE_REDIRECT_URI,
          code,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      const { access_token } = response.data;
      console.log("카카오 액세스토큰:", access_token);

      if (!access_token) {
        alert("카카오 access token 발급 실패");
        return;
      }

      // 이후 firebase 연동, 사용자 정보 가져오기

      const profileRes = await axios.get("https://kapi.kakao.com/v2/user/me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const kakaoUID = profileRes.data.id;
      const kakaoEmail = profileRes.data.kakao_account.email;

      console.log("카카오 UID:", kakaoUID);
      console.log("카카오 이메일:", kakaoEmail);

      if (!kakaoEmail || typeof kakaoEmail !== "string") {
        alert("카카오 계정에서 이메일 제공에 동의해야 로그인할 수 있습니다.");
        return;
      }

      const email = kakaoEmail;
      const password = `kakao-${kakaoUID}`;
      console.log("사용한 비밀번호:", password);

      // Firebase 로그인 or 가입
      try {
        const signupRes = await createUserWithEmailAndPassword(auth, email, password);
        console.log("✅ Firebase 가입 및 로그인 성공", signupRes.user);
        navigate("/after-login"); /* 경로확인 */
      } catch (signupErr: any) {
        console.error("Firebase 가입 실패:", signupErr);
        alert("Firebase 가입 실패: " + signupErr.message);

        if (signupErr.code === "auth/email-already-in-use") {
          try {
            const loginRes = await signInWithEmailAndPassword(auth, email, password);
            console.log("✅ Firebase 로그인 성공", loginRes);
            navigate("/after-login");
          } catch (loginErr: any) {
            console.error("기존 로그인 실패:", loginErr.code, loginErr.message);
            alert("로그인 실패: " + loginErr.message);
          }
        } else {
          alert("가입 실패: " + signupErr.message);
        }
      }
    } catch (err) {
      console.error("카카오 로그인 요청 실패:", err);
      alert("카카오 로그인에 실패했습니다.");
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <p className="text-gray-500 text-sm">카카오 로그인 처리 중...</p>
    </div>
  );
}

export default KakaoRedirectHandler;
