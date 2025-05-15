import { db } from "../../services/firebase";
import { doc, runTransaction } from "firebase/firestore";

export async function transferBalance({
  fromUID,
  toUID,
  amount,
}: {
  fromUID: string;
  toUID: string;
  amount: number;
}): Promise<void> {
  const fromRef = doc(db, "users", fromUID);
  const toRef = doc(db, "users", toUID);

  await runTransaction(db, async (transaction) => {
    const fromSnap = await transaction.get(fromRef);
    const toSnap = await transaction.get(toRef);

    if (!fromSnap.exists() || !toSnap.exists()) {
      throw new Error("계좌 정보를 찾을 수 없습니다.");
    }

    const fromData = fromSnap.data();
    const toData = toSnap.data();

    const fromBalance = fromData.balance || 0;
    const toBalance = toData.balance || 0;

    if (fromBalance < amount) {
      throw new Error("잔액이 부족합니다.");
    }

    transaction.update(fromRef, { balance: fromBalance - amount });
    transaction.update(toRef, { balance: toBalance + amount });

    if (fromData.children) {
      const updatedChildren = fromData.children.map((child: any) =>
        child.uid === toUID ? { ...child, balance: (child.balance || 0) + amount } : child,
      );

      transaction.update(fromRef, { children: updatedChildren });
    }
  });
}
