'use client';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import WishlistForm from '@/components/WishlistForm';
import OfferedBooksList from '@/components/OfferedBooksList';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/register');
    if (session) {
      fetch('/api/user/profile').then(res => res.json()).then(setUserData);
    }
  }, [status, session, router]);

  if (status === 'loading') return <div>Loading...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">Twój Profil: {session?.user?.name}</h1>
      <div className="mb-4">
        <p>Punkty: {userData?.points || 0}</p>
        <p>Średnia ocena: {userData?.averageRating || 0}/5</p>
      </div>
      <WishlistForm onAdd={() => fetch('/api/user/profile').then(res => res.json()).then(setUserData)} />
      <OfferedBooksList onUpdate={() => fetch('/api/user/profile').then(res => res.json()).then(setUserData)} />
    </motion.div>
  );
}
