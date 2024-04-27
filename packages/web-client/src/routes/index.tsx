import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";

import { MessageTypes } from "@highland-cattle-chat/shared";

import { useAppDispatch, useAppSelector } from "@slices/hooks";

import Nav from "@components/Nav";
import {
  extendedApiSlice,
  useLoadConversationsQuery,
} from "@slices/conversationsSlice";

import type { OutcomeMessage } from "@highland-cattle-chat/shared";

const RootRoute = () => {
  const {
    currentData: conversations,
    isLoading,
    isError,
  } = useLoadConversationsQuery(undefined, {
    pollingInterval: 30000,
  });

  const webWorkerInitialized = useRef<boolean>(false);
  const user = useAppSelector((state) => state.loggedUser);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (user.userId && !webWorkerInitialized.current) {
      webWorkerInitialized.current = true;
      new Worker(new URL("../web-worker", import.meta.url), {
        type: "module",
      });
    }
  }, [user]);

  useEffect(() => {
    const channel = new BroadcastChannel("received_messages");
    channel.addEventListener("message", (event) => {
      const message: OutcomeMessage = Array.isArray(event.data)
        ? event.data.at(-1)
        : event.data;

      if (message.type === MessageTypes.TEXT) {
        dispatch(
          extendedApiSlice.util.updateQueryData(
            "loadConversations",
            undefined,
            (conversations) => {
              const conversation = conversations.find(
                (c) => c.id === message.conversationId,
              );

              if (
                conversation?.messages.length &&
                message.content?.length &&
                message.userId
              ) {
                conversation.messages = [
                  {
                    content: message.content,
                    userId: message.userId,
                  },
                ];

                conversation.messages[0].content = message.content;
              }
            },
          ),
        );
      }
    });

    return () => channel.close();
  }, [dispatch]);

  return (
    <>
      <div className="flex h-full w-full lg:w-auto">
        <div className="lg:block w-full lg:w-auto">
          <Nav
            error={isError}
            loading={isLoading}
            conversations={(conversations || []).map(
              ({ id, participants, messages }) => {
                const participant = participants.find(
                  (p) => p.user.id != user.userId,
                );

                if (!participant?.user)
                  throw new Error("Error during load conversations list");

                const { image, displayName, online } = participant.user;

                return {
                  id,
                  displayName,
                  image,
                  online,
                  lastMessage: messages?.[0],
                };
              },
            )}
          />
        </div>
        <Outlet />
      </div>
    </>
  );
};

export default RootRoute;
