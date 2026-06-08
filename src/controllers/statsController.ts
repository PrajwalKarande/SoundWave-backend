import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { Song } from "../Models/Song.js";
import { User } from "../Models/User.js";
import { Artist } from "../Models/Artist.js";

export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const songs = await Song.countDocuments()
        const users = await User.countDocuments()
        const artists = await Artist.countDocuments()
        res.status(200).json({ songs, users, artists })
    } catch (error) {
        res.status(500).json({ message: "Server error, please try after some time" })
    }
}

// Cloudflare R2 operation classification
// https://developers.cloudflare.com/r2/pricing/
const CLASS_A_ACTIONS = new Set([
    'ListBuckets', 'ListObjects', 'ListObjectsV2', 'ListMultipartUploads', 'ListParts',
    'PutObject', 'CopyObject', 'CreateMultipartUpload', 'CompleteMultipartUpload',
    'UploadPart', 'UploadPartCopy',
])
const CLASS_B_ACTIONS = new Set([
    'GetObject', 'HeadObject', 'HeadBucket',
    'GetBucketCors', 'GetBucketLifecycleConfiguration', 'GetBucketEncryption', 'GetBucketLocation',
])

const R2_QUERY = `
query R2Analytics(
  $accountTag: String!
  $bucketName: String!
  $opsStart: Time!
  $storageStart: Time!
  $end: Time!
) {
  viewer {
    accounts(filter: { accountTag: $accountTag }) {
      storage: r2StorageAdaptiveGroups(
        filter: { bucketName: $bucketName, datetime_geq: $storageStart, datetime_leq: $end }
        limit: 1
      ) {
        max {
          objectCount
          payloadSize
        }
      }
      operations: r2OperationsAdaptiveGroups(
        filter: { bucketName: $bucketName, datetime_geq: $opsStart, datetime_leq: $end }
        limit: 10000
      ) {
        sum { requests }
        dimensions { actionType }
      }
    }
  }
}`

export const getR2Stats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const token      = process.env.CF_API_TOKEN
        const accountId  = process.env.R2_ACCOUNT_ID
        const bucketName = process.env.R2_BUCKET_NAME

        if (!token || !accountId || !bucketName) {
            res.status(503).json({ message: "Cloudflare credentials not configured" })
            return
        }

        const now = new Date()
        // Operations: current billing month (Class A/B counts reset monthly)
        const opsStart = new Date(now.getFullYear(), now.getMonth(), 1)
        // Storage: last 48 h — ensures at least one sampled data point is returned
        const storageStart = new Date(now.getTime() - 48 * 60 * 60 * 1000)

        const cfRes = await fetch('https://api.cloudflare.com/client/v4/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: R2_QUERY,
                variables: {
                    accountTag:   accountId,
                    bucketName,
                    opsStart:     opsStart.toISOString(),
                    storageStart: storageStart.toISOString(),
                    end:          now.toISOString(),
                },
            }),
        })

        const json = await cfRes.json() as Record<string, unknown>

        if (Array.isArray((json as any).errors) && (json as any).errors.length > 0) {
            console.error("Cloudflare GraphQL errors:", (json as any).errors)
            res.status(502).json({ message: "Cloudflare API error", errors: (json as any).errors })
            return
        }

        const account = (json as any).data?.viewer?.accounts?.[0]

        // Storage snapshot
        const storageMax = account?.storage?.[0]?.max
        const storage = {
            bytes:       storageMax?.payloadSize     ?? 0,
            objectCount: storageMax?.objectCount    ?? 0,
        }

        // Operations — split into Class A, Class B, Free (Delete)
        const ops: Array<{ sum: { requests: number }; dimensions: { actionType: string } }> =
            account?.operations ?? []

        let classA = 0, classB = 0, free = 0
        for (const op of ops) {
            const action = op.dimensions?.actionType ?? ''
            const count  = op.sum?.requests ?? 0
            if      (CLASS_A_ACTIONS.has(action)) classA += count
            else if (CLASS_B_ACTIONS.has(action)) classB += count
            else                                  free   += count
        }

        res.status(200).json({
            storage,
            operations: {
                classA,
                classB,
                free,
                total: classA + classB + free,
                period: {
                    start: opsStart.toISOString(),
                    end:   now.toISOString(),
                },
            },
        })
    } catch (error) {
        console.error("Error fetching R2 stats:", error)
        res.status(500).json({ message: "Failed to fetch R2 stats", error })
    }
}