import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ThemeToggle';

type Health = { status: string; db: string };

export function LandingPage() {
  const { user, status } = useAuth();
  const health = useQuery({
    queryKey: ['health'],
    queryFn: async () => (await api.get<Health>('/health')).data,
  });

  return (
    <main className="relative mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-widest text-brand-500">
          SkillSwap
        </p>
        <h1 className="text-4xl font-bold sm:text-6xl">
          Trade the skills you have{' '}
          <span className="text-brand-500">for the ones you want.</span>
        </h1>
        <p className="mx-auto max-w-xl text-lg text-slate-600 dark:text-slate-400">
          A community where people teach each other. List what you can share,
          list what you want to learn, and get matched.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {status === 'authenticated' && user ? (
          <Link to={`/home/${user.username}`}>
            <Button className="min-w-32">Go to my profile</Button>
          </Link>
        ) : (
          <>
            <Link to="/signup">
              <Button className="min-w-32">Sign up</Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" className="min-w-32">
                Log in
              </Button>
            </Link>
          </>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <span className="mr-2 font-medium">API status:</span>
        {health.isPending ? (
          <span className="text-slate-500">checking...</span>
        ) : health.isError ? (
          <span className="text-red-500">unreachable</span>
        ) : (
          <span className="text-emerald-500">
            {health.data.status} · db {health.data.db}
          </span>
        )}
      </div>
    </main>
  );
}
