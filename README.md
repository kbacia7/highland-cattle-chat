# highland-cattle-chat

Monorepo project of simple chat, build on Fastify, React, Prisma, TypeScript and Tailwind.

Application is scalable and requires MongoDB, Redis and Google Storage API to work.

That is pretty example how I write code, I really don't recommend using it, I created it to have one more project in portfolio.

I'm not going to support or maintain it.

## How to deploy

In `/kubernetes` directory I putted files which I use to deploy inastructure on self-hosted k8s cluster. All files have comments, but keep in mind, that my k8s cluster uses [Traffik CRD](https://doc.traefik.io/traefik/providers/kubernetes-crd/) and [local-path-provisioner](https://github.com/rancher/local-path-provisioner) for PVC.

Chat application is scalable and should work properly with many replicas. Live demo of application is available at https://chatapp.kbac.dev/

## How to run locally

Both backend and frontend (in `/packages`) contains simple README with information of used tech-stack and how to run application locally.
