'use client';

import React from "react"

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/theme-toggle';
import { BookOpen, ArrowLeft } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    // Simulate password reset
    await new Promise(resolve => setTimeout(resolve, 1000));

    setSuccess(true);
    toast.success('Password reset successfully!');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8 gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">GPA Calc</h1>
        </div>

        <Card className="p-8 border border-border">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Reset Password</h2>
            <p className="text-muted-foreground text-sm">
              Enter your new password below
            </p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password" className="text-foreground font-medium">
                  New Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-2 bg-background text-foreground border-border"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum 6 characters
                </p>
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-2 bg-background text-foreground border-border"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <p className="text-accent font-medium text-sm">
                  ✓ Password reset successfully!
                </p>
                <p className="text-muted-foreground text-xs mt-2">
                  You can now sign in with your new password.
                </p>
              </div>

              <Link href="/login">
                <Button
                  type="button"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        </Card>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>This is a simulated reset for demo purposes</p>
        </div>
      </div>
    </div>
  );
}
