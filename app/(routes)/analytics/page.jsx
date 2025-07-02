"use client";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

import { db } from "../../firebase/config";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  FaUsers,
  FaUserShield,
  FaUserTie,
  FaUser,
  FaChartPie,
  FaChartBar,
  FaBell,
} from "react-icons/fa";

const pieColors = ["#00b1bb", "#F59E0B", "#6EAB36"];

export default function AnalyticsPage() {
  const [usersByRole, setUsersByRole] = useState({});
  const [totalUsers, setTotalUsers] = useState(0);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      const usersSnap = await getDocs(collection(db, "users"));
      const counts = { Admin: 0, Staff: 0, User: 0 };
      let taskSum = 0;
      usersSnap.forEach((doc) => {
        const data = doc.data();
        const role = data.role;
        if (role && counts[role] !== undefined) counts[role]++;
        if (data.tasksCount) taskSum += data.tasksCount;
      });
      setUsersByRole(counts);
      setTotalUsers(usersSnap.size);
    };

    fetchStats();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "activities"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const logs = snap.docs.map((doc) => doc.data());
      setLogs(logs);
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 p-10">
      <motion.div
        className="mx-auto space-y-10"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.15 } },
        }}
      >
        <motion.h1
          className="text-4xl font-bold text-[#00b1bb] flex items-center gap-3 flex-wrap justify-center text-center md:justify-start md:text-left"
          variants={{
            hidden: { opacity: 0, y: -30 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <FaChartPie className="text-[#00b1bb]" /> System Analytics
        </motion.h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <StatCard
            icon={<FaUsers color="#00b1bb" />}
            title="Total Users"
            value={totalUsers}
          />
          <StatCard
            icon={<FaUserShield color="#00b1bb" />}
            title="Admins"
            value={usersByRole.Admin ?? 0}
          />
          <StatCard
            icon={<FaUserTie color="#00b1bb" />}
            title="Staff"
            value={usersByRole.Staff ?? 0}
          />
          <StatCard
            icon={<FaUser color="#00b1bb" />}
            title="Regular Users"
            value={usersByRole.User ?? 0}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            className="bg-white p-6 rounded-xl shadow"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <FaChartBar /> Services Made
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart
                data={[
                  { day: "Sun", services: 2 },
                  { day: "Mon", services: 5 },
                  { day: "Tue", services: 7 },
                  { day: "Wed", services: 3 },
                  { day: "Thu", services: 6 },
                  { day: "Fri", services: 4 },
                  { day: "Sat", services: 8 },
                ]}
              >
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="services"
                  stroke="#00b1bb"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
          <motion.div
            className="bg-white p-6 rounded-xl shadow"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <FaChartPie /> Role Distribution
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
        </div>

        {/* Logs */}
        <motion.div
          className="bg-white p-6 rounded-xl shadow"
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0 },
          }}
          data-aos="fade-up"
        >
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <FaBell /> System Logs
          </h2>
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs yet.</p>
          ) : (
            <ul className="space-y-2 list-disc list-inside text-gray-700">
              {logs.slice(0, 5).map((log, idx) => (
                <li key={idx}>
                  {log.message}{" "}
                  <span className="text-sm text-gray-400">
                    (
                    {log.timestamp?.seconds &&
                      new Date(log.timestamp.seconds * 1000).toLocaleString()}
                    )
                  </span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <motion.div
      className="bg-white rounded-xl shadow p-6 text-center hover:shadow-md transition"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
    >
      <div className="text-blue-500 text-2xl mb-2 flex justify-center">
        {icon}
      </div>
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </motion.div>
  );
}
