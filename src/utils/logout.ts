import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { NavigateFunction } from "react-router-dom";
import { toast } from "react-toastify";

export async function handleLogout(navigate: NavigateFunction) {
  await signOut(auth)
    .then(() => {
      localStorage.clear();
      navigate("/");
      toast.success("로그아웃 되었습니다.");
    })
    .catch((err) => {
      console.error("로그아웃 실패", err);
      toast.error("로그아웃에 실패했습니다.");
    });
}
