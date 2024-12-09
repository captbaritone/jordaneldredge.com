import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import * as fs from "fs";
import { Readable } from "stream";

const BUCKET_NAME = "jordaneldredge-com";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY as string,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY as string,
  },
});

export async function list(): Promise<{ key: string; byteSize: number }[]> {
  const command = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
  });

  const response = await s3Client.send(command);
  if (!response.Contents) {
    throw new Error("No objects found in the bucket");
  }

  return response.Contents.map((object) => ({
    key: object.Key!,
    byteSize: object.Size!,
  }));
}

export function keyUrl(key: string): string {
  return `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
}

export async function uploadFromUrl(key: string, url: string): Promise<void> {
  // Fetch the file
  const response = await fetch(url);
  if (!response.ok)
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);

  // Get file content as a readable stream
  // Convert ReadableStream to Node.js Readable
  const readableStream = response.body;
  // @ts-ignore
  const nodeStream = Readable.fromWeb(readableStream); // Convert browser stream to Node.js stream

  // Upload to S3
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: BUCKET_NAME,
      Key: key, // S3 key (path + filename in the bucket)
      Body: nodeStream,
      ContentType:
        response.headers.get("content-type") || "application/octet-stream",
    },
  });

  // Wait for the upload to complete
  await upload.done();
}

export async function upload(
  key: string,
  filePath: string,
  contentType: string,
): Promise<void> {
  // Read the MP3 file as a stream
  const fileStream = fs.createReadStream(filePath);

  // Create and send the PutObjectCommand
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key, // The object key in the bucket
    Body: fileStream,
    ContentType: contentType,
  });

  await s3Client.send(command);
}
