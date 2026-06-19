import { S3 } from 'aws-sdk';
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

const s3 = IS_MOCK ? null : new S3({
  endpoint: process.env.R2_ENDPOINT,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'cct-snapshots';

export async function uploadSnapshot(key: string, content: string): Promise<string> {
  if (IS_MOCK) {
    const filePath = ensureLocalDir(key);
    fs.writeFileSync(filePath, content, 'utf-8');
    return key;
  }

  await s3!.putObject({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: content,
    ContentType: 'text/markdown',
  }).promise();
  return key;
}

export async function getSnapshot(key: string): Promise<string> {
  if (IS_MOCK) {
    const filePath = path.join(LOCAL_STORAGE_DIR, key);
    if (!fs.existsSync(filePath)) return '';
    return fs.readFileSync(filePath, 'utf-8');
  }

  const data = await s3!.getObject({
    Bucket: BUCKET_NAME,
    Key: key,
  }).promise();
  return data.Body?.toString('utf-8') || '';
}

