import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { MemberRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function DELETE(
    req: Request,
    { params }: { params: { channelId: string } }
) {
    try {
        const profile = await currentProfile();
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        const { searchParams } = new URL(req.url);

        const serverId = searchParams.get("serverId");

        if (!params.channelId || !serverId) {
            return new NextResponse("Missing required parameters", {
                status: 400,
            });
        }

        const server = await db.server.findFirst({
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

        if (!server) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        const updatedServer = await db.server.update({
            where: {
                id: serverId,
            },
            data: {
                channels: {
                    delete: {
                        id: params.channelId,
                    },
                },
            },
        });

        return NextResponse.json(updatedServer);
    } catch (error) {
        console.log("[CHANNEL DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { channelId: string } }
) {
    try {
        const profile = await currentProfile();
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        const { name, type } = await req.json();
        const { searchParams } = new URL(req.url);

        const serverId = searchParams.get("serverId");

        if (!params.channelId || !serverId) {
            return new NextResponse("Missing required parameters", {
                status: 400,
            });
        }
        if (name === "general") {
            return new NextResponse("Name cannot be general", {
                status: 400,
            });
        }

        const server = await db.server.findFirst({
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

        if (!server) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        const updatedServer = await db.server.update({
            where: {
                id: serverId,
            },
            data: {
                channels: {
                    update: {
                        where: {
                            id: params.channelId,
                        },
                        data: { name, type },
                    },
                },
            },
        });

        return NextResponse.json(updatedServer);
    } catch (error) {
        console.log("[CHANNEL DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
