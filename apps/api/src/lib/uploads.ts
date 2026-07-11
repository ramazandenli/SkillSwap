import multer from 'multer';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';

export const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = ALLOWED_MIME[file.mimetype];
    if (!ext) return cb(new Error('unsupported image type'), '');
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

export const avatarUpload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME[file.mimetype]) {
      cb(new Error('only jpeg/png/webp allowed'));
      return;
    }
    cb(null, true);
  },
});

export function removeUploadIfLocal(publicUrl: string | null | undefined): void {
  if (!publicUrl) return;
  const prefix = '/uploads/';
  const idx = publicUrl.indexOf(prefix);
  if (idx === -1) return;
  const filename = publicUrl.slice(idx + prefix.length);
  if (!/^[\w.-]+$/.test(filename)) return; // basic path traversal guard
  const full = path.join(UPLOADS_DIR, filename);
  fs.promises.unlink(full).catch(() => {
    // best effort; ignore missing file
  });
}
