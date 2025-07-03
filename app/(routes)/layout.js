"use client";
import { useContext, useEffect } from "react";
import { SideContext } from "../context/SidebarContext";
import Navbar from "../main_components/Navbar";
import { Outfit } from "next/font/google";
// import { saveUserToDB } from "../context/SaveUsersToDB";
import { useUser } from "@clerk/nextjs";
const outfit = Outfit({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export default function Layout({ children }) {
  const { isOpen } = useContext(SideContext);
  // const { user } = useUser();

  // useEffect(() => {
  //   if (user) {
  //     saveUserToDB(user);
  //   }
  // }, [user]);
  return (
    <div className={`${outfit.className} flex min-h-screen`}>
      <div className="fixed top-0 left-0 h-screen z-50">
        <Navbar />
      </div>{" "}
      <main
        className={`${
          isOpen ? "ml-20" : "ml-20"
        } w-full p-6 bg-gray-100 min-h-screen`}
      >
        {children}
      </main>{" "}
    </div>
  );
}
