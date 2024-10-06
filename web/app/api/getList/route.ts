import type { NextApiRequest, NextApiResponse } from 'next';

export const runtime = 'nodejs';

export async function GET(req: NextApiRequest, res: NextApiResponse) {
    res.status(200).json([
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
