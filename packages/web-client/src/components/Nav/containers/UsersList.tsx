import { Link, useNavigate } from "react-router-dom";

import { searchUserSchema } from "@highland-cattle-chat/shared";

import {
  useCreateConversationMutation,
  useSearchUserQuery,
} from "@slices/conversations/api";
import { generateConversationUrl } from "@utils/urlSchemas";

import { Alert } from "@components/Alert";
import Conversation from "@components/Conversation";

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
      navigate(generateConversationUrl(res.id));
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
        {conversations?.map(({ id }) => (
          <Link to="#" key={id} className="w-full" onClick={() => onClick(id)}>
            <Conversation id={id} />
          </Link>
        ))}
      </ul>
    </>
  );
};

export default UsersList;
