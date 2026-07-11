import { useState } from 'react';
import type { EventType, UserSkillView } from '@skillswap/shared';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/auth/AuthContext';
import { useUserSkills } from '@/features/skills/hooks';
import { useCreateEvent } from './hooks';

type Props = {
  open: boolean;
  onClose: () => void;
  targetUsername: string;
  targetName: string;
};

export function RequestEventModal({ open, onClose, targetUsername, targetName }: Props) {
  const { user } = useAuth();
  const mySkills = useUserSkills(user?.username);
  const theirSkills = useUserSkills(targetUsername);

  const [mySkillId, setMySkillId] = useState<number | ''>('');
  const [theirSkillId, setTheirSkillId] = useState<number | ''>('');
  const [type, setType] = useState<EventType>('exchange');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createEvent = useCreateEvent();

  const myOffers = (mySkills.data ?? []).filter((s: UserSkillView) => s.kind === 'has');
  const theirOffers = (theirSkills.data ?? []).filter((s: UserSkillView) => s.kind === 'has');

  const canSubmit =
    !!mySkillId && !!theirSkillId && !!startDate && !!endDate && startDate <= endDate;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    try {
      await createEvent.mutateAsync({
        targetUsername,
        mySkillId: Number(mySkillId),
        theirSkillId: Number(theirSkillId),
        startDate,
        endDate,
        type,
      });
      onClose();
      setMySkillId('');
      setTheirSkillId('');
      setStartDate('');
      setEndDate('');
    } catch (err) {
      setError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
          'Failed to create request',
      );
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Request a swap with ${targetName}`}>
      <form onSubmit={onSubmit} className="space-y-3 text-sm">
        <label className="flex flex-col gap-1">
          <span className="font-medium">Type</span>
          <div className="flex gap-2">
            <TypeButton active={type === 'exchange'} onClick={() => setType('exchange')}>
              Exchange (both teach)
            </TypeButton>
            <TypeButton active={type === 'teach'} onClick={() => setType('teach')}>
              Teach (one-way)
            </TypeButton>
          </div>
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-medium">A skill I offer</span>
          <SelectSkill
            value={mySkillId}
            onChange={setMySkillId}
            options={myOffers}
            placeholder={myOffers.length ? '-- Pick one --' : 'Add a "Have" skill first'}
            disabled={!myOffers.length}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-medium">A skill {targetName} offers</span>
          <SelectSkill
            value={theirSkillId}
            onChange={setTheirSkillId}
            options={theirOffers}
            placeholder={theirOffers.length ? '-- Pick one --' : 'They have no offered skills'}
            disabled={!theirOffers.length}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-medium">Start date</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-medium">End date</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
        </div>
        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950/50">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!canSubmit} loading={createEvent.isPending}>
            Send request
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function TypeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? 'flex-1 rounded-md border-2 border-brand-500 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-100'
          : 'flex-1 rounded-md border-2 border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 hover:border-slate-300 dark:border-slate-700'
      }
    >
      {children}
    </button>
  );
}

function SelectSkill({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  value: number | '';
  onChange: (v: number | '') => void;
  options: UserSkillView[];
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
      className="rounded-md border border-slate-300 bg-white px-3 py-2 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:disabled:bg-slate-800"
    >
      <option value="">{placeholder}</option>
      {options.map((s) => (
        <option key={s.skillId} value={s.skillId}>
          {s.name}
        </option>
      ))}
    </select>
  );
}
