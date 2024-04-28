# highland-cattle-chat/server

## Techstack
- Fastify
- Prisma
- Vitest
- Eslint, Prettier
- Vite
- Zod
- Typescript

## Run
1. Run somewhere mongodb database and redis instance 
2. Generate self-signed locally-trusted certificate (e.g. by [mkcert](https://github.com/FiloSottile/mkcert))
3. Rename `.env.example` to `.env` and fill env values
4. Seed database and Google Storage `yarn run seed`
4. `yarn run start`
