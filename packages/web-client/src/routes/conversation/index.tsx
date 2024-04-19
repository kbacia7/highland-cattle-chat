import { useEffect, useState } from "react";
import { nanoid } from "@reduxjs/toolkit";
import { useParams } from "react-router-dom";

import { MessageTypes } from "@highland-cattle-chat/shared";

import Chat from "@components/Chat";
import ConversationHeader from "@components/ConversationHeader";
import Spinner from "@components/Spinner";
import SomethingGoneWrong from "@components/SomethingGoneWrong";

import { InternalMessageTypes } from "@consts/broadcast";
import {
  useLazyLoadConversationQuery,
  useLoadConversationQuery,
} from "@slices/conversationsSlice";
import { useAppSelector } from "@slices/hooks";

import SendInput from "./SendInput";

import type {
  IncomeMessage,
  LoadConversationResponse,
  OutcomeMessage,
} from "@highland-cattle-chat/shared";

const transformOutcomeMessage = (message: OutcomeMessage) => {
  const messageRecord: LoadConversationResponse["messages"][0] = {
    content: message.content ?? null,
    attachment: message.attachment ?? null,
    createdAt: new Date(),
    id: nanoid(),
    userId: message.userId,
  };

  return messageRecord;
};

const ConversationRoute = () => {
  const { id: conversationId } = useParams();

  const { userId } = useAppSelector((state) => state.loggedUser);
  const [lazyLoadConversation] = useLazyLoadConversationQuery();
  const { currentData, isLoading, isError } = useLoadConversationQuery(
    {
      id: conversationId ?? "",
    },
    { refetchOnMountOrArgChange: true },
  );

  const [messages, setMessages] = useState<
    LoadConversationResponse["messages"]
  >([]);

  useEffect(() => {
    if (!isLoading) {
      const internalChannel = new BroadcastChannel("internal_messages");
      internalChannel.postMessage({
        type: InternalMessageTypes.READY,
      });
    }
  }, [isLoading]);

  useEffect(() => {
    const channel = new BroadcastChannel("received_messages");
    channel.addEventListener("message", (event) => {
      const message: OutcomeMessage | OutcomeMessage[] = event.data;
      if (Array.isArray(message)) {
        setMessages((value) => [
          ...value,
          ...message
            .filter(
              (m) =>
                m.type === MessageTypes.TEXT &&
                m.conversationId === conversationId,
            )
            .map((msg) => transformOutcomeMessage(msg)),
        ]);
      } else {
        if (
          message.type === MessageTypes.TEXT &&
          message.conversationId === conversationId
        )
          setMessages((value) => [...value, transformOutcomeMessage(message)]);
      }
    });

    return () => channel.close();
  }, [conversationId]);

  useEffect(() => {
    setMessages(currentData?.messages ?? []);
  }, [currentData]);

  const participant = currentData?.participants.find(
    (p) => p.user.id !== userId,
  );

  const chatImage = participant?.user.image;
  if (isLoading || !currentData?.messages) {
    return (
      <div className="flex items-center justify-center w-full">
        <Spinner className="w-1/4" />
      </div>
    );
  }

  if (!chatImage || isError) {
    return <SomethingGoneWrong />;
  }

  const onLoadMore = async () => {
    const { messages: newMessages } = await lazyLoadConversation({
      id: conversationId ?? "",
      limit: 20,
      last: messages[0].id,
    }).unwrap();

    setMessages(newMessages.concat(messages));
  };

  return (
    <main className="w-full absolute bg-white lg:relative">
      <div className="flex flex-col h-full">
        <ConversationHeader image={chatImage} participant={participant} />

        <Chat
          messages={messages}
          image={chatImage}
          onLoadMore={
            currentData.count > messages.length ? onLoadMore : undefined
          }
        />

        <SendInput
          onSend={async ({ message, attachment }) => {
            const channel = new BroadcastChannel("sended_messages");
            const msg: IncomeMessage = {
              userId: userId as string,
              conversationId,
              type: MessageTypes.TEXT,
              content: message,
              attachment,
            };

            channel.postMessage(msg);
          }}
        />
      </div>
    </main>
  );
};

export default ConversationRoute;
