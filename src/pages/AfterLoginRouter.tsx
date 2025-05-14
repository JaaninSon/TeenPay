import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./../hooks/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";

function AfterLoginRouter() {
  const { user, role, loading, roleLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // console.log("AfterLoginRouter - user:", user);
    // console.log("AfterLoginRouter - role:", role);
    // console.log("AfterLoginRouter - loading:", loading);

    if (loading || !roleLoaded) return;

    if (!user) {
      navigate("/");
      return;
    }

    const checkTeenInvite = async () => {
      if (role === "teen") {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          const hasPendingInvite = userData.invitations?.some((i: any) => i.status === "pending");

          if (hasPendingInvite) {
            navigate("/teen-accept-invite");
            return;
          }
        }
        navigate("/teen-home");
      } else if (role === "parent") {
        navigate("/parent-home");
      } else {
        navigate("/select-role");
      }
    };
    checkTeenInvite();
  }, [user, role, loading, roleLoaded, navigate]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100">
      <p className="text-gray-500 text-sm">로그인 정보 확인중...</p>
    </div>
  );
}

export default AfterLoginRouter;
