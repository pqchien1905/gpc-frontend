# Google Photos Clone - Frontend

Next.js 16 frontend for Google Photos Clone application.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: React Context
- **HTTP Client**: Fetch API with custom wrapper

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on http://localhost:8000

### Installation

```bash
# Install dependencies
npm install

# Create environment file
# Create .env.local file with the following content:
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_STORAGE_URL=http://localhost:8000/storage
#
# Or use this command:
echo NEXT_PUBLIC_API_URL=http://localhost:8000 > .env.local
echo NEXT_PUBLIC_STORAGE_URL=http://localhost:8000/storage >> .env.local
```

### Development

\\\ash
npm run dev
\\\

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

\\\ash
npm run build
npm run start
\\\

## Project Structure

\\\
src/
 app/                    # Next.js App Router pages
    (auth)/            # Authentication pages (login, register, forgot-password)
    (protected)/       # Protected pages requiring authentication
       photos/        # Photos gallery
       albums/        # Albums management
       videos/        # Videos gallery
       favorites/     # Favorite photos
       trash/         # Deleted photos (30-day retention)
       friends/       # Friends management
       shares/        # Shared content
       notifications/ # Notifications
       profile/       # User profile
       upload/        # Upload photos/videos
    share/[token]/     # Public share pages
 components/            # React components
    layout/           # Layout components
    photos/           # Photo-related components
    ui/               # shadcn/ui components
 contexts/             # React Context providers
 lib/                  # Utilities and API client
    api/              # API client
 types/                # TypeScript type definitions
\\\

## Features

- Photo & Video upload with drag-and-drop
- Photo gallery with Google Photos-style grid
- Album management (create, rename, delete, set cover)
- Favorites and trash functionality
- Friend system with requests
- Share photos/albums via links or with friends
- Real-time notifications
- User profile management
- Storage quota tracking

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NEXT_PUBLIC_API_URL | Backend API URL | http://localhost:8000 |
| NEXT_PUBLIC_STORAGE_URL | Storage URL for images | http://localhost:8000/storage |

## License

MIT
