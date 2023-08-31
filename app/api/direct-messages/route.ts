import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { NextRequest, NextResponse } from "next/server";
import { DirectMessage, MemberRole, Message } from "@prisma/client";

const MESSAGE_BATCH = 10;

export async function GET(req: Request) {
    try {
        const profile = await currentProfile();
        if (!profile) {
            throw new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);

        const cursor = searchParams.get("cursor");
        const conversationId = searchParams.get("conversationId");

        if (!conversationId) {
            throw new NextResponse("Missing Conversation", { status: 400 });
        }

        let messages: DirectMessage[] = [];

        if (cursor) {
            messages = await db.directMessage.findMany({
                take: MESSAGE_BATCH,
                skip: 1,
                cursor: {
                    id: cursor,
                },
                where: {
                    conversationId: conversationId as string,
                },
                include: {
                    member: {
                        include: {
                            profile: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        } else {
            messages = await db.directMessage.findMany({
                take: MESSAGE_BATCH,
                where: {
                    conversationId: conversationId as string,
                },
                include: {
                    member: {
                        include: {
                            profile: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        }
        let nextCursor = null;
        if (messages.length === MESSAGE_BATCH) {
            nextCursor = messages[MESSAGE_BATCH - 1].id;
        }
        return NextResponse.json({ items: messages, nextCursor });
    } catch (error) {
        console.log("[DIRECT MESSAGES]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
