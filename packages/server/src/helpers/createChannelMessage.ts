export type ChannelMessage = {
  serverId: string;
  userId: string;
  data: string;
};

const createChannelMessage = (
  serverId: string,
  userId: string,
  data: unknown,
) =>
  JSON.stringify({
    serverId,
    userId,
    data: JSON.stringify(data),
  } as ChannelMessage);

export default createChannelMessage;
