"use client";

import qs from "query-string";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Video, VideoOff } from "lucide-react";

import { ActionTooltip } from "../action-tooltip";

export const ChatVideoButton = () => {
    const pathName = usePathname();
    const router = useRouter();

    const searchParams = useSearchParams();
    const isVideo = searchParams?.get("video");

    const Icon = isVideo ? VideoOff : Video;
    const tooltipLabel = isVideo ? "End Video Call" : "Start Video";

    const onClick = () => {
        const url = qs.stringifyUrl(
            {
                url: pathName || "",
                query: {
                    video: isVideo ? undefined : true,
                },
            },
            { skipNull: true }
        );
        router.push(url);
    };

    return (
        <ActionTooltip side="bottom" label={tooltipLabel}>
            <button
                className="hover:opacity-75 transition mr-4"
                onClick={onClick}
            >
                <Icon className=" h6 w6 text-zinc-500 dark:text-zinc-400" />
            </button>
        </ActionTooltip>
    );
};
