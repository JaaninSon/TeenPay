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

      const formattedChildren = (data.children || []).map((child: any) => ({
        uid: child.uid,
        nickname: child.nickname,
        phone: child.phone,
        balance: child.balance || 0,
      }));

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
