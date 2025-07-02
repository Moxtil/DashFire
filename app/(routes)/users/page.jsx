"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { db } from "../../firebase/config";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { FaUserShield, FaRegUser, FaUser, FaEdit } from "react-icons/fa";
import { MdEmail, MdOutlineDateRange } from "react-icons/md";
import toast, { Toaster } from "react-hot-toast";
import { MdOutlineEmail } from "react-icons/md";
import { FaTrash, FaUsers } from "react-icons/fa6";
import Swal from "sweetalert2";

export default function UsersPage() {
  const { user } = useUser();

  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [detailUser, setDetailUser] = useState(null);

  const [editUser, setEditUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [newName, setNewName] = useState("");

  // Search & filter states
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("All");

  // Fetch current user role
  useEffect(() => {
    const fetchCurrentUserRole = async () => {
      if (user) {
        const userRef = doc(db, "users", user.id);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          setCurrentUserRole(docSnap.data().role);
        }
      }
    };

    fetchCurrentUserRole();
  }, [user]);

  // Fetch all users once
  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllUsers(data);
      setFilteredUsers(data);
    };

    fetchUsers();
  }, [editUser]);

  // Filter users when search or filterRole changes
  useEffect(() => {
    let filtered = [...allUsers];

    if (filterRole !== "All") {
      filtered = filtered.filter((u) => u.role === filterRole);
    }

    if (search.trim() !== "") {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(lowerSearch) ||
          u.email.toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredUsers(filtered);
  }, [search, filterRole, allUsers]);

  const handleEdit = (user) => {
    setEditUser(user);
    setNewRole(user.role);
    setNewName(user.name);
  };

  const handleSave = async () => {
    if (!editUser) return;
    const userRef = doc(db, "users", editUser.id);
    await updateDoc(userRef, {
      name: newName,
      role: newRole,
    });
    setEditUser(null);
  };

  const handleDelete = async (userId) => {
    Swal.fire({
      title: "You won't be able to revert this!",
      text: "Are you sure you want to delete this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        const deleteU = async () => {
          try {
            await deleteDoc(doc(db, "users", userId));
            setAllUsers((prev) => prev.filter((u) => u.id !== userId));
            toast.success("User deleted successfully");
          } catch (error) {
            toast.error("Failed to delete user");
            console.error("Delete error:", error);
          }
        };
        deleteU();
      }
    });
  };
  const roleBadge = (role) => {
    const base = "px-2 py-1 rounded text-xs font-medium";
    if (role === "Admin") return `${base} bg-red-100 text-red-600`;
    return `${base} bg-green-100 text-green-600`;
  };

  const roleIcon = (role) => {
    if (role === "Admin") return <FaUserShield className="text-red-500" />;
    return <FaUser className="text-green-500" />;
  };

  return (
    <div className="p-6">
      <Toaster position="top-center" reverseOrder={false} />

      <motion.h1
        className="text-3xl font-bold mb-6 text-[#00b1bb] flex items-center gap-1 flex-wrap justify-center text-center md:justify-start md:text-left"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <FaUsers color="#00b1bb" />
        Users Management
      </motion.h1>

      {/* Search and Filter Controls */}
      <div className="flex flex-col flex-wrap w-full sm:flex-row items-start gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="flex-1 border border-gray-300 rounded px-4 py-2 outline-0 grow w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border border-gray-300 rounded px-4 py-2"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="All">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="User">User</option>
        </select>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.length === 0 ? (
          <p className="text-gray-500 col-span-full">No users found.</p>
        ) : (
          filteredUsers.map((u, i) => (
            <motion.div
              key={u.id}
              className="bg-white rounded-2xl shadow p-5 flex flex-col gap-3 truncate overflow whitespace-nowrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="bg-blue-100 p-3 rounded-full cursor-pointer"
                  onClick={() => setDetailUser(u)}
                >
                  {roleIcon(u.role)}
                </div>
                <div>
                  <h2
                    className="font-semibold text-lg transition-all text-gray-800 cursor-pointer hover:underline"
                    onClick={() => setDetailUser(u)}
                  >
                    {u.name}
                  </h2>

                  <div className="text-sm text-gray-500 flex items-center gap-1 truncate overflow whitespace-nowrap">
                    <MdEmail /> {u.role == "Admin" ? "Hidden Email" : u.email}
                  </div>
                </div>
              </div>

              <span className={roleBadge(u.role)}>{u.role}</span>

              {currentUserRole === "Admin" && user?.id !== u?.id && (
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => handleEdit(u)}
                    className="cursor-pointer flex items-center gap-1 text-green-500 hover:scale-[1.05] text-sm"
                  >
                    <FaEdit />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="cursor-pointer flex transition-all items-center gap-1 text-red-500 hover:scale-[1.05] text-sm"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <motion.div
            className="bg-white p-6 rounded-xl w-[90%] max-w-md space-y-4 shadow-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h2 className="text-xl font-semibold">Edit User</h2>

            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full border  border-gray-300 px-3 py-2 rounded"
              placeholder="Full name"
            />

            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 rounded"
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditUser(null)}
                className="px-4 py-2 cursor-pointer transition-all bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSave();
                  toast.success("Edited Successfully");
                }}
                className="px-4 py-2 cursor-pointer transition-all bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* User Detail Modal */}
      {detailUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <motion.div
            className="bg-white p-6 rounded-xl w-[90%] max-w-md space-y-4 shadow-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-1">
              <FaUser />
              User Details
            </h2>

            <p>
              <strong>#Name:</strong> {detailUser.name}
            </p>
            <p className="flex gap-1">
              <strong className="flex items-center gap-0.5">
                <MdOutlineEmail /> Email:
              </strong>{" "}
              {detailUser.role === "Admin" ? "Hidden Email" : detailUser.email}
            </p>
            <p className="flex items-center gap-1">
              <strong className="flex items-center gap-1">
                {detailUser.role === "Admin" ? (
                  <FaUserShield size={19} color="gold" />
                ) : (
                  <FaRegUser size={16} />
                )}
                Role:
              </strong>
              {detailUser.role}
            </p>
            <p className="flex item-center">
              <strong className="flex items-center gap-1">
                {" "}
                <MdOutlineDateRange size={19} />
                Created At:
              </strong>{" "}
              {detailUser.createdAt}
            </p>

            {/* Close button */}
            <div className="flex justify-end">
              <button
                onClick={() => setDetailUser(null)}
                className="px-4 cursor-pointer transition-all py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
