import { useState, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";

import { MessageTypes } from "@highland-cattle-chat/shared";

import {
  incrementUnreadedConversationMessages,
  updateLastMessage,
} from "@slices/conversations/slice";

import { useAppDispatch, useAppSelector } from "@slices/hooks";

import Input from "@components/Input";
import Modal from "@components/Modal";

import UpdateAccountForm from "./containers/UpdateAccountForm";
import UsersList from "./containers/UsersList";
import ConversationsList from "./containers/ConversationsList";

import SettingsIcon from "../icons/Settings";

import type { OutcomeMessage } from "@highland-cattle-chat/shared";
import type { InputProps } from "../Input";

const SearchInput = ({
  onSearch,
  ...props
}: {
  onSearch: (value: string) => void;
} & InputProps) => {
  const onChange = useDebouncedCallback((value) => onSearch(value), 500);

  return (
    <Input
      placeholder={"Search by display name..."}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  );
};

const Nav = () => {
  const dispatch = useAppDispatch();
  const [searchPhrase, setSearchPhrase] = useState<string>();
  const loggedUser = useAppSelector((state) => state.user);
  const onSearch = async (phrase: string) => {
    setSearchPhrase(phrase);
  };

  useEffect(() => {
    const channel = new BroadcastChannel("received_messages");
    channel.addEventListener("message", (event) => {
      const message: OutcomeMessage = Array.isArray(event.data)
        ? event.data.at(-1)
        : event.data;

      if (message.type === MessageTypes.TEXT) {
        if (
          message.content?.length &&
          message.userId &&
          message.conversationId
        ) {
          dispatch(
            updateLastMessage({
              content: message.content as string,
              userId: message.userId as string,
              createdAt: new Date().toISOString(),
              conversationId: message.conversationId as string,
            }),
          );

          if (message.userId !== loggedUser.userId)
            dispatch(
              incrementUnreadedConversationMessages({
                conversationId: message.conversationId,
              }),
            );
        }
      }
    });

    return () => channel.close();
  }, [dispatch, loggedUser]);

  return (
    <nav className="h-full bg-blue-100 overflow-auto lg:min-w-[400px] lg:max-w-[400px]">
      <div className="mx-4">
        <div className="flex flex-row align-baseline py-2">
          <h2 className="text-3xl font-bold text-blue-900 inline">
            Conversations
          </h2>
          <Modal
            title="Update your account"
            toggleRenderFn={({ openModal }) => (
              <button onClick={openModal} color="secondary">
                <SettingsIcon className="inline ml-3 text-blue-900" size={36} />
              </button>
            )}
          >
            <UpdateAccountForm />
          </Modal>
        </div>

        <SearchInput color="white" onSearch={onSearch} />
      </div>

      {!!searchPhrase?.length && <UsersList phrase={searchPhrase} />}

      {!searchPhrase?.length && <ConversationsList />}
    </nav>
  );
};

export default Nav;
