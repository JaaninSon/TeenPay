import { db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";

/**
 * 자녀의 pending 초대 정보 조회 -> 부모 이름을 반환
 * @param teenUID 자녀 UID
 * @returns { parentUID, parentName, pendingInvite, teenData }
 */

export async function getPendingInviteInfo(teenUID: string) {
  const teenRef = doc(db, "users", teenUID);
  const teenSnap = await getDoc(teenRef);

  if (!teenSnap.exists()) throw new Error("자녀 문서를 찾을 수 없습니다.");

  const teenData = teenSnap.data();
  const pendingInvites = teenData.invitations?.filter((i: any) => i.status === "pending");

  if (!pendingInvites || pendingInvites.length === 0) return null;

  const invite = pendingInvites[0];

  const parentUID = invite.parentUID;
  const parentRef = doc(db, "users", parentUID);
  const parentSnap = await getDoc(parentRef);
  const parentData = parentSnap.exists() ? parentSnap.data() : {};

  const parentName =
    parentData.name?.trim() ||
    parentData.phone.replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3") ||
    "-";

  return {
    parentUID,
    parentName,
    pendingInvite: invite,
    teenData,
  };
}
