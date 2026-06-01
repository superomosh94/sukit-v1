import { NextRequest, NextResponse } from 'next/server';
import {
  uploadFile,
  listMedia,
  getMedia,
  deleteMedia,
  updateMedia,
  bulkDelete,
} from '../../controllers/mediaController';
import {
  listFolders,
  createFolder,
  renameFolder,
  deleteFolder,
} from '../../folder/folderController';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get('siteId');
  const id = searchParams.get('id');
  const folderId = searchParams.get('folderId');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');

  if (id) {
    const media = await getMedia(id);
    return NextResponse.json(media);
  }

  if (!siteId)
    return NextResponse.json({ error: 'siteId required' }, { status: 400 });
  const result = await listMedia(siteId, folderId, page, limit);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const siteId = formData.get('siteId') as string;
  const folderId = formData.get('folderId') as string | undefined;

  if (!file || !siteId) {
    return NextResponse.json(
      { error: 'file and siteId required' },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadFile(
    buffer,
    file.name,
    file.type,
    siteId,
    folderId
  );
  return NextResponse.json(result, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const ids = searchParams.get('ids');

  if (ids) {
    await bulkDelete(ids.split(','));
    return NextResponse.json({ success: true });
  }

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  await deleteMedia(id);
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  const { id, ...data } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const result = await updateMedia(id, data);
  return NextResponse.json(result);
}
