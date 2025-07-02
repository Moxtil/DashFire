"use client";
import { useEffect } from "react";
import { db } from "../../firebase/config";
import { collection, addDoc } from "firebase/firestore";

export default function SeedAnalyticsPage() {
  useEffect(() => {
    const seedData = async () => {
      const analyticsRef = collection(db, "analytics");
      const sampleData = [
        { month: "Jan", users: 450, sales: 200 },
        { month: "Feb", users: 300, sales: 120 },
        { month: "Mar", users: 500, sales: 330 },
        { month: "Apr", users: 220, sales: 400 },
        { month: "May", users: 350, sales: 280 },
        { month: "Jun", users: 270, sales: 310 },
      ];

      for (const entry of sampleData) {
        await addDoc(analyticsRef, entry);
      }

      console.log("Sample analytics data seeded ✅");
    };

    seedData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-green-600">
        Seeding Firestore Data...
      </h1>
      <p>You can delete this page after seeding is complete.</p>
    </div>
  );
}
