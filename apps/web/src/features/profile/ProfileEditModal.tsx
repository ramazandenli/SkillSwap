import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema, type UpdateProfileInput, type PublicUser } from '@skillswap/shared';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/Avatar';
import { useAuth } from '@/auth/AuthContext';
import { useRemoveAvatar, useUpdateProfile, useUploadAvatar } from './hooks';

type Props = {
  open: boolean;
  onClose: () => void;
  user: PublicUser;
};

export function ProfileEditModal({ open, onClose, user }: Props) {
  const { refreshMe } = useAuth();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name,
      surname: user.surname,
      bio: user.bio ?? '',
    },
  });

  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const removeAvatar = useRemoveAvatar();

  const onSubmit = async (data: UpdateProfileInput) => {
    await updateProfile.mutateAsync(data);
    await refreshMe();
    reset(data);
    onClose();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadAvatar.mutateAsync(file);
      await refreshMe();
    } catch (err) {
      setUploadError(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed',
      );
    }
    e.target.value = '';
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit profile">
      <div className="mb-5 flex items-center gap-4">
        <Avatar name={user.name} avatarUrl={user.avatarUrl} size="lg" />
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileInput.current?.click()}
            loading={uploadAvatar.isPending}
          >
            Change avatar
          </Button>
          {user.avatarUrl && (
            <Button
              type="button"
              variant="ghost"
              className="text-red-500"
              onClick={async () => {
                await removeAvatar.mutateAsync();
                await refreshMe();
              }}
              loading={removeAvatar.isPending}
            >
              Remove
            </Button>
          )}
          <input
            ref={fileInput}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={handleFile}
          />
          {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Name" {...register('name')} error={errors.name?.message} />
          <Input label="Surname" {...register('surname')} error={errors.surname?.message} />
        </div>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">Bio</span>
          <textarea
            {...register('bio')}
            rows={3}
            maxLength={500}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-900"
            placeholder="Tell people a little about yourself..."
          />
          {errors.bio?.message && <span className="text-xs text-red-500">{errors.bio.message}</span>}
        </label>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}
