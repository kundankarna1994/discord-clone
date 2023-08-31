"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { useModal } from "@/hooks/use-modal-store";
import { Button } from "../ui/button";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import qs from "query-string";

export const DeleteChannelModal = () => {
    const {
        isOpen,
        onClose,
        type,
        data: { channel, server },
    } = useModal();
    const isModalOpen = isOpen && type === "deleteChannel";
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);

    const onClick = async () => {
        try {
            const url = qs.stringifyUrl({
                url: `/api/channels/${channel?.id}`,
                query: {
                    serverId: server?.id,
                },
            });

            setIsLoading(true);

            await axios.delete(url);
            router.refresh();
            router.push(`/servers/${server?.id}`);
            onClose();
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white text-black p-0 overflow-hidden">
                <DialogHeader className="pt-8 px-6">
                    <DialogTitle className="text-2xl text-center font-bold">
                        Delete Channel
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                        Are you sure you want to delete ? <br />
                        <span className=" font-semibold text-indigo-500 ml-1 mr-1">
                            #{channel?.name}
                        </span>
                        will be permanently deleted.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className=" bg-gray-100 px-6 py-4">
                    <div className=" flex items-center justify-between w-full">
                        <Button
                            disabled={isLoading}
                            variant="ghost"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={isLoading}
                            variant="primary"
                            onClick={onClick}
                        >
                            Confirm
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
