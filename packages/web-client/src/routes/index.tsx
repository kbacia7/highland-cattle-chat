import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";

import { useAppSelector } from "~/slices/hooks";

import { useLoadConversationsQuery } from "~/slices/conversationsSlice";

import Nav from "../components/Nav";

const RootRoute = () => {
  const { currentData: conversations } = useLoadConversationsQuery();
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
    //TODO: spinner
    <>
      <div className="flex h-full">
        <div className="hidden lg:block">
          <Nav
            conversations={(conversations || []).map(
              ({ id, title, participants }) => {
                const image =
                  participants.find((p) => p.user.id != user.userId)?.user
                    .image || "";

                return {
                  id,
                  displayName: title,
                  image,
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
