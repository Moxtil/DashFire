"use client";
import { useEffect, useState, useContext, useRef } from "react";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../firebase/config";
import { AuthContext } from "../../../context/RoleContext";
import { useUser } from "@clerk/nextjs";
import { IoChatbubblesOutline, IoSend } from "react-icons/io5";
import Image from "next/image";

export default function AdminChatPage() {
  const { role } = useContext(AuthContext);
  const [userEmails, setUserEmails] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  const { user } = useUser();
  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [messages]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userSnap = await getDocs(collection(db, "users"));
        const usersData = userSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUserEmails(usersData);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedUser) return;

    setLoadingMessages(true);

    const messagesRef = collection(db, "chats", selectedUser, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(msgs);
        setLoadingMessages(false);
      },
      (error) => {
        console.error("Error fetching messages:", error);
        setLoadingMessages(false);
      }
    );

    // Cleanup subscription on unmount or selectedUser change
    return () => unsubscribe();
  }, [selectedUser]);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchData = async () => {
      setLoadingMessages(true);
      try {
        const messagesRef = collection(db, "chats", selectedUser, "messages");
        const q = query(messagesRef, orderBy("timestamp", "asc"));
        const userSnap = await getDocs(q);

        const usersData = userSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMessages(usersData);
      } catch (err) {
        console.error("Error loading data:", err);
      }
      setLoadingMessages(false);
    };

    fetchData();
  }, [selectedUser]);

  // Fetch messages of selected user

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;

    try {
      await addDoc(collection(db, "chats", selectedUser, "messages"), {
        text: reply.trim(),
        sender: "Admin",
        email: user?.emailAddresses[0]?.emailAddress,
        avatar: user?.imageUrl,
        timestamp: serverTimestamp(),
      });
      setReply("");
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Message not sent.");
    }
  };

  if (role !== "Admin") {
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
    <div className="p-2 mx-auto">
      <h1 className="text-3xl font-bold flex items-center justify-center gap-2 flex-wrap mb-6 text-center text-[#00b1bb]">
        <IoChatbubblesOutline /> Admin Chat Inbox
      </h1>

      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      <div className=" grid grid-cols-1 lg:grid-cols-4 gap-y-4 lg:gap-x-4 w-full">
        {/* Left Column: User List */}
        <div className="col-span-1 bg-white border-[#00b1bb] rounded-2xl shadow-md p-4 h-[330px] lg:h-[500px] w-full overflow-y-auto">
          <h2 className="text-lg font-semibold mb-3">User Conversations</h2>
          {userEmails.length === 0 ? (
            <p className="text-gray-500">No user chats found.</p>
          ) : (
            userEmails.map((chatUser, index) => (
              <div
                key={index}
                onClick={() => setSelectedUser(chatUser.email)}
                className={`relative flex items-center gap-1 w-full cursor-pointer p-2 rounded-lg mb-1 ${
                  selectedUser === chatUser.email
                    ? "bg-blue-100 font-semibold"
                    : "hover:bg-gray-100"
                } 
                  
                 `}
              >
                {chatUser.role === "Admin" && (
                  <span className="absolute right-0 top-0 inline-flex items-center justify-center rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="-ms-1 me-1.5 size-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>

                    <p className="text-xs whitespace-nowrap">Admin</p>
                  </span>
                )}
                <div className="flex flex-col items-start text-left overflow-x-hidden">
                  <p className="font-semibold truncate overflow-x-hidden whitespace-nowrap">
                    {chatUser?.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    #
                    {chatUser.email == user?.emailAddresses[0]?.emailAddress ? (
                      <span className="font-bold">MY CONTACT</span>
                    ) : (
                      chatUser?.name || "Anonymous"
                    )}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Chat Window */}
        <div className="col-span-3 bg-white border-2 border-[#00b1bb] rounded-2xl shadow-md p-4 flex flex-col h-[500px] overflow-y-auto">
          {selectedUser ? (
            <>
              <div className="flex-1 overflow-y-auto pr-2">
                {loadingMessages ? (
                  <p className="text-center text-gray-500">
                    Loading messages...
                  </p>
                ) : messages.length === 0 ? (
                  <p className="text-center text-gray-400 mt-10">
                    No messages yet.
                  </p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`mb-2 flex ${
                        msg.email === user?.emailAddresses[0]?.emailAddress &&
                        msg.sender === "Admin"
                          ? "justify-end"
                          : "justify-start"
                      } ${
                        msg.email !== user?.emailAddresses[0]?.emailAddress &&
                        msg.sender === "Admin" &&
                        "justify-end"
                      } `}
                    >
                      <div
                        className={`rounded-xl px-4 py-2 text-white max-w-[70%] ${
                          msg.email === user?.emailAddresses[0]?.emailAddress
                            ? "bg-[#00b1bb]"
                            : "bg-gray-600"
                        } ${
                          msg.email !== user?.emailAddresses[0]?.emailAddress &&
                          msg.sender === "Admin"
                            ? "bg-yellow-400"
                            : "bg-[#00b1bb]"
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        {msg.timestamp && (
                          <p className="text-[10px] text-gray-200 mt-1 text-right">
                            {new Date(msg.timestamp.toDate()).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={bottomRef}></div>
              </div>

              <form onSubmit={handleSendReply} className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply..."
                  className="flex-1 p-3 border-2 rounded-lg focus:outline-none outline-0 border-[#00b1bb]"
                />
                {reply.trim() !== "" && (
                  <button
                    type="submit"
                    className="bg-[#00b1bb] cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-[#46abb0] transition"
                  >
                    <IoSend size={20} />
                  </button>
                )}
              </form>
            </>
          ) : (
            <p className="text-center text-gray-500 my-auto">
              Select a user to view messages
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
