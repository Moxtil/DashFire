"use client";
import React, { createContext, useState } from "react";

export const SideContext = createContext();

export default function SidebarContext({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <SideContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SideContext.Provider>
  );
}
