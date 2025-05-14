import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { getPendingInviteInfo } from "./getPendingInviteInfo";

/**
 * 자녀가 부모의 초대를 거절할 때 처리하는 로직
 * - 자녀 invitations[].status = "rejected"
 * @param teenUID 자녀 UID
 * @param parentUID 부모 UID
 */

export async function rejectInvite(teenUID: string, parentUID: string) {
  const info = await getPendingInviteInfo(teenUID);

  if (!info || info.pendingInvite.parentUID !== parentUID) {
    throw new Error("거절 가능한 초대가 없습니다.");
  }

  const { teenData } = info;

  const updateInvitations = teenData.invitations.map((inv: any) =>
    inv.parentUID === parentUID ? { ...inv, status: "rejected", rejectedAt: new Date() } : inv,
  );

  await updateDoc(doc(db, "users", teenUID), {
    invitations: updateInvitations,
  });
}
