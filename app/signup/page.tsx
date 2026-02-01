'use client';

import React from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/theme-toggle';
import { BookOpen } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const signup = useStore(state => state.signup);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.name.trim()) {
      toast.error('Full name is required');
      setLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      toast.error('Invalid email address');
      setLoading(false);
      return;
    }

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

    const result = signup(formData.name, formData.email, formData.password);

    if (result.success) {
      toast.success('Account created successfully!');
      router.push('/dashboard');
    } else {
      toast.error(result.error || 'Signup failed');
      setLoading(false);
    }
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
            <h2 className="text-2xl font-bold text-foreground mb-2">Create Account</h2>
            <p className="text-muted-foreground text-sm">
              Sign up to start tracking your academic performance
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-foreground font-medium">
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className="mt-2 bg-background text-foreground border-border"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-foreground font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@university.edu"
                value={formData.email}
                onChange={handleChange}
                className="mt-2 bg-background text-foreground border-border"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-foreground font-medium">
                Password
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
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </Card>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>Demo: Frontend-only authentication (localStorage)</p>
        </div>
      </div>
    </div>
  );
}
