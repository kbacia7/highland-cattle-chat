export type ChannelMessage = {
  serverId: string;
  data: string;
};

const createChannelMessage = (serverId: string, data: unknown) =>
  JSON.stringify({
    serverId,
    data: JSON.stringify(data),
  } as ChannelMessage);

export default createChannelMessage;
