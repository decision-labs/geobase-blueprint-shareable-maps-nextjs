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

## Database Overview

A good summary of how the database is setup can be found in the [setup migration file](supabase/migrations/20240813165645_project-setup.sql).

### Tables

The database includes the following main tables:

1. `public.profiles`: Stores user profile information.
2. `public.smb_map_projects`: Contains map project details.
3. `public.smb_drawings`: Stores line drawings for map projects. 🗺️
4. `public.smb_pins`: Holds pin locations for map projects. 🗺️
5. `public.smb_annotations`: Stores annotations for map projects. 🗺️

> 🗺️ = Served as a vector map tile via the Geobase automatic tile server

### Triggers & Functions

1. `public.handle_new_user()`: Automatically creates a profile row when a new user is created.
2. `public.update_project_bounds()`: Updates the bounds of a map project when drawings, pins, annotations, or attachments are added or removed.

Triggers:

-   `on_auth_user_created`: Calls `handle_new_user()` when a new user is created.
-   `update_bounds_on_drawing_change`, `update_bounds_on_pin_change`, `update_bounds_on_annotation_change`, `update_bounds_on_attachment_change`: Call `update_project_bounds()` when respective items are added or removed from a project.

### RLS (Row Level Security)

Row Level Security is implemented for all tables to ensure data privacy and access control:

1. `profiles`:

    - Users can read and modify their own profile.
    - Everyone can read all profiles.

2. `smb_map_projects`:

    - Anyone can read published projects.
    - Authenticated project owners have full access to their own projects.

3. `smb_drawings`, `smb_pins`, `smb_annotations`, `smb_attachments`:

    - Anyone can read items from published projects.
    - Authenticated item owners have full access to their own items.

4. Storage:
    - Policies are set for the 'avatars' bucket to control access to user avatars.

## Blueprint Structure

The components in all React blueprints are made with [shadcn/ui](https://ui.shadcn.com/). This makes it easy for you to customize and extend the existing code based on your project needs. This also means it's easier to use different components from other blueprints given they are made with the same tools - shadcn/ui, tailwindcss, react, etc.

### Component Structure

We've separated all components into 3 main categories:

-   `ui`: This is where all the shadcn/ui and other base components are.
-   `views`: These are compositions of the ui components that have a user flow in mind.
-   `providers`: These are the components that provide state and utility functions.

These are not strict rules but rather guidelines to help you understand the project structure.
