'use client';

import React from "react"

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/theme-toggle';
import { BookOpen, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email.includes('@')) {
      toast.error('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmitted(true);
    toast.success('Reset link sent to your email!');
    setLoading(false);
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
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Forgot Your Password?
            </h2>
            <p className="text-muted-foreground text-sm">
              Enter your email and we'll send you a link to reset it
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-foreground font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="mt-2 bg-background text-foreground border-border"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <p className="text-accent font-medium text-sm">
                  ✓ Reset link sent successfully!
                </p>
                <p className="text-muted-foreground text-xs mt-2">
                  Check your email for the password reset link. The link will expire
                  in 24 hours.
                </p>
              </div>

              <Link href="/reset-password">
                <Button
                  type="button"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                >
                  Go to Reset Password
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
