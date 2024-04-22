import { cx } from "class-variance-authority";

import { USER_STATUS } from "@consts/index";

import type { UserStatus } from "@consts/index";

export type StatusProps = {
  status: UserStatus;
};

const Status = ({ status }: StatusProps) => (
  <p
    className={cx("text-lg capitalize", {
      "text-green-900": status === USER_STATUS.ONLINE,
      "text-red-900": status === USER_STATUS.OFFLINE,
      "text-gray-700": status === USER_STATUS.UNKNOWN,
    })}
  >
    {status}
  </p>
);

export default Status;
