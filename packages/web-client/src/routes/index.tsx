import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";

import { useAppSelector } from "~/slices/hooks";

import { useLoadConversationsQuery } from "~/slices/conversationsSlice";

import Nav from "../components/Nav";

const RootRoute = () => {
  const { currentData: conversations, isLoading } = useLoadConversationsQuery();
  const webWorkerInitialized = useRef<boolean>(false);
  const user = useAppSelector((state) => state.loggedUser);

  useEffect(() => {
    if (user.userId && !webWorkerInitialized.current) {
      webWorkerInitialized.current = true;
      new Worker(new URL("../web-worker", import.meta.url), {
        type: "module",
      });
    }
  }, [user]);

  return (
    <>
      <div className="flex h-full w-full lg:w-auto">
        <div className="lg:block w-full lg:w-auto">
          <Nav
            loading={isLoading}
            conversations={(conversations || []).map(({ id, participants }) => {
              const participant = participants.find(
                (p) => p.user.id != user.userId,
              );

              if (!participant?.user)
                throw new Error("Error during load conversations list");

              const { image, displayName } = participant.user;

              return {
                id,
                displayName,
                image,
              };
            })}
          />
        </div>
        <Outlet />
      </div>
    </>
  );
};

export default RootRoute;
