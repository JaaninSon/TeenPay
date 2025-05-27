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
  category?: string;
};

export async function transferBalance(params: TransferParams): Promise<void> {
  const fromRef = doc(db, "users", params.fromUID);
  let fromData: any = null;
  let toData: any = null;
  let toRef: any = null;
  let toSnap: any = null;

  await runTransaction(db, async (transaction) => {
    const fromSnap = await transaction.get(fromRef);

    if (!fromSnap.exists()) throw new Error("계좌 정보를 찾을 수 없습니다.");
    fromData = fromSnap.data();
    console.log("fromData.name:", fromData?.name);

    // 잔액 체크
    const fromBalance = fromData.balance || 0;
    if (fromBalance < params.amount) throw new Error("잔액이 부족합니다.");

    // 부모 -> 자녀 충전
    if (params.type === "deposit" && params.toUID) {
      toRef = doc(db, "users", params.toUID);
      toSnap = await transaction.get(toRef);

      if (!toSnap.exists()) throw new Error("자녀 계좌 정보를 찾을 수 없습니다.");

      toData = toSnap.data();

      const toBalance = toData.balance || 0;
      transaction.update(toRef, { balance: toBalance + params.amount });

      const updates: any = { balance: fromBalance - params.amount };

      if (fromData.children) {
        const updatedChildren = fromData.children.map((child: any) =>
          child.uid === params.toUID
            ? { ...child, balance: (child.balance || 0) + params.amount }
            : child,
        );
        updates.children = updatedChildren;
      }
      transaction.update(fromRef, updates);
    }

    if (params.type === "withdraw") {
      transaction.update(fromRef, {
        balance: fromBalance - params.amount,
      });
    }
  });

  // parentName, Firestore에서 다시 불러오기
  let parentName = "-";
  if (params.type === "deposit") {
    const parentSnap = await getDoc(doc(db, "users", params.fromUID));
    if (parentSnap.exists()) {
      const parentData = parentSnap.data();
      parentName =
        (parentData.name && parentData.name.trim()) ||
        (parentData.phone && parentData.phone.replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3")) ||
        "-";
    }
  }

  if (params.type === "deposit" && params.toUID) {
    await addDoc(collection(db, "transactions"), {
      type: params.type,
      amount: params.amount,
      childUID: params.toUID,
      parentUID: params.fromUID,
      parentName,
      memo: params.memo || "",
      createdAt: serverTimestamp(),
    });
  } else if (params.type === "withdraw") {
    await addDoc(collection(db, "transactions"), {
      type: params.type,
      amount: params.amount,
      childUID: params.fromUID,
      bank: params.bank,
      account: params.account,
      memo: params.memo || "",
      createdAt: serverTimestamp(),
      category: params.category || "기타",
    });
  }
}
