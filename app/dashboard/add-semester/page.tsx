'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useAuth } from '@/hooks/use-auth';
import { AppNavbar } from '@/components/app-navbar';
import { SemesterDialog } from '@/components/dialogs/semester-dialog';

export default function AddSemesterPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(true);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <SemesterDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            router.back();
          }
        }}
      />
    </div>
  );
}
