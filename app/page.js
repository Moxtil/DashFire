"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaSquareFacebook } from "react-icons/fa6";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import logo from "./assets/Group 250.svg";
import Image from "next/image";
export default function Home() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, isSignedIn, isLoaded]);

  // if (!user) return <div className="loader"></div>;

  return (
    <main className="home flex flex-col items-center justify-center text-center min-h-screen bg-gradient-to-tr from-blue-50 to-white pt-32 px-4">
      <motion.h1
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="text-4xl sm:text-6xl font-extrabold text-[#00b1bb] drop-shadow-md mb-4 flex items-center"
      >
        <Image src={logo} alt="moxtil firedash" width={75} height={50} />{" "}
        Welcome to FireDash
      </motion.h1>

      <motion.p
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.7 }}
        className="text-lg sm:text-xl max-w-xl text-gray-600 mb-8"
      >
        Track your data. Understand your users. Make smarter decisions — all
        from one powerful dashboard.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.7 }}
        className="flex space-x-4"
      >
        <Link
          href="/sign-up"
          className="bg-[#00b1bb] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#277175] transition"
        >
          Get Started
        </Link>
        <Link
          href="/sign-in"
          className="bg-white border border-[#00b1bb] text-[#00b1bb] px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition"
        >
          Sign In
        </Link>
      </motion.div>
    </main>
  );
}
