import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(

  request: Request,
  context: { params: Promise<{ filename: string }> }

) {
  const { filename } = await context.params;

  console.log('first filename:', filename);

  // Security: only allow h4_*.json files
  // const fileRegex = /^h4_[a-f0-9]+\.json$/;
  // if (!fileRegex.test(filename)) {
  //   return new NextResponse('Invalid filename', { status: 400 });
  // }


  try {

          console.log('Requested filename:', filename);

const filePath = path.join(process.cwd(), 'app', 'api', 'h3', 'data', filename);

    const fileContent = await fs.readFile(filePath, 'utf8');
    
    console.log('filepath:', filePath);

    return NextResponse.json(JSON.parse(fileContent));

  } catch (error) {

    return NextResponse.json({ error: error }, { status: 404 });

  }
}