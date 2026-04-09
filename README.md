# Fantasy Golf Leaderboard

A modern web application for tracking and managing fantasy golf competitions. Built with Next.js, this application provides real-time leaderboard updates, player statistics, and tournament management features.

## Features

- Real-time leaderboard updates
- Player statistics and performance tracking
- Tournament management
- User authentication and profiles
- Responsive design for desktop and mobile
- Modern UI with intuitive navigation

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework for production
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Vitest](https://vitest.dev/) - Unit testing
- [Playwright](https://playwright.dev/) - End-to-end testing

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/fantasy-golf.git
cd fantasy-golf
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up your environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your database credentials and other configuration.

4. Run database migrations:

```bash
npm run prisma:migrate
# or
yarn prisma:migrate
```

5. Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run test` - Run unit tests with Vitest
- `npm run test:ui` - Run unit tests with UI
- `npm run test:coverage` - Run unit tests with coverage report
- `npm run test:e2e` - Run end-to-end tests with Playwright
- `npm run test:e2e:ui` - Run end-to-end tests with UI

### Testing

The project uses two testing frameworks:

1. **Vitest** for unit testing:
   - Fast and modern test runner
   - React Testing Library integration
   - Coverage reporting
   - UI mode for debugging

2. **Playwright** for end-to-end testing:
   - Cross-browser testing (Chrome, Firefox, Safari)
   - Modern automation features
   - Visual testing capabilities
   - UI mode for debugging

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
