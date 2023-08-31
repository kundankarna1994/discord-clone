import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";

export async function PATCH(
    req: Request,
    { params }: { params: { serverId: string } }
) {
    try {
        const profile = await currentProfile();
        if (!profile) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!params.serverId) {
            return new NextResponse("Missing required parameters", {
                status: 400,
            });
        }
        const server = await db.server.findFirst({
            where: {
                id: params.serverId,
                profileId: profile.id,
            },
        });

        if (!server) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        const updatedServer = await db.server.update({
            where: {
                id: params.serverId,
            },
            data: {
                inviteCode: uuidv4(),
            },
        });

        return NextResponse.json(updatedServer);
    } catch (error) {
        console.log("[SERVER ID]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
