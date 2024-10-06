import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    GetCommand,
    GetCommandInput,
    PutCommand,
    PutCommandInput,
} from '@aws-sdk/lib-dynamodb';

export const runtime = 'nodejs';

// const dynamodbClient = new DynamoDBClient({
//     region: process.env.AWS_REGUION,
// });

// export const docClient = DynamoDBDocumentClient.from(dynamodbClient);

export async function GET() {
    try {
        // const command = new GetCommand({
        //     TableName: 'Article',
        //     Key: {
        //         category: 'ENGINEERING',
        //         articleId: 'f825ab2c-9771-4446-88b9-b4716a7a355c',
        //     },
        // });
        // const result = await docClient.send(command);
        return NextResponse.json({
            id: 1,
            category: 'engineering',
            title: 'title1',
            content: 'content',
            editedAt: Date.now(),
            publishedAt: Date.now(),
        });
    } catch (e) {
        return NextResponse.json({ message: 'Internal Server Error.' });
    }
}
