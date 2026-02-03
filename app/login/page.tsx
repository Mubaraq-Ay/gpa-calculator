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

export default function LoginPage() {
  const router = useRouter();
  const login = useStore(state => state.login);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.email || !formData.password) {
      toast.error('Please enter email and password');
      setLoading(false);
      return;
    }

    const result = login(formData.email, formData.password);

    if (result.success) {
      toast.success('Logged in successfully!');
      router.push('/dashboard');
    } else {
      toast.error(result.error || 'Login failed');
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    // Demo credentials
    setFormData({
      email: 'demo@university.edu',
      password: 'demo123',
    });
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
            <h2 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h2>
            <p className="text-muted-foreground text-sm">
              Sign in to view your academic progress
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="password" className="text-foreground font-medium">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="mt-2 bg-background text-foreground border-border"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleDemoLogin}
              className="w-full border-border text-foreground hover:bg-muted bg-transparent"
            >
              Try Demo Account
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary hover:underline font-medium">
                Create one
              </Link>
            </p>
          </div>
        </Card>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>Demo: Use demo@university.edu / demo123</p>
        </div>
      </div>
    </div>
  );
}
