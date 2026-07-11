import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginSchema, type LoginInput } from '@skillswap/shared';
import { AuthShell } from '@/components/AuthShell';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/auth/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setSubmitError(null);
    try {
      const user = await login(data.identifier, data.password);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? `/home/${user.username}`, { replace: true });
    } catch (err) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Login failed';
      setSubmitError(msg);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to continue swapping skills."
      footer={
        <>
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-brand-500 hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Username or email"
          autoComplete="username"
          {...register('identifier')}
          error={errors.identifier?.message}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          {...register('password')}
          error={errors.password?.message}
        />
        {submitError && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/50">
            {submitError}
          </p>
        )}
        <Button type="submit" loading={isSubmitting} className="w-full">
          Log in
        </Button>
      </form>
    </AuthShell>
  );
}
