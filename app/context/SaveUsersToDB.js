import { db } from "../firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const saveUserToDB = async (user) => {
  const userRef = doc(db, "users", user?.id);

  const docSnap = await getDoc(userRef);
  if (!docSnap.exists()) {
    await setDoc(userRef, {
      name: user.fullName || "Unnamed",
      email: user.emailAddresses[0]?.emailAddress || "",
      role: "User",
      createdAt: new Date().toISOString(),
    });
    console.log("✅ User saved to Firestore");
  } else {
    console.log("🟡 User already exists");
  }
};
