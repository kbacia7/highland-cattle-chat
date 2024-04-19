import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";

import { searchUserSchema } from "@highland-cattle-chat/shared";

import { USER_STATUS } from "@consts/index";

import {
  useCreateConversationMutation,
  useSearchUserQuery,
} from "@slices/conversationsSlice";

import Input from "@components/Input";
import { Alert } from "@components/Alert";
import Modal from "@components/Modal";
import SomethingGoneWrong from "@components/SomethingGoneWrong";
import Conversation, { ConversationSkeleton } from "@components/Conversation";

import UpdateAccountForm from "./containers/UpdateAccountForm";

import SettingsIcon from "../icons/Settings";

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

type ConversationItemProps = {
  id: string;
  displayName: string;
  image: string;
};

type Props = {
  conversations: ConversationItemProps[];
  loading?: boolean;
  error?: boolean;
};

const ConversationsList = ({ conversations, loading, error }: Props) => (
  <ul className="flex flex-col items-center">
    {loading && <ConversationSkeleton />}
    {error && <SomethingGoneWrong />}
    {!loading &&
      conversations?.map(({ id, displayName, image }) => (
        <Link to={`conversation/${id}`} className="w-full" key={id}>
          <Conversation
            lastMessage="text"
            status={USER_STATUS.ONLINE}
            title={displayName}
            image={image}
          />
        </Link>
      ))}
  </ul>
);

const UsersList = ({ phrase }: { phrase: string }) => {
  const parseResults = searchUserSchema.safeParse({ phrase });
  const [createConversation] = useCreateConversationMutation();
  const { currentData: conversations, isError } = useSearchUserQuery(
    { phrase },
    { skip: !parseResults.success },
  );
  const navigate = useNavigate();

  const onClick = async (id: string) => {
    try {
      const res = await createConversation({ id }).unwrap();
      navigate(`conversation/${res.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {(isError || !parseResults.success) && (
        <Alert className="mt-2" type="error">
          <span>
            {!parseResults?.success
              ? parseResults.error.format().phrase?._errors.join("")
              : "Unknown error"}
          </span>
        </Alert>
      )}

      <ul className="flex flex-col items-center">
        {conversations?.map(({ id, displayName, image }) => (
          <Link to="#" key={id} className="w-full" onClick={() => onClick(id)}>
            <Conversation
              status={USER_STATUS.UNKNOWN}
              title={displayName}
              image={image}
            />
          </Link>
        ))}
      </ul>
    </>
  );
};

const Nav = ({ conversations, loading, error }: Props) => {
  const [searchPhrase, setSearchPhrase] = useState<string>();

  const onSearch = async (phrase: string) => {
    setSearchPhrase(phrase);
  };

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
                <SettingsIcon className="inline ml-3" size={36} />
              </button>
            )}
          >
            <UpdateAccountForm />
          </Modal>
        </div>

        <SearchInput color="white" onSearch={onSearch} />
      </div>

      {!!searchPhrase?.length && <UsersList phrase={searchPhrase} />}

      {!searchPhrase?.length && (
        <ConversationsList
          conversations={conversations}
          loading={loading}
          error={error}
        />
      )}
    </nav>
  );
};

export default Nav;
