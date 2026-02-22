import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
const filePath = path.join(process.cwd(), 'app', 'api', 'h3', 'manifest', 'manifest.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    const manifest = JSON.parse(fileContent);

    return NextResponse.json(manifest);
  } catch (error) {
    return NextResponse.json({ error: 'Manifest not found' }, { status: 404 });
  }
}