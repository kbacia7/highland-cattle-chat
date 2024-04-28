import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";

import { useAppSelector } from "@slices/hooks";

import Nav from "@components/Nav";
import { useLoadConversationsQuery } from "@slices/conversations/api";

const RootRoute = () => {
  useLoadConversationsQuery(undefined, {
    pollingInterval: 30000,
  });

  const user = useAppSelector((state) => state.loggedUser);

  const webWorkerInitialized = useRef<boolean>(false);

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
          <Nav />
        </div>
        <Outlet />
      </div>
    </>
  );
};

export default RootRoute;
