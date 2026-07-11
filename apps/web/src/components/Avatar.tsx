import { cn } from '@/lib/cn';

type Props = {
  name: string;
  avatarUrl: string | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const SIZE = {
  sm: 'h-9 w-9 text-sm',
  md: 'h-12 w-12 text-base',
  lg: 'h-24 w-24 text-2xl',
};

export function Avatar({ name, avatarUrl, size = 'md', className }: Props) {
  const initial = name?.[0]?.toUpperCase() ?? '?';
  const src = avatarUrl ? (avatarUrl.startsWith('http') ? avatarUrl : `/api${avatarUrl}`) : null;
  return (
    <div
      className={cn(
        'flex items-center justify-center overflow-hidden rounded-full bg-brand-100 font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-100',
        SIZE[size],
        className,
      )}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}
