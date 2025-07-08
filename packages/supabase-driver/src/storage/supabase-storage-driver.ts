import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import {
	CopyObjectCommand,
	DeleteObjectCommand,
	GetObjectCommand,
	HeadObjectCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import type {
	GetJsonParams,
	GiselleStorage,
	SetJsonParams,
} from "@giselle-sdk/giselle-engine";
import type { z } from "zod/v4";

export interface SupabaseStorageDriverConfig {
	endpoint: string;
	region: string;
	accessKeyId: string;
	secretAccessKey: string;
	bucket: string;
}

function isReadable(obj: unknown): obj is Readable {
	return obj instanceof Readable;
}

async function streamToUint8Array(stream: Readable): Promise<Uint8Array> {
	const chunks: Buffer[] = [];
	for await (const chunk of stream) {
		chunks.push(
			typeof chunk === "string" ? Buffer.from(chunk) : Buffer.from(chunk),
		);
	}
	return new Uint8Array(Buffer.concat(chunks));
}

function normalizeKey(key: string): string {
	return key.replace(/^\/+/, "");
}

export function supabaseStorageDriver(
	config: SupabaseStorageDriverConfig,
): GiselleStorage {
	const client = new S3Client({
		endpoint: config.endpoint,
		region: config.region,
		credentials: {
			accessKeyId: config.accessKeyId,
			secretAccessKey: config.secretAccessKey,
		},
		forcePathStyle: true,
	});

	const bucket = config.bucket;
	const maxRetry = 3;

	async function atomicWrite(
		key: string,
		body: string | Uint8Array | Buffer,
		contentType?: string,
		cacheControl?: string,
	): Promise<void> {
		const targetKey = normalizeKey(key);

		let etag: string | undefined;
		try {
			const headRes = await client.send(
				new HeadObjectCommand({ Bucket: bucket, Key: targetKey }),
			);
			etag = headRes.ETag?.replace(/"/g, "");
		} catch (e: unknown) {
			const err = e as { $metadata?: { httpStatusCode?: number } };
			if (err.$metadata?.httpStatusCode !== 404) throw e;
		}

		const tempKey = `${targetKey}.tmp-${randomUUID()}`;
		await client.send(
			new PutObjectCommand({
				Bucket: bucket,
				Key: tempKey,
				Body: body,
				ContentType: contentType,
				CacheControl: cacheControl,
			}),
		);

		const cleanupTemp = () =>
			client
				.send(new DeleteObjectCommand({ Bucket: bucket, Key: tempKey }))
				.catch(() => {});

		for (let attempt = 0; attempt < maxRetry; attempt++) {
			try {
				await client.send(
					new CopyObjectCommand({
						Bucket: bucket,
						Key: targetKey,
						CopySource: `/${bucket}/${encodeURIComponent(tempKey)}`,
						CopySourceIfMatch: etag,
						MetadataDirective: "REPLACE",
						ContentType: contentType,
						CacheControl: cacheControl,
					}),
				);
				await cleanupTemp();
				return;
			} catch (e: unknown) {
				const err = e as {
					$metadata?: { httpStatusCode?: number };
					name?: string;
				};
				const precond =
					err.$metadata?.httpStatusCode === 412 ||
					err.name === "PreconditionFailed";
				if (!precond || attempt === maxRetry - 1) {
					await cleanupTemp();
					throw e;
				}
				const headRes = await client.send(
					new HeadObjectCommand({ Bucket: bucket, Key: targetKey }),
				);
				etag = headRes.ETag?.replace(/"/g, "");
			}
		}
	}

	return {
		async getJson<T extends z.ZodObject>(
			params: GetJsonParams<T>,
		): Promise<z.infer<T>> {
			const res = await client.send(
				new GetObjectCommand({ Bucket: config.bucket, Key: params.path }),
			);
			if (!res.Body || !isReadable(res.Body as Readable)) {
				throw new Error("Invalid body returned from storage");
			}
			const bytes = await streamToUint8Array(res.Body as Readable);
			const obj = JSON.parse(Buffer.from(bytes).toString("utf8"));
			return params.schema ? params.schema.parse(obj) : obj;
		},

		async setJson<T extends z.ZodObject>(
			params: SetJsonParams<T>,
		): Promise<void> {
			const data = params.schema
				? params.schema.parse(params.data)
				: params.data;
			const body = JSON.stringify(data);
			await atomicWrite(params.path, body, "application/json");
		},

		async getBlob(path: string): Promise<Uint8Array> {
			const res = await client.send(
				new GetObjectCommand({ Bucket: config.bucket, Key: path }),
			);
			if (!res.Body || !isReadable(res.Body as Readable)) {
				throw new Error("Invalid body returned from storage");
			}
			return await streamToUint8Array(res.Body as Readable);
		},

		async setBlob(path: string, data: Uint8Array): Promise<void> {
			await client.send(
				new PutObjectCommand({ Bucket: config.bucket, Key: path, Body: data }),
			);
		},

		async copy(source: string, destination: string): Promise<void> {
			await client.send(
				new CopyObjectCommand({
					Bucket: config.bucket,
					Key: destination,
					CopySource: `${config.bucket}/${source}`,
				}),
			);
		},

		async remove(path: string): Promise<void> {
			await client.send(
				new DeleteObjectCommand({ Bucket: config.bucket, Key: path }),
			);
		},
	};
}
