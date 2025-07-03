"use client";

import { createContext, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { user, isSignedIn } = useUser();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const syncUser = async () => {
      if (!isSignedIn) {
        setRole(null);
        return;
      }

      const userRef = doc(db, "users", user.id);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        await setDoc(userRef, {
          name: user.fullName || "Unnamed",
          email: user.emailAddresses[0].emailAddress,
          role: "User",
          avatar: user?.imageUrl,
          createdAt: new Date().toISOString(),
        });
        setRole("User");
      } else {
        setRole(docSnap.data().role);
      }
    };

    console.log(user);
    syncUser();
  }, [isSignedIn, user]);

  return (
    <AuthContext.Provider value={{ role }}>{children}</AuthContext.Provider>
  );
};
