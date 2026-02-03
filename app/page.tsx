'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  BarChart3, 
  TrendingUp, 
  Calculator, 
  Target, 
  Download, 
  Shield,
  Zap,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useStore(state => state.isAuthenticated());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (!mounted) return null;

  const features = [
    {
      icon: Calculator,
      title: 'Accurate GPA Calculation',
      description: 'Real-time CGPA and semester GPA calculations with support for multiple grade scales'
    },
    {
      icon: TrendingUp,
      title: 'GPA Trends',
      description: 'Visualize your academic performance over time with beautiful charts and analytics'
    },
    {
      icon: Target,
      title: 'Smart Planner',
      description: 'Plan your future semesters with what-if scenarios to reach your target CGPA'
    },
    {
      icon: BarChart3,
      title: 'Impact Analysis',
      description: 'Identify which courses affect your GPA the most and focus on high-impact areas'
    },
    {
      icon: Download,
      title: 'Import/Export',
      description: 'Backup and restore your data with one-click JSON import and export'
    },
    {
      icon: Zap,
      title: 'Fast & Offline',
      description: 'Works completely offline with instant calculations and responsive UI'
    }
  ];

  const faqItems = [
    {
      q: 'What grade scales are supported?',
      a: 'We support Nigerian 5.0 scale (default) and US 4.0 scale. You can also customize your own grade mapping.'
    },
    {
      q: 'Is my data safe?',
      a: 'Your data is stored locally on your device. No data is sent to any server. You have full control.'
    },
    {
      q: 'Can I use this offline?',
      a: 'Yes! The app works completely offline. All features are available without internet connection.'
    },
    {
      q: 'How do I handle course retakes?',
      a: 'Choose between replacing the old grade or keeping both grades. This is configurable in settings.'
    },
    {
      q: 'Can I export my data?',
      a: 'Yes, you can export all your data as JSON for backup or import it back anytime.'
    },
    {
      q: 'Does this work on mobile?',
      a: 'Absolutely! The app is fully responsive and works great on phones, tablets, and desktops.'
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border backdrop-blur-sm bg-background/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Calculator className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold hidden sm:inline">GPA Calc</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle  />
            <Link href="/login">
              <Button variant="outline" size="sm" className='cursor-pointer'>
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className='cursor-pointer'>
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance leading-tight mb-6">
              Master Your <span className="text-primary">Academic Journey</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 text-balance">
              Track CGPA, plan your future, and make data-driven decisions about your courses. Built for Nigerian universities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto" className='cursor-pointer'>
                  Start Free
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-square">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-3xl" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl" />
              <div className="relative bg-card border border-border rounded-2xl p-8 shadow-lg h-full flex flex-col justify-between">
                <div>
                  <div className="text-sm font-semibold text-muted-foreground mb-2">Your CGPA</div>
                  <div className="text-4xl font-bold text-primary mb-6">3.82</div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-sm">Trending up this semester</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-sm">0.18 points to target</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-secondary/30 py-20 sm:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-balance">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground text-balance">
              Powerful features designed for Nigerian university students
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
                  <Icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-balance">
              Built for Nigerian Universities
            </h2>
            <p className="text-lg text-muted-foreground">
              Default Nigerian 5.0 grade scale with full customization options. Support for all universities and grading systems.
            </p>
            <ul className="space-y-4">
              {[
                'Default Nigerian 5.0 grade mapping',
                'Configurable retake policies',
                'Multi-semester tracking',
                'Offline-first design',
                'Privacy-focused storage',
                'Free forever'
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="space-y-6">
              <div>
                <div className="text-sm font-semibold text-muted-foreground mb-2">Grade Scale</div>
                <div className="space-y-2">
                  {[
                    { grade: 'A', range: '70-100', point: '5.0' },
                    { grade: 'B', range: '60-69', point: '4.0' },
                    { grade: 'C', range: '50-59', point: '3.0' },
                    { grade: 'D', range: '45-49', point: '2.0' },
                    { grade: 'E', range: '40-44', point: '1.0' }
                  ].map((row, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 px-3 bg-secondary rounded text-sm">
                      <div>
                        <span className="font-semibold">{row.grade}</span>
                        <span className="text-muted-foreground ml-2">({row.range})</span>
                      </div>
                      <span className="font-semibold text-primary">{row.point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-secondary/30 py-20 sm:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Frequently Asked
            </h2>
            <p className="text-lg text-muted-foreground">
              Common questions about GPA Calc
            </p>
          </div>
          <div className="space-y-6">
            {faqItems.map((item, idx) => (
              <details key={idx} className="group bg-card border border-border rounded-lg p-6 cursor-pointer hover:border-primary/50 transition-colors">
                <summary className="flex items-start justify-between font-semibold text-lg">
                  {item.q}
                  <ChevronRight className="w-5 h-5 transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary/10 via-transparent to-accent/10 py-20 sm:py-32 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-balance">
            Ready to take control of your academics?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 text-balance">
            Join Nigerian students tracking their academic journey
          </p>
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Get Started Free
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/30 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Calculator className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold">GPA Calc</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Track your academic journey. Free and offline. 
            </p>
            <p className='text-sm text-muted-foreground'>
              Built by Mubaraq
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
