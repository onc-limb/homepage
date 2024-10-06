import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest, res: NextResponse) {
    return NextResponse.json([
        {
            id: 1,
            category: 'engineering',
            title: 'title1',
            content: 'content',
            editedAt: Date.now(),
            publishedAt: Date.now(),
        },
        {
            id: 2,
            category: 'engineering',
            title: 'title2',
            content: 'content',
            editedAt: Date.now(),
            publishedAt: Date.now(),
        },
    ]);
}
