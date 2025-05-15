import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useChildren } from "../../hooks/useChildren";
import { collection, getDocs, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { db } from "../../services/firebase";
import AuthContext from "../../contexts/AuthContext";

/* test 
const [children, setChildren] = useState([
  { id: 1, nickname: "지훈이", phone: "010-1234-5678" },
  { id: 2, nickname: "유진이", phone: "010-9876-5432" },
]); */

export default function ManageChildren() {
  const { user } = useContext(AuthContext);
  const { children, syncChildren } = useChildren();
  const [newNickname, setNewNickname] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const navigate = useNavigate();

  const handleAddChild = async () => {
    if (!newNickname || !newPhone) {
      toast.error("자녀의 이름과 전화번호를 모두 입력해주세요.");
      return;
    }

    try {
      const userRef = collection(db, "users");
      const snapshot = await getDocs(userRef);
      const matchedChild = snapshot.docs.find((doc) => doc.data().phone === newPhone);

      if (!matchedChild) {
        toast.error("해당 전화번호로 등록된 자녀 계정이 없습니다.");
        return;
      }

      const childUID = matchedChild.id;

      // 자녀 계정에 초대 정보 추가
      await updateDoc(doc(db, "users", childUID), {
        invitations: arrayUnion({
          parentUID: user?.uid,
          nickname: newNickname,
          status: "pending",
        }),
      });

      toast.success("자녀에게 초대장이 전송되었습니다.");
      setNewNickname("");
      setNewPhone("");
    } catch (err) {
      console.error(err);
      toast.error("초대 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteChild = async (phone: string) => {
    if (!confirm("정말 이 자녀를 삭제하시겠습니까?")) return;

    const updated = children.filter((child) => child.phone !== phone);
    await syncChildren(updated);
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-[360px] bg-white rounded-xl shadow-md p-6 ">
        <h1 className="text-2xl font-bold text-center text-[#1D3557] mt-4">자녀 관리</h1>

        <div className="space-y-2 mt-10">
          <h2 className="font-semibold text-sm mb-3">등록된 자녀</h2>
          <ul className="max-h-48 overflow-y-auto space-y-2">
            {children.length === 0 ? (
              <div className="flex items-center justify-center h-20 text-gray-400 text-sm bg-gray-50 rounded-md">
                자녀를 추가해주세요
              </div>
            ) : (
              children.map((child) => (
                <li
                  key={child.phone}
                  className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl text-sm"
                >
                  <div>
                    {child.nickname} ({child.phone})
                  </div>
                  <button
                    onClick={() => handleDeleteChild(child.phone)}
                    className="text-xs text-red-500 font-semibold"
                  >
                    삭제
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="mt-10">
          <h2 className="font-semibold text-sm">자녀 추가</h2>
          <div className="space-y-4 mt-3">
            <input
              type="text"
              placeholder="자녀 이름 (별명)"
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none"
            />
            <input
              type="tel"
              placeholder="전화번호 -없이 입력 (예: 01012345678)"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none"
            />
            <button
              onClick={handleAddChild}
              className="w-full bg-[#457B9D] text-white text-sm py-3 rounded-xl font-semibold"
            >
              자녀 초대하기
            </button>
          </div>
        </div>

        <button
          onClick={() => navigate("/parent-home")}
          className="w-full mt-12 bg-gray-100 text-gray-700 py-3 rounded-xl text-sm hover:bg-gray-300 hover:text-black opacity-80 transition"
        >
          돌아가기
        </button>
      </div>
    </div>
  );
}
