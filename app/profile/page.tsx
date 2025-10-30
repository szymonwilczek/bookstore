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
    </div>
  );
}
