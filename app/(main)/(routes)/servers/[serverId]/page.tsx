import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";

interface ServerIDPageProps {
    params: {
        serverId: string;
    };
}

const ServerIDPage = async ({ params: { serverId } }: ServerIDPageProps) => {
    const profile = await currentProfile();

    if (!profile) {
        return redirectToSignIn();
    }

    const server = await db.server.findFirst({
        where: {
            id: serverId,
            members: {
                some: {
                    profileId: profile.id,
                },
            },
        },
        include: {
            channels: {
                where: {
                    name: "general",
                },
                orderBy: {
                    createdAt: "asc",
                },
            },
        },
    });

    const initialChannel = server?.channels[0];

    if (initialChannel?.name !== "general") {
        return null;
    }
    return redirect(`/servers/${serverId}/channels/${initialChannel.id}`);
};

export default ServerIDPage;
