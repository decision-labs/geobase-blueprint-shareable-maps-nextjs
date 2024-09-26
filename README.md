# Blueprint: Shareable Maps (Next.js)

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://d2w9rnfcy7mm78.cloudfront.net/30795995/original_8458f9231ab89f561872e67e4f51e84f.png?1726704188?bc=0">
  <source media="(prefers-color-scheme: light)" srcset="https://d2w9rnfcy7mm78.cloudfront.net/30795984/original_582396243e6d8b180bd5ca684e12ca33.png?1726704142?bc=0">
  <img alt="Blueprint screenshot" src="https://d2w9rnfcy7mm78.cloudfront.net/30795984/original_582396243e6d8b180bd5ca684e12ca33.png?1726704142?bc=0">
</picture>

## Outline

1. [What's included](#whats-included)
2. [Development](#development)
3. [Deployment](#deployment)
4. [Blueprint Structure](#blueprint-structure)
5. [Learn More](#learn-more)

## What's included

The first step is to have an account on [Geobase](https://geobase.app/) and create a new project.

Once you're Geobase project is created [click here](https://github.com/new?template_name=geobase-blueprint-shareable-maps-nextjs&template_owner=decision-labs) to create a new repository using this template. It will create a copy of this repo without the git history.

## Development

### Environment Variables

You only need to have these variables set:

```
NEXT_PUBLIC_GEOBASE_URL=https://[YOUR_PROJECT_REF].geobase.app
NEXT_PUBLIC_GEOBASE_ANON_KEY=YOUR_GEOBASE_PROJECT_ANON_KEY
```

### Local Development

Create an `.env.local` file with the same contents as above.

Use nvm to set node version:

```bash
nvm use 21
```

Install dependencies:

```bash
npm install
# or
yarn
# or
pnpm install
```

Run dev:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the blueprint in action.

## Deployment

The easiest way to deploy this blueprint app is to use the Vercel Platform from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

@TODO: Link to quick video

## Blueprint Structure

The components in all React blueprints are made with [shadcn/ui](https://ui.shadcn.com/). This makes it easy for you to customize and extend the existing code based on your project needs. This also means it's easier to use different components from other blueprints given they are made with the same tools - shadcn/ui, tailwindcss, react, etc.

### Component Structure

We've separated all components into 3 main categories:

-   `ui`: This is where all the shadcn/ui and other base components are.
-   `views`: These are compositions of the ui components that have a user flow in mind.
-   `providers`: These are the components that provide state and utility functions.

These are not strict rules but rather guidelines to help you understand the project structure.

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!
