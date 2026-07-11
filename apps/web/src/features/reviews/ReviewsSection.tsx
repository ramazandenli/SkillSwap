import { Link } from 'react-router-dom';
import { Avatar } from '@/components/Avatar';
import { useUserRating, useUserReviews } from './hooks';

export function ReviewsSection({ username }: { username: string }) {
  const rating = useUserRating(username);
  const reviews = useUserReviews(username);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Reviews</h2>
          <p className="text-xs text-slate-500">What past swap partners think.</p>
        </div>
        {(rating.data?.count ?? 0) > 0 && (
          <div className="text-right">
            <p className="text-2xl font-bold text-amber-500">
              ★ {rating.data!.average.toFixed(1)}
            </p>
            <p className="text-xs text-slate-500">
              from {rating.data!.count} review{rating.data!.count === 1 ? '' : 's'}
            </p>
          </div>
        )}
      </header>

      {reviews.isPending ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : reviews.data?.length === 0 ? (
        <p className="text-sm text-slate-500">No reviews yet.</p>
      ) : (
        <ul className="space-y-3">
          {reviews.data?.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"
            >
              <div className="flex items-center gap-3">
                <Avatar name={r.from.name} avatarUrl={r.from.avatarUrl} size="sm" />
                <div className="flex-1">
                  <Link
                    to={`/home/${r.from.username}`}
                    className="text-sm font-medium hover:text-brand-500"
                  >
                    {r.from.name} {r.from.surname}
                  </Link>
                  <p className="text-xs text-slate-500">@{r.from.username}</p>
                </div>
                <p className="text-lg text-amber-500">
                  {'★'.repeat(r.rating)}
                  <span className="text-slate-300 dark:text-slate-700">
                    {'★'.repeat(5 - r.rating)}
                  </span>
                </p>
              </div>
              {r.comment && (
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{r.comment}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
