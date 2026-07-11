import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { signupSchema, type SignupInput } from '@skillswap/shared';
import { AuthShell } from '@/components/AuthShell';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/auth/AuthContext';

export function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (data: SignupInput) => {
    setSubmitError(null);
    try {
      const user = await signup(data);
      navigate(`/home/${user.username}`, { replace: true });
    } catch (err) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Signup failed';
      setSubmitError(msg);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start trading skills with people around you."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-500 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Username"
          autoComplete="username"
          {...register('username')}
          error={errors.username?.message}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          {...register('email')}
          error={errors.email?.message}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          {...register('password')}
          error={errors.password?.message}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Name" {...register('name')} error={errors.name?.message} />
          <Input label="Surname" {...register('surname')} error={errors.surname?.message} />
        </div>
        <Input
          label="Birthdate"
          type="date"
          {...register('birthdate')}
          error={errors.birthdate?.message}
        />
        {submitError && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/50">
            {submitError}
          </p>
        )}
        <Button type="submit" loading={isSubmitting} className="w-full">
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
