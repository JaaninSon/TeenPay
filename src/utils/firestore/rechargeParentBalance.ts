import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

export async function rechargeParentBalance(uid: string) {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    throw new Error("사용자 정보를 찾을 수 없습니다.");
  }

  const data = snapshot.data();
  const currentBalance = data.balance || 0;

  await updateDoc(userRef, {
    balance: currentBalance + 100000,
  });
}
