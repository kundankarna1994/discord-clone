import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
    req: Request,
    { params }: { params: { memberId: string } }
) {
    try {
        const profile = await currentProfile();
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        const { searchParams } = new URL(req.url);
        const serverId = searchParams.get("serverId");
        if (!serverId || !params.memberId) {
            return new NextResponse("Missing required parameters", {
                status: 400,
            });
        }

        const server = await db.server.findFirst({
            where: {
                id: serverId,
                profileId: profile.id,
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
                members: {
                    deleteMany: {
                        id: params.memberId,
                        profileId: {
                            not: profile.id,
                        },
                    },
                },
            },
            include: {
                members: {
                    include: {
                        profile: true,
                    },
                    orderBy: {
                        role: "asc",
                    },
                },
            },
        });

        return NextResponse.json(updatedServer);
    } catch (error) {
        console.log("MEMBER ID DELETE", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { memberId: string } }
) {
    try {
        const profile = await currentProfile();
        const { searchParams } = new URL(req.url);
        const { role } = await req.json();

        const serverId = searchParams.get("serverId");

        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!serverId || !params.memberId) {
            return new NextResponse("Missing required parameters", {
                status: 400,
            });
        }
        const server = await db.server.findFirst({
            where: {
                id: serverId,
                profileId: profile.id,
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
                members: {
                    update: {
                        where: {
                            id: params.memberId,
                        },
                        data: {
                            role: role,
                        },
                    },
                },
            },
            include: {
                members: {
                    include: {
                        profile: true,
                    },
                    orderBy: {
                        role: "asc",
                    },
                },
            },
        });

        return NextResponse.json(updatedServer);
    } catch (error) {
        console.log("[MEMBERS ID PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
