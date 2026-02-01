'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

export function useAuth() {
  const router = useRouter();
  const isAuthenticated = useStore(state => state.isAuthenticated());
  const getCurrentUser = useStore(state => state.getCurrentUser);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  return {
    isAuthenticated,
    user: getCurrentUser(),
  };
}

export function useAuthProtected() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}
