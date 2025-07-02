"use client";
import { useUser } from "@clerk/nextjs";
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FaBell } from "react-icons/fa";
import { SiHey } from "react-icons/si";

const pieColors = ["#00b1bb", "#6EAB36", "#EF4444"];

export default function DashboardHome() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [userData, setUserData] = useState(null);
  const [usersByRole, setUsersByRole] = useState({});
  const [weeklyData, setWeeklyData] = useState([]);
  const [userServices, setUserServices] = useState([]);

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.id);
    const unsub = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        setUserData(snap.data());
      }
    });

    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const servicesRef = collection(db, "services", user.id, "userServices");
    const q = query(servicesRef, orderBy("name"));

    const unsub = onSnapshot(q, (snapshot) => {
      setUserServices(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });

    return () => unsub();
  }, [user]);

  // get users count per role
  useEffect(() => {
    const fetchRoles = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const counts = { Admin: 0, User: 0 };
      snapshot.forEach((doc) => {
        const role = doc.data().role;
        if (role && counts[role] !== undefined) counts[role]++;
      });
      setUsersByRole(counts);
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    const data = [
      { day: "Sun", users: 5 },
      { day: "Mon", users: 10 },
      { day: "Tue", users: 7 },
      { day: "Wed", users: 12 },
      { day: "Thu", users: 4 },
      { day: "Fri", users: 9 },
      { day: "Sat", users: 6 },
    ];
    setWeeklyData(data);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 to-white p-10">
      <motion.div
        className="max-w-7xl mx-auto space-y-10"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.15 } },
        }}
      >
        <motion.h1
          className="text-4xl font-bold text-gray-800 flex items-center gap-1"
          variants={{
            hidden: { opacity: 0, y: -30 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          Welcome back, <span className="text-[#00b1bb]">{userData?.name}</span>
          <SiHey color="#00b1bb" />
        </motion.h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard title="Your Role" value={userData?.role} />
          <StatCard
            title="Creation Date"
            value={userData?.createdAt}
            textSize="lg"
          />
          <StatCard title="Services Count" value={userServices.length ?? 0} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pie Chart: Roles */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Users by Role
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  dataKey="value"
                  data={Object.entries(usersByRole).map(([role, count]) => ({
                    name: role,
                    value: count,
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {Object.keys(usersByRole).map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Bar Chart: Weekly */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Weekly User Activity
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="users" fill="#00b1bb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Recent Activity + User Services */}
        <motion.div
          data-aos="fade-up"
          className="bg-white rounded-xl shadow p-6"
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700">
            <FaBell /> Recent Activity
          </h2>
          {userServices.length === 0 ? (
            <p className="text-gray-500">No activity yet.</p>
          ) : (
            <>
              <h3 className="text-md font-semibold mb-2">Your Services</h3>
              <ul className="space-y-2 list-inside text-gray-700">
                {userServices.map((service) => (
                  <li key={service.id}>
                    <span className="font-semibold">
                      {service.name} - ${service.price} -{" "}
                    </span>
                    <span
                      className={`${
                        service.available ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {service.available ? "Available" : "Not Available"}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

function StatCard({ title, value, textSize = "3xl" }) {
  return (
    <motion.div
      className="bg-white rounded-xl shadow p-6 text-center hover:shadow-md transition"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      <p className="text-gray-700">{title}</p>
      <p className={`text-${textSize} font-bold text-[#00b1bb]`}>{value}</p>
    </motion.div>
  );
}
