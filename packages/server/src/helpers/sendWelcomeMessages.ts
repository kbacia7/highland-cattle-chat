import type { FastifyInstance } from "fastify";

const sendWelcomeMessages = async (
  fastify: FastifyInstance,
  recipientId: string,
) => {
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
          data: [
            {
              userId: fastify.guideUser.id,
              content: "Welcome to the chat!",
            },
            {
              userId: fastify.guideUser.id,
              content:
                "It's one of my portfolio projects, full README you can find in repository https://github.com/kbacia7/highland-cattle-chat",
            },
            {
              userId: fastify.guideUser.id,
              content:
                "At this moment you can search people by using input on the left, but as you can guess, there's no many accounts. Here's also support for sending images",
            },
            {
              userId: fastify.guideUser.id,
              content:
                "Project have a lot of tests written in Jest and Cypress, I wrote it with scalablity in mind, app uses MongoDB to store data, Redis for cache and Websockets for real-time communication",
            },
            {
              userId: fastify.guideUser.id,
              content:
                "In repository you'll find more info about how to run it and technologies, but I used also a.o.: Typescript, Fastify, React, Prisma, Tailwind",
            },
          ],
        },
      },
    },
  });
};

export default sendWelcomeMessages;
