import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextRequest, NextResponse } from 'next/server'

function isAuthorized(request: Request): boolean {
  const adminKey = process.env.BLOB_ADMIN_KEY
  if (!adminKey) return false
  const provided =
    (request.headers.get('x-blob-admin-key') as string | null) ??
    new URL(request.url).searchParams.get('admin_key')
  return provided === adminKey
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = clientPayload ? JSON.parse(clientPayload) : {}

        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'application/pdf',
            'text/plain',
            'text/markdown',
            'application/json',
          ],
          addRandomSuffix: true,
          maximumSizeInBytes: 10 * 1024 * 1024,
          tokenPayload: JSON.stringify({
            fileName: payload.fileName,
            fileType: payload.fileType,
            fileSize: payload.fileSize,
            uploadedAt: new Date().toISOString(),
          }),
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Blob upload completed:', {
          url: blob.url,
          pathname: blob.pathname,
          tokenPayload,
        })
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error('Client upload error:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    )
  }
}