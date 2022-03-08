This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Requirements

- Node v16
- Docker
- Docker-Compose

## Getting Started

First, create a .env file at the project root fullfilling the template bellow:
```env
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_USER=meu_porquinho
MONGO_PASS=meu_porquinho
MONGO_DB=meu_porquinho
JWT_SECRET=secret
BW_ENCRYPTION_KEY=supersecret
```

Second, run setup the database using:
```bash
docker-compose up
```

Third, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
## External Resources
- Font Awesome: Some icons are provided by font awesome and are distributed under [this license](https://fontawesome.com/license)
