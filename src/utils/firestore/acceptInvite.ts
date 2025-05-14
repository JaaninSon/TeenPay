import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../services/firebase";
import { getPendingInviteInfo } from "./getPendingInviteInfo";

/**
 * 자녀가 부모 초대를 수락했을 때 처리하는 로직
 * - 자녀 invitations[].status = "accepted"
 * - 부모 children[] 배열에 자녀 정보 추가
 * @param teenUID 자녀 UID
 * @param parentUID 부모 UID
 */
export async function acceptInvite(teenUID: string, parentUID: string) {
  const info = await getPendingInviteInfo(teenUID);

  if (!info || info.pendingInvite.parentUID !== parentUID)
    throw new Error("수락할 수 있는 초대가 없습니다.");

  const { teenData, pendingInvite } = info;

  // 자녀 문서: 초대 수락 상태로 업데이트
  const updatedInvitations = teenData.invitations.map((inv: any) =>
    inv.parentUID === parentUID ? { ...inv, status: "accepted", acceptedAt: new Date() } : inv,
  );

  await updateDoc(doc(db, "users", teenUID), {
    invitations: updatedInvitations,
  });

  // 부모 문서: 자녀 정보 등록 (nickname + phone)

  const phoneFormatted =
    typeof teenData.phone === "string" && /^\d{10,11}$/.test(teenData.phone)
      ? teenData.phone.replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3")
      : teenData.phone || "";

  await updateDoc(doc(db, "users", parentUID), {
    children: arrayUnion({
      uid: teenUID,
      nickname: pendingInvite.nickname || teenData.name || "-",
      phone: phoneFormatted,
      balance: pendingInvite.balance || 0,
    }),
  });
}
