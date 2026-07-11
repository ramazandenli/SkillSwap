import { useMemo, useState } from 'react';
import type { SkillKind, UserSkillView } from '@skillswap/shared';
import { Button } from '@/components/ui/Button';
import { useAllSkills, useAddSkill, useRemoveSkill, useUserSkills } from './hooks';

type Props = {
  username: string;
  ownedByCurrentUser: boolean;
  kind: SkillKind;
  title: string;
  helpText: string;
};

export function SkillsSection({ username, ownedByCurrentUser, kind, title, helpText }: Props) {
  const [adding, setAdding] = useState(false);
  const [selectedId, setSelectedId] = useState<number | ''>('');
  const allSkills = useAllSkills();
  const userSkills = useUserSkills(username);
  const addSkill = useAddSkill(username);
  const removeSkill = useRemoveSkill(username);

  const rows = useMemo<UserSkillView[]>(
    () => (userSkills.data ?? []).filter((s) => s.kind === kind),
    [userSkills.data, kind],
  );

  const takenIds = useMemo(
    () => new Set((userSkills.data ?? []).map((s) => s.skillId)),
    [userSkills.data],
  );

  const options = useMemo(
    () => (allSkills.data ?? []).filter((s) => !takenIds.has(s.id)),
    [allSkills.data, takenIds],
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-xs text-slate-500">{helpText}</p>
        </div>
        {ownedByCurrentUser && !adding && (
          <Button variant="secondary" onClick={() => setAdding(true)}>
            + Add
          </Button>
        )}
      </header>

      {userSkills.isPending ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-slate-500">Nothing yet.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {rows.map((s) => (
            <li
              key={s.skillId}
              className="group inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-100"
            >
              {s.name}
              {ownedByCurrentUser && (
                <button
                  type="button"
                  aria-label={`Remove ${s.name}`}
                  onClick={() => removeSkill.mutate(s.skillId)}
                  className="text-brand-500 opacity-60 transition hover:opacity-100"
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {adding && (
        <form
          className="mt-4 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (typeof selectedId !== 'number') return;
            addSkill.mutate(
              { skillId: selectedId, kind },
              {
                onSuccess: () => {
                  setSelectedId('');
                  setAdding(false);
                },
              },
            );
          }}
        >
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : '')}
            className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            required
          >
            <option value="" disabled>
              -- Select a skill --
            </option>
            {options.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <Button type="submit" loading={addSkill.isPending} disabled={!selectedId}>
            Add
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setAdding(false);
              setSelectedId('');
            }}
          >
            Cancel
          </Button>
        </form>
      )}

      {addSkill.error && (
        <p className="mt-2 text-xs text-red-500">
          {(addSkill.error as { response?: { data?: { error?: string } } })?.response?.data
            ?.error ?? 'Failed to add'}
        </p>
      )}
    </section>
  );
}
