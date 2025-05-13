import { createContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../services/firebase";

type RoleType = "parent" | "teen" | null;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: RoleType;
  roleLoaded: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: null,
  roleLoaded: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<RoleType>(null);
  const [roleLoaded, setRoleLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setRoleLoaded(false);
      if (firebaseUser) {
        setUser(firebaseUser);
        const userRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          await setDoc(userRef, {
            email: firebaseUser.email ?? "",
            nickname: firebaseUser.displayName ?? "",
            role: null,
            createdAt: serverTimestamp(),
          });
          setRole(null);
        } else {
          const userData = userDoc.data();
          console.log("불러온 role:", userData.role);
          setRole(userData.role ?? null);
        }
        setRoleLoaded(true);
      } else {
        setUser(null);
        setRole(null);
        setRoleLoaded(true);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, role, roleLoaded }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
