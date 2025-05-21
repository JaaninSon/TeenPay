import { useNavigate } from "react-router-dom";
import { useChildren } from "../hooks/useChildren";
import { useParentBalance } from "../hooks/useParentBalance";
import { handleLogout } from "../utils/logout";
import { useEffect } from "react";

export default function ParentHome() {
  const { children, loading, refetchChildren } = useChildren();
  const { balance: parentBalance } = useParentBalance();
  const navigate = useNavigate();

  useEffect(() => {
    refetchChildren();
  }, []);

  if (loading) return <p className="text-center mt-10">로딩중...</p>;

  const isDisabled = children.length === 0;

  /* test */
  console.log("부모 전체잔액 : ", parentBalance);

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-[360px] bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-center text-[#1D3557] mt-4">Parent Home</h1>

        <div className="bg-[#F1FAEE] p-10 rounded-md text-center mt-5">
          <p className="text-sm text-gray-500">전체 잔액</p>
          <p className="text-2xl font-bold text-[#1D3557]">₩ {parentBalance.toLocaleString()}</p>
        </div>

        <div className="mt-8 mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm">자녀별 잔액</h2>
            <button
              type="button"
              onClick={() => navigate("/parent-children-history")}
              disabled={isDisabled}
              className="underline text-xs text-[#457B9D] hover:opacity-80 transition disabled:text-gray-400 disabled:hover:opacity-100"
            >
              지출내역 확인하기
            </button>
          </div>
          <div className="h-[120px] overflow-y-auto rounded-xl bg-gray-50 p-2 transition-all">
            {children.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                자녀를 추가해주세요
              </div>
            ) : (
              <ul className="text-sm text-gray-700 space-y-1 p-2">
                {children.map((child) => (
                  <li key={child.uid}>
                    • {child.nickname} - ₩ {(child.balance || 0).toLocaleString()}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate("/parent-send-money")}
          className="w-full bg-[#A8DADC] text-white text-sm py-3 rounded-xl font-semibold"
        >
          용돈 충전
        </button>

        <button
          onClick={() => navigate("/parent-manage-children")}
          className="w-full bg-[#457B9D] mt-4 text-white text-sm py-3 rounded-xl font-semibold"
        >
          자녀 관리
        </button>

        <button
          onClick={() => {
            handleLogout(navigate);
          }}
          className="w-full mt-12 bg-gray-100 text-gray-700 py-3 rounded-xl text-sm hover:bg-gray-300 hover:text-black opacity-80 transition"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
