# highland-cattle-chat/web-client
## Techstack
* React 18
* React Router 6
* React Redux & RTK
* Zod
* Tailwind
* Vite
* Eslint, Prettier
* Typescript

## Run
1. Rename `.env.example` to `.env` and fill `VITE_GOOGLE_STORAGE_BUCKET_PUBLIC_URL` with your Google Storage bucket url
2. Generate self-signed locally-trusted certificate (e.g. by [mkcert](https://github.com/FiloSottile/mkcert))
3. Change `HTTPS_KEY_PATH` and `HTTPS_CERT_PATH` to correct path (or paste them in directory pointed by default values) 
4. `yarn run dev`
