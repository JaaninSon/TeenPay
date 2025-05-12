import { useEffect, useState, useContext } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import AuthContext from "../contexts/AuthContext";

export interface Child {
  uid: string;
  nickname: string;
  phone: string;
  balance?: number;
}

export function useChildren() {
  const { user } = useContext(AuthContext);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchChildren = async () => {
      const userRef = doc(db, "users", user.uid);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        setChildren(data.children || []);
      }

      setLoading(false);
    };

    fetchChildren();
  }, [user]);

  const syncChildren = async (updated: Child[]) => {
    if (!user) return;

    setChildren(updated);
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { children: updated });
  };

  return { children, setChildren, loading, syncChildren };
}
