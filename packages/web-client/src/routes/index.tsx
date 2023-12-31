import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { set } from "idb-keyval";

import { useAppSelector } from "~/slices/hooks";
import { useCreateFakeUserMutation } from "~/slices/loggedUserSlice";

import { USER_ID_KEY_ITEM_NAME } from "~/utils/localStorage";

import Nav from "../components/Nav";

const RootRoute = () => {
  const webWorkerInitialized = useRef<boolean>(false);
  const createFakeUserSendedYet = useRef<boolean>(false);
  const user = useAppSelector((state) => state.loggedUser);
  const [createFakeUser] = useCreateFakeUserMutation();

  useEffect(() => {
    if (user.userId || createFakeUserSendedYet.current) {
      return;
    }

    createFakeUserSendedYet.current = true;
    (async () => {
      const newUser = await createFakeUser().unwrap();
      await set(USER_ID_KEY_ITEM_NAME, newUser.userId);
    })();
  }, [createFakeUser, user]);

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
          <Nav />
        </div>
        <Outlet />
      </div>
    </>
  );
};

export default RootRoute;
