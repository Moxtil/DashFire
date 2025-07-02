"use client";
import { useContext, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { FiBarChart2, FiUsers } from "react-icons/fi";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import { RxDashboard } from "react-icons/rx";
import { MdDesignServices } from "react-icons/md";

import logo from "../assets/Group 250.svg";
import { SideContext } from "../context/SidebarContext";
import dynamic from "next/dynamic";
export default function Sidebar() {
  const pathname = usePathname();
  const UserButton = dynamic(
    () => import("@clerk/nextjs").then((mod) => mod.UserButton),
    {
      ssr: false,
    }
  );
  const { isOpen, setIsOpen } = useContext(SideContext);
  const links = [
    { href: "/dashboard", label: "Dashboard", icon: <RxDashboard size={24} /> },
    { href: "/analytics", label: "Analytics", icon: <FiBarChart2 size={24} /> },
    { href: "/users", label: "Users", icon: <FiUsers size={24} /> },
    {
      href: "/services",
      label: "Services",
      icon: <MdDesignServices size={24} />,
    },
  ];

  return (
    <aside
      className={`bg-gray-800 text-white min-h-[100vh] fixed bottom-0 top-0 p-5 flex flex-col justify-between transition-[width] duration-300 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Logo & toggle */}
      <div>
        <div className="flex items-center justify-between mb-10">
          {isOpen && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image src={logo} alt="Moxtil FireDash" width={35} height={35} />
              <span className="text-2xl font-bold">FireDash</span>
            </Link>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-400 hover:text-white focus:outline-none cursor-pointer translate-x-2"
            aria-label="Toggle Sidebar"
          >
            {isOpen ? <FaArrowLeft /> : <FaArrowRight />}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex flex-col gap-4">
          {links.map(({ href, label, icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 p-2 rounded transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                {icon}
                {isOpen && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="translate-x-1.5 mt-4">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                userButtonPopoverCard: "shadow-lg border border-gray-200",
                userButtonAvatarBox: "ring-2 ring-yellow-500 w-[50px] h-[50px]",
              },
            }}
          />
        </div>
      </div>
    </aside>
  );
}
