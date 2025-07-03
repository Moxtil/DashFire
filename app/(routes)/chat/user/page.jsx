"use client";
import { useEffect, useRef, useState, useContext } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../firebase/config";
import { useUser } from "@clerk/nextjs";
import { IoSend } from "react-icons/io5";
import { AuthContext } from "../../../context/RoleContext";
import { RiCustomerService2Line } from "react-icons/ri";

export default function UserChatPage() {
  const { user } = useUser();
  const { role } = useContext(AuthContext);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  const userEmail = user?.emailAddresses[0]?.emailAddress;

  useEffect(() => {
    if (!userEmail) return;

    const q = query(
      collection(db, "chats", userEmail, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [userEmail]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    await addDoc(collection(db, "chats", userEmail, "messages"), {
      sender: "User",
      text: message.trim(),
      timestamp: serverTimestamp(),
    });

    setMessage("");
  };

  if (role !== "User") {
    return (
      <div className="pt-24 flex flex-col items-center justify-center gap-2 p-6 text-center text-red-500">
        <span> You are not authorized to access this page.</span>
        {!user && (
          <span className="mt-2 text-gray-600 font-semibold mx-3">
            Sign In Or Up to have chat ability.
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 pt-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold flex items-center justify-center gap-2 flex-wrap mb-6 text-center text-[#00b1bb]">
        <RiCustomerService2Line /> Chat With Admin
      </h1>

      <div className="border border-[#00b1bb] rounded-2xl h-[500px] overflow-y-auto bg-white p-4 shadow-md mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-2 flex ${
              msg.sender === "User" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`rounded-xl px-4 py-2 text-white max-w-[70%] ${
                msg.sender === "User" ? "bg-[#00b1bb]" : "bg-gray-500"
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              {msg.timestamp && (
                <p className="text-[10px] text-gray-200 mt-1 text-right">
                  {new Date(msg.timestamp.toDate()).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 p-3 border-[#00b1bb] border-2 rounded-lg focus:outline-none "
          placeholder="Type your message..."
        />
        {message.trim() !== "" && (
          <button
            type="submit"
            className="bg-[#00b1bb] text-white px-4 py-2 rounded-lg hover:bg-[#46abb0] cursor-pointer"
          >
            <IoSend size={20} />
          </button>
        )}
      </form>
    </div>
  );
}
