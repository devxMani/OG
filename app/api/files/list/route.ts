import { list } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

function isAuthorized(request: NextRequest): boolean {
  const adminKey = process.env.BLOB_ADMIN_KEY
  if (!adminKey) return false
  const provided =
    (request.headers.get('x-blob-admin-key') as string | null) ??
    request.nextUrl.searchParams.get('admin_key')
  return provided === adminKey
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { blobs } = await list()

    return NextResponse.json({
      blobs: blobs.map(blob => ({
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
        downloadUrl: blob.downloadUrl,
      })),
    })
  } catch (error) {
    console.error('Failed to list files:', error)
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    )
  }
}