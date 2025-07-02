"use client";

import { useEffect, useState } from "react";
import {
  collection,
  collectionGroup,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import {
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaRegCheckCircle,
} from "react-icons/fa";
import { useUser } from "@clerk/nextjs";
import { MdOutlineDesignServices } from "react-icons/md";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const { user } = useUser();

  const [form, setForm] = useState({
    id: null,
    name: "",
    price: "",
    category: "",
    available: true,
  });
  const [editing, setEditing] = useState(false);

  // جلب خدمات المستخدم الحالي فقط للعرض
  useEffect(() => {
    if (!user) return;

    const servicesRef = collection(db, "services", user.id, "userServices");
    const q = query(servicesRef, orderBy("name"));

    const unsub = onSnapshot(q, (snap) => {
      setServices(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, [user]);

  // جلب كل الخدمات من جميع المستخدمين (كل userServices)
  useEffect(() => {
    const q = query(collectionGroup(db, "userServices"));
    const unsub = onSnapshot(q, (snap) => {
      setAllServices(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const saveService = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Service name is required.");
    if (isNaN(Number(form.price)))
      return toast.error("Price Must Be A Number.");
    const priceNum = Number(form.price);

    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    const servicesRef = collection(db, "services", user.id, "userServices");

    if (editing) {
      const serviceRef = doc(db, "services", user.id, "userServices", form.id);
      await updateDoc(serviceRef, {
        name: form.name,
        price: priceNum,
        category: form.category,
        available: form.available,
      });
    } else {
      await addDoc(servicesRef, {
        name: form.name,
        price: priceNum,
        category: form.category,
        available: form.available,
      });
    }
    setForm({ id: null, name: "", price: "", category: "", available: true });
    setEditing(false);
    toast.success(editing ? "Edited Successfully!" : "Added Successfully!");
  };

  const editService = (service) => {
    setForm({ ...service, price: String(service.price) });
    setEditing(true);
  };

  // حذف الخدمة مع استخدام SweetAlert2 بدون confirm أو alert
  const deleteService = async (id) => {
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteDoc(doc(db, "services", user.id, "userServices", id));
          Swal.fire({
            title: "Deleted!",
            text: "Your service has been deleted.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        } catch (error) {
          toast.error("Failed to delete the service.");
        }
      }
    });
  };

  // حساب الإحصائيات من كل الخدمات
  const totalServices = allServices.length;
  const availableServices = allServices.filter((s) => s.available).length;
  const notAvailableServices = allServices.filter((s) => !s.available).length;

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 to-white p-8 max-w-4xl mx-auto">
      <Toaster position="top-center" reverseOrder={false} />
      <h2 className="text-3xl font-bold text-[#00b1bb] mb-6 flex items-center gap-3">
        <MdOutlineDesignServices className="text-[#00b1bb]" /> Services
      </h2>

      <h4 className="text-lg font-bold text-[#333] mb-6 flex items-center gap-3">
        <FaRegCheckCircle className="text-green-500" /> Services Offered Across
        the App
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Services" value={totalServices} />
        <StatCard title="Available Services" value={availableServices} />
        <StatCard title="Not Available Services" value={notAvailableServices} />
      </div>

      <form
        onSubmit={saveService}
        className="bg-white p-6 rounded-xl shadow space-y-4 mb-8"
      >
        <input
          type="text"
          placeholder="Service Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none outline-0"
        />
        <input
          type="text"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none outline-0"
        />
        <input
          type="text"
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none outline-0"
        />
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.available}
            onChange={(e) => setForm({ ...form, available: e.target.checked })}
            className="rounded cursor-pointer"
          />
          Available
        </label>

        <div className="flex gap-4 justify-end">
          {editing && (
            <button
              type="button"
              onClick={() => {
                setForm({
                  id: null,
                  name: "",
                  price: "",
                  category: "",
                  available: true,
                });
                setEditing(false);
              }}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition-all cursor-pointer"
            >
              <FaTimes className="inline mr-1" /> Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-700 transition-all cursor-pointer flex items-center gap-2"
          >
            <FaSave /> {editing ? "Update Service" : "Add Service"}
          </button>
        </div>
      </form>

      <h2 className="text-xl font-bold text-[#00b1bb] mb-6 flex items-center gap-3">
        <MdOutlineDesignServices className="text-[#00b1bb]" /> My Services
      </h2>
      <ul className="space-y-4" data-aos="fade-up">
        {services.map((service) => (
          <li
            key={service.id}
            className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold text-gray-900">{service.name}</h3>
              <p className="text-gray-600">Category: {service.category}</p>
              <p className="text-gray-600">Price: ${service.price}</p>
              <span
                className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  service.available
                    ? "bg-green-200 text-green-800"
                    : "bg-red-200 text-red-800"
                }`}
              >
                {service.available ? "Available" : "Not Available"}
              </span>
            </div>
            <div className="flex gap-3 text-gray-600">
              <button
                onClick={() => editService(service)}
                title="Edit Service"
                className="hover:text-[#00b1bb] transition-all cursor-pointer"
              >
                <FaEdit size={18} />
              </button>
              <button
                onClick={() => deleteService(service.id)}
                title="Delete Service"
                className="hover:text-red-600 transition-all cursor-pointer"
              >
                <FaTrash size={18} />
              </button>
            </div>
          </li>
        ))}
        {services.length === 0 && (
          <p className="text-gray-500">No services found.</p>
        )}
      </ul>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 text-center hover:shadow-md transition cursor-default">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-3xl font-bold text-[#00b1bb]">{value}</p>
    </div>
  );
}
