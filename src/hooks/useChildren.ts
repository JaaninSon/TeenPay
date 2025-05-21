import { useEffect, useState, useContext } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import AuthContext from "../contexts/AuthContext";

export interface Child {
  uid: string;
  nickname: string;
  phone: string;
  balance: number;
}

export function useChildren() {
  const { user } = useContext(AuthContext);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChildren = async () => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);

    if (snapshot.exists()) {
      const data = snapshot.data();
      const childrenInParentDoc = data.children || [];

      const formattedChildren = await Promise.all(
        childrenInParentDoc.map(async (child: any) => {
          const childRef = doc(db, "users", child.uid);
          const childSnap = await getDoc(childRef);

          const balance =
            childSnap.exists() && typeof childSnap.data().balance === "number"
              ? childSnap.data().balance
              : 0;

          return {
            uid: child.uid,
            nickname: child.nickname,
            phone: child.phone,
            balance,
          };
        }),
      );

      setChildren(formattedChildren);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchChildren();
  }, [user]);

  const syncChildren = async (updated: Child[]) => {
    if (!user) return;

    setChildren(updated);
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { children: updated });
  };

  return { children, setChildren, loading, syncChildren, refetchChildren: fetchChildren };
}
