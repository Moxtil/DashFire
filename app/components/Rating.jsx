"use client";
import { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export default function Rating() {
  const [averageRating, setAverageRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [loading, setLoading] = useState(true);

  const ratingDocRef = doc(db, "ratings", "general");

  // جلب بيانات التقييم الحالية
  useEffect(() => {
    const fetchRating = async () => {
      const docSnap = await getDoc(ratingDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.ratingCount > 0) {
          setAverageRating(data.ratingSum / data.ratingCount);
        }
      }
      setLoading(false);
    };
    fetchRating();
  }, []);

  // إرسال تقييم المستخدم
  const handleRate = async (rate) => {
    setUserRating(rate);
    setLoading(true);
    const docSnap = await getDoc(ratingDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const newSum = (data.ratingSum || 0) + rate;
      const newCount = (data.ratingCount || 0) + 1;

      await updateDoc(ratingDocRef, {
        ratingSum: newSum,
        ratingCount: newCount,
      });

      setAverageRating(newSum / newCount);
    } else {
      await setDoc(ratingDocRef, {
        ratingSum: rate,
        ratingCount: 1,
      });
      setAverageRating(rate);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaStar
          key={star}
          size={30}
          className={`cursor-pointer transition-colors ${
            star <= userRating ? "text-yellow-400" : "text-gray-300"
          }`}
          onClick={() => !loading && handleRate(star)}
          title={`${star} star${star > 1 ? "s" : ""}`}
        />
      ))}
      <span className="ml-4 font-semibold text-gray-700">
        {loading ? "Loading..." : averageRating.toFixed(1)} / 5
      </span>
    </div>
  );
}
