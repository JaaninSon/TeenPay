import { useEffect, useState, useContext } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import AuthContext from "../contexts/AuthContext";

export function useParentBalance() {
  const { user } = useContext(AuthContext);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // console.log("user.uid:", user.uid);
      // console.log("parentSnap.exists:", userSnap.exists());
      // console.log("parentSnap.data():", userSnap.data());

      if (userSnap.exists()) {
        const userData = userSnap.data();
        setBalance(userData.balance || 0);
      }

      setLoading(false);
    };

    fetchBalance();
  }, [user]);

  return { balance, loading };
}
