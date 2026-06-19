import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

const IS_MOCK = process.env.R2_ACCESS_KEY_ID === 'mock_r2_access_key';
const LOCAL_STORAGE_DIR = '/Users/ryan./Desktop/SaaS/storage/r2';

// Helper to ensure directory exists
function ensureLocalDir(key: string) {
  const filePath = path.join(LOCAL_STORAGE_DIR, key);
  const dirPath = path.dirname(filePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return filePath;
}

const r2 = IS_MOCK ? null : new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;

// ─── Snapshots ───────────────────────────────────────────────────────────────

export function buildSnapshotKey(
  workspaceId: string,
  urlId: string,
  checkRunId: string,
): string {
  return `snapshots/${workspaceId}/${urlId}/${checkRunId}.txt`;
}

export function buildScreenshotKey(
  workspaceId: string,
  changeEventId: string,
): string {
  return `screenshots/${workspaceId}/${changeEventId}.png`;
}

export async function uploadSnapshot(
  key: string,
  content: string,
): Promise<{ key: string; bytes: number }> {
  const buf = Buffer.from(content, 'utf-8');
  if (IS_MOCK) {
    const filePath = ensureLocalDir(key);
    fs.writeFileSync(filePath, buf);
    return { key, bytes: buf.byteLength };
  }

  await r2!.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buf,
      ContentType: 'text/plain; charset=utf-8',
    }),
  );
  return { key, bytes: buf.byteLength };
}

export async function downloadSnapshot(key: string): Promise<string> {
  if (IS_MOCK) {
    const filePath = path.join(LOCAL_STORAGE_DIR, key);
    if (!fs.existsSync(filePath)) return '';
    return fs.readFileSync(filePath, 'utf-8');
  }

  const response = await r2!.send(
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
  );
  const chunks: Buffer[] = [];
  for await (const chunk of response.Body as AsyncIterable<Buffer>) {
    chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf-8');
}

export async function uploadScreenshot(
  key: string,
  buffer: Buffer,
): Promise<{ key: string }> {
  if (IS_MOCK) {
    const filePath = ensureLocalDir(key);
    fs.writeFileSync(filePath, buffer);
    return { key };
  }

  await r2!.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: 'image/png',
    }),
  );
  return { key };
}

export async function deleteObject(key: string): Promise<void> {
  if (IS_MOCK) {
    const filePath = path.join(LOCAL_STORAGE_DIR, key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return;
  }

  await r2!.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

