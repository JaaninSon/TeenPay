import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AuthContext from "../../contexts/AuthContext";
import { getPendingInviteInfo } from "../../utils/firestore/getPendingInviteInfo";
import { acceptInvite } from "../../utils/firestore/acceptInvite";
import { rejectInvite } from "../../utils/firestore/rejectInvite";

export default function AcceptInviteScreen() {
  const { user } = useContext(AuthContext);
  const [parentName, setParentName] = useState("");
  const [parentUID, setParentUID] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    /* 초대 수락 전, 부모 이름 확인 */
    const fetchInviteInfo = async () => {
      if (!user?.uid) return;

      try {
        const info = await getPendingInviteInfo(user.uid);

        if (!info) {
          navigate("/teen-home");
          return;
        }

        setParentUID(info.parentUID);
        setParentName(info.parentName);
      } catch (err) {
        console.error("초대 정보 조회 실패:", err);
        navigate("/teen-home");
      } finally {
        setLoading(false);
      }
    };

    fetchInviteInfo();
  }, [user, navigate]);

  /* 초대수락 */
  const handleAccept = async () => {
    if (!user?.uid || !parentUID) return;

    try {
      await acceptInvite(user.uid, parentUID);
      toast.success("초대 수락 완료! 부모님과 연결되었습니다.");
    } catch (err) {
      console.error("초대 수락 중 오류:", err);
      toast.error("초대 수락에 실패했습니다. 다시 시도해주세요.");
    } finally {
      navigate("/teen-home");
    }
  };

  /* 초대거절 */
  const handleReject = async () => {
    if (!user?.uid || !parentUID) return;

    try {
      await rejectInvite(user.uid, parentUID);
      toast.info("초대를 거절했습니다.");
    } catch (err) {
      console.error("초대 거절 중 오류:", err);
      toast.error("초대 거절에 실패했습니다.");
    } finally {
      navigate("/teen-home");
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-sm text-gray-500">초대 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-[360px] bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-center text-[#1D3557] mt-4">초대 수락</h1>
        <p className="text-center text-md font-semibold text-[#1D3557] mt-5">
          부모({parentName})님으로부터 초대받았습니다
        </p>
        <p className="text-center text-sm text-gray-600 mt-5">
          초대를 수락하면 부모님과 연결되어
          <br /> 용돈 관리를 시작할 수 있어요.
        </p>

        <button
          onClick={handleAccept}
          className="w-full bg-[#A8DADC] text-white text-sm py-3 rounded-xl font-semibold mt-10"
        >
          초대 수락하기
        </button>

        <button
          onClick={handleReject}
          className="w-full bg-gray-100 text-gray-700 text-sm py-3 rounded-xl text-sm mt-4"
        >
          초대 거절하기
        </button>
      </div>
    </div>
  );
}
