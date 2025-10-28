"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import WishlistForm from "@/components/WishlistForm";
import OfferedBooksList from "@/components/OfferedBooksList";
import { motion } from "framer-motion";
import { ProfileDashboard } from "@/components/profile/profile-dashboard";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState(null);

  const updateProfile = async () => {
    const res = await fetch("/api/user/profile");
    const data = await res.json();
    setUserData(data);
  };

  useEffect(() => {
    if (session) {
      const fetchData = async () => {
        const res = await fetch("/api/user/profile");
        const data = await res.json();
        setUserData(data);
      };
      fetchData();
    }
  }, [session]);

  if (status === "loading") return <div>Loading...</div>;

  return (
    <div>
      <div className="min-h-screen bg-background">
        <ProfileDashboard userData={userData} onUpdate={updateProfile} />
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto p-4"
      >
        <h1 className="text-2xl mb-4">Twój Profil: {userData?.username}</h1>
        <div className="mb-4">
          <p>Punkty: {userData?.points || 0}</p>
          <p>Średnia ocena: {userData?.averageRating || 0}/5</p>
        </div>
        <WishlistForm onAdd={updateProfile} />
        <OfferedBooksList onUpdate={updateProfile} />
      </motion.div>
    </div>
  );
}
