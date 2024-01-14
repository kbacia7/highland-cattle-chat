import { useEffect, useRef } from "react";
import { Outlet, useLoaderData } from "react-router-dom";

import { useAppSelector } from "~/slices/hooks";

import Nav from "../components/Nav";

import type { LoaderData } from "~/types/LoaderData";

import type { conversationsLoader } from "~/main";

const RootRoute = () => {
  const conversations = useLoaderData() as LoaderData<
    typeof conversationsLoader
  >;

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
      <div className="flex h-full">
        <div className="hidden lg:block">
          <Nav conversations={conversations} />
        </div>
        <Outlet />
      </div>
    </>
  );
};

export default RootRoute;
