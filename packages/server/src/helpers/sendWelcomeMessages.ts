import type { FastifyInstance } from "fastify";

const sendWelcomeMessages = async (
  fastify: FastifyInstance,
  recipientId: string,
) => {
  const now = new Date();
  const welcomeMessages = [
    "Welcome to the chat!",
    "It's one of my portfolio projects, full README you can find in repository https://github.com/kbacia7/highland-cattle-chat",
    "At this moment you can search people by using input on the left, but as you can guess, there's no many accounts. App also support for sending images",
    "Project have a tests written in vitest, I wrote it with scalablity in mind, app uses MongoDB to store data, Redis for cache and Websockets for real-time communication",
    "In repository you'll find more info about how to run it and technologies, but I used also a.o.: Typescript, Fastify, React, Prisma, Tailwind",
  ];

  await fastify.prisma.conversation.create({
    data: {
      title: "Mrs. Guide",
      participants: {
        create: [
          {
            userId: fastify.guideUser.id,
          },
          {
            userId: recipientId,
          },
        ],
      },
      messages: {
        createMany: {
          data: welcomeMessages.map((content, extraMs) => ({
            userId: fastify.guideUser.id,
            content,
            createdAt: new Date(now.getTime() + extraMs),
          })),
        },
      },
    },
  });
};

export default sendWelcomeMessages;
