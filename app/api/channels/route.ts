import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { NextRequest, NextResponse } from "next/server";
import { MemberRole } from "@prisma/client";

export async function POST(req: Request) {
    try {
        const { name, type } = await req.json();
        const profile = await currentProfile();
        if (!profile) {
            throw new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const serverId = searchParams.get("serverId");
        if (!serverId) {
            return new NextResponse("Missing required parameters", {
                status: 400,
            });
        }
        if (name === "general") {
            return new NextResponse("Name cannot be general", {
                status: 400,
            });
        }

        const existingServer = await db.server.findFirst({
            where: {
                id: serverId,
                members: {
                    some: {
                        profileId: profile.id,
                        role: {
                            in: [MemberRole.ADMIN, MemberRole.MODERATOR],
                        },
                    },
                },
            },
        });

        if (!existingServer) {
            throw new NextResponse("Unauthorized", { status: 401 });
        }

        const server = await db.server.update({
            where: {
                id: existingServer.id,
            },
            data: {
                channels: {
                    create: {
                        profileId: profile.id,
                        name,
                        type,
                    },
                },
            },
        });

        return NextResponse.json(server);
    } catch (error) {
        console.log("[CHANNEL_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
