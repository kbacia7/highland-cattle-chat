import { Link } from "react-router-dom";

import { useLoadConversationsQuery } from "~/slices/conversationsSlice";

import Add from "./icons/Add";
import ProfileImage from "./ProfileImage";
import Spinner from "./Spinner";

const Nav = () => {
  const { currentData, isLoading, isError } = useLoadConversationsQuery();

  return (
    <nav className="h-full bg-blue-500 w-16">
      <ul className="flex flex-col items-center">
        <li>
          <button>
            <Add />
          </button>
        </li>
        {/* TODO: Add error handling */}
        {(isLoading || isError) && (
          <li className="mb-3">
            <Spinner />
          </li>
        )}
        {!isLoading &&
          !isError &&
          currentData?.map(({ id, image }) => (
            <li className="mb-3" key={id}>
              <Link to={`/conversation/${id}`}>
                <ProfileImage src={image} size={40} />
              </Link>
            </li>
          ))}
      </ul>
    </nav>
  );
};

export default Nav;
