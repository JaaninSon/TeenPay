import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./../hooks/useAuth";

function AfterLoginRouter() {
  const { user, role, loading, roleLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("AfterLoginRouter - user:", user);
    console.log("AfterLoginRouter - role:", role);
    console.log("AfterLoginRouter - loading:", loading);

    if (loading || !roleLoaded) return;

    if (!user) {
      navigate("/");
      return;
    }

    if (role === "parent") {
      navigate("/parent-home");
    } else if (role === "teen") {
      navigate("/teen-home");
    } else {
      navigate("/select-role");
    }
  }, [user, role, loading, roleLoaded, navigate]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
      <p className="text-gray-500 text-sm">로그인 정보 확인중...</p>
    </div>
  );
}

export default AfterLoginRouter;
