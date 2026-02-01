'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useAuth } from '@/hooks/use-auth';
import { AppNavbar } from '@/components/app-navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { LogOut, Mail, User, ArrowLeft } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  const getCurrentUser = useStore(state => state.getCurrentUser);
  const updateUserProfile = useStore(state => state.updateUserProfile);
  const logout = useStore(state => state.logout);

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setMounted(true);
    const user = getCurrentUser();
    if (user) {
      setName(user.name);
    }
  }, [getCurrentUser]);

  if (!mounted) return null;
  if (!isAuthenticated) return null;

  const user = getCurrentUser();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!name.trim()) {
        toast.error('Name cannot be empty');
        setLoading(false);
        return;
      }

      updateUserProfile(name);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-muted-foreground">User not found</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>

        <div className="space-y-6">
          {/* Profile Card */}
          <Card className="p-8 border border-border">
            <div className="flex items-start gap-6 mb-8">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Account Status
                </p>
                <p className="text-lg font-semibold text-foreground mb-4">Active</p>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant="outline"
                  size="sm"
                  className="border-border text-foreground hover:bg-muted"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-foreground font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="mt-2 bg-background text-foreground border-border"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setName(user.name);
                    }}
                    className="border-border text-foreground hover:bg-muted"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Full Name
                  </p>
                  <p className="text-lg font-semibold text-foreground">{user.name}</p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Email Address
                  </p>
                  <p className="text-lg font-semibold text-foreground">{user.email}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Account Info */}
          <Card className="p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Account Information
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <User className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    User ID
                  </p>
                  <p className="text-sm font-mono text-foreground">{user.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Email
                  </p>
                  <p className="text-sm font-mono text-foreground">{user.email}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Quick Actions
            </h2>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full border-border text-foreground hover:bg-muted justify-start bg-transparent"
                onClick={() => window.location.href = '/settings'}
              >
                <span>Go to Settings</span>
              </Button>
              <Button
                variant="outline"
                className="w-full border-border text-foreground hover:bg-muted justify-start bg-transparent"
                onClick={() => window.location.href = '/dashboard'}
              >
                <span>Back to Dashboard</span>
              </Button>
            </div>
          </Card>

          {/* Logout Section */}
          <Card className="p-6 border border-destructive/20 bg-destructive/5">
            <h2 className="text-lg font-semibold text-destructive mb-2">
              Sign Out
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Sign out of your account on this device
            </p>
            <Button
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </Card>

          {/* Info Box */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <p className="text-sm text-primary font-medium">
              This is a frontend-only demo application.
            </p>
            <p className="text-xs text-primary/80 mt-1">
              Your data is stored locally in your browser using localStorage. It will be cleared if you delete your browser cache.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
