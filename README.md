# ReflectBoard

A Kanban-style task management application with daily and weekly reflection features, built with Next.js, Prisma, and OpenAI.

## Features

- Kanban board with 5 columns: Todo, In Progress, Today's Done, Weekly Done, Done
- Milestone management with color coding
- Task tracking with stuck/blocker management
- AI-powered daily and weekly summaries using OpenAI
- Data persistence with PostgreSQL (Neon) via Prisma

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **AI**: OpenAI API
- **UI**: Radix UI + Tailwind CSS
- **Language**: TypeScript

## Setup

### 1. Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL`: Your Neon PostgreSQL connection string
- `OPENAI_API_KEY`: Your OpenAI API key

### 2. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (when you have a valid DATABASE_URL)
npx prisma migrate dev
```

### 3. Install Dependencies & Run

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:3000`.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npx prisma studio` - Open Prisma Studio to view/edit data

## License

MIT
