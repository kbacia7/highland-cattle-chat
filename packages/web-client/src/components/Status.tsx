import { cx } from "class-variance-authority";

import { USER_STATUS } from "~/consts";

import type { UserStatus } from "~/consts";

export type StatusProps = {
  status: UserStatus;
};

const Status = ({ status }: StatusProps) => (
  <p
    className={cx("text-lg", {
      "text-green-900": status === USER_STATUS.ONLINE,
      "text-red-900": status === USER_STATUS.OFFLINE,
    })}
  >
    {status}
  </p>
);

export default Status;
