import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { set } from "idb-keyval";

import { useAppSelector } from "~/slices/hooks";
import { useCreateFakeUserMutation } from "~/slices/loggedUserSlice";

import {
  PRIVATE_KEY_ITEM_NAME,
  PRIVATE_KEY_PASSPHRASE_ITEM_NAME,
  PUBLIC_KEY_ITEM_NAME,
  USER_ID_KEY_ITEM_NAME,
} from "~/utils/localStorage";

import Nav from "../components/Nav";

const RootRoute = () => {
  const user = useAppSelector((state) => state.loggedUser);
  const [createFakeUser] = useCreateFakeUserMutation();
  useEffect(() => {
    (async () => {
      if (user.userId) {
        return;
      }

      const newUser = await createFakeUser().unwrap();
      await set(USER_ID_KEY_ITEM_NAME, newUser.userId);
      await set(PRIVATE_KEY_PASSPHRASE_ITEM_NAME, newUser.passphrase);
      await set(PRIVATE_KEY_ITEM_NAME, newUser.privateKey);
      await set(PUBLIC_KEY_ITEM_NAME, newUser.publicKey);
    })();
  }, [createFakeUser, user]);

  if (user.userId) {
    new Worker(new URL("../web-worker", import.meta.url), {
      type: "module",
    });
  }

  return (
    <>
      <div className="flex h-full">
        <Nav />
        <Outlet />
      </div>
    </>
  );
};

export default RootRoute;
