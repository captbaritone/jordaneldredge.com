import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import * as fs from "fs";

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
