'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      } else if (allowedRoles.length > 0 && !allowedRoles.includes(user.rol)) {
        router.push('/unauthorized');
      }
    }
  }, [user, isLoading, router, allowedRoles]);

  if (isLoading || !user) {
    return <div>Loading...</div>;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.rol)) {
    return <div>Unauthorized</div>;
  }

  return children;
}