import { db } from "../../services/firebase";
import {
  doc,
  runTransaction,
  serverTimestamp,
  addDoc,
  getDoc,
  collection,
} from "firebase/firestore";

type TransferParams = {
  fromUID: string;
  toUID?: string; // 부모용 자녀 충전 시
  amount: number;
  memo?: string;
  type: "deposit" | "withdraw";
  role: "parent" | "teen";
  bank?: string; // 자녀용 송금 시 은행명
  account?: string; // 자녀용 송금 시 계좌번호
};

export async function transferBalance({
  fromUID,
  toUID,
  amount,
  memo,
  type,
  role,
  bank,
  account,
}: TransferParams): Promise<void> {
  const fromRef = doc(db, "users", fromUID);
  let fromData: any = null;
  let toData: any = null;
  let toRef: any = null;
  let toSnap: any = null;

  await runTransaction(db, async (transaction) => {
    const fromSnap = await transaction.get(fromRef);

    if (!fromSnap.exists()) throw new Error("계좌 정보를 찾을 수 없습니다.");
    const fromData = fromSnap.data();
    console.log("🔥 fromData.name:", fromData?.name);

    // 잔액 체크
    const fromBalance = fromData.balance || 0;
    if (fromBalance < amount) throw new Error("잔액이 부족합니다.");

    // 부모 -> 자녀 충전
    if (type === "deposit" && toUID) {
      const toRef = doc(db, "users", toUID);
      const toSnap = await transaction.get(toRef);

      if (!toSnap.exists()) throw new Error("자녀 계좌 정보를 찾을 수 없습니다.");

      const toData = toSnap.data();

      const toBalance = toData.balance || 0;
      transaction.update(toRef, { balance: toBalance + amount });

      const updates: any = { balance: fromBalance - amount };

      if (fromData.children) {
        const updatedChildren = fromData.children.map((child: any) =>
          child.uid === toUID ? { ...child, balance: (child.balance || 0) + amount } : child,
        );
        updates.children = updatedChildren;
      }
      transaction.update(fromRef, updates);
    }
  });

  // parentName, Firestore에서 다시 불러오기
  let parentName = "-";
  if (type === "deposit") {
    const parentSnap = await getDoc(doc(db, "users", fromUID));
    if (parentSnap.exists()) {
      const parentData = parentSnap.data();
      parentName =
        (parentData.name && parentData.name.trim()) ||
        (parentData.phone && parentData.phone.replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3")) ||
        "-";
    }
  }

  if (type === "deposit" && toUID) {
    await addDoc(collection(db, "transactions"), {
      type,
      amount,
      childUID: toUID,
      parentUID: fromUID,
      parentName,
      memo: memo || "",
      createdAt: serverTimestamp(),
    });
  } else if (type === "withdraw") {
    await addDoc(collection(db, "transactions"), {
      type,
      amount,
      childUID: fromUID,
      bank,
      account,
      memo: memo || "",
      createdAt: serverTimestamp(),
    });
  }
}
