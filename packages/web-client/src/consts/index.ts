export const USER_STATUS = {
  ONLINE: "online",
  OFFLINE: "offline",
  UNKNOWN: "unknown",
};

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];
