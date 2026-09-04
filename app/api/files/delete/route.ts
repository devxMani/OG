import { del } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

function isAuthorized(request: NextRequest): boolean {
  const adminKey = process.env.BLOB_ADMIN_KEY
  if (!adminKey) return false
  const provided =
    (request.headers.get('x-blob-admin-key') as string | null) ??
    request.nextUrl.searchParams.get('admin_key')
  return provided === adminKey
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { pathname } = await request.json()

    if (!pathname) {
      return NextResponse.json(
        { error: 'Pathname is required' },
        { status: 400 }
      )
    }

    await del(pathname)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete file:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}