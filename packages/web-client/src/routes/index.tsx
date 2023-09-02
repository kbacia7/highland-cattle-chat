import { Outlet } from "react-router-dom";

import Nav from "../components/Nav";

const RootRoute = () => {
  new Worker(new URL("../web-worker", import.meta.url), {
    type: "module",
  });

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
