# 🎵 SoundWave — Backend API

<div align="center">

```
███████╗ ██████╗ ██╗   ██╗███╗   ██╗██████╗ ██╗    ██╗ █████╗ ██╗   ██╗███████╗
██╔════╝██╔═══██╗██║   ██║████╗  ██║██╔══██╗██║    ██║██╔══██╗██║   ██║██╔════╝
███████╗██║   ██║██║   ██║██╔██╗ ██║██║  ██║██║ █╗ ██║███████║██║   ██║█████╗  
╚════██║██║   ██║██║   ██║██║╚██╗██║██║  ██║██║███╗██║██╔══██║╚██╗ ██╔╝██╔══╝  
███████║╚██████╔╝╚██████╔╝██║ ╚████║██████╔╝╚███╔███╔╝██║  ██║ ╚████╔╝ ███████╗
╚══════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝╚═════╝  ╚══╝╚══╝ ╚═╝  ╚═╝  ╚═══╝  ╚══════╝
```

**RESTful API powering the SoundWave music streaming platform**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongoosejs.com)
[![Cloudflare R2](https://img.shields.io/badge/Cloudflare-R2_Storage-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/r2)

</div>

---

## Overview

SoundWave's backend is a production-ready REST API built with Express 5 and TypeScript. It handles authentication, song/artist/playlist management, file uploads to Cloudflare R2, and aggregated statistics — all backed by MongoDB.

## Features

- **JWT Authentication** — stateless auth via `httpOnly` cookie; no token leaks to JavaScript
- **Role-Based Access Control** — `authenticate` + `authorizeAdmin` middleware chain guards admin routes
- **Audio File Storage** — songs and cover art uploaded directly to Cloudflare R2 (S3-compatible); cascading deletion cleans up R2, Artist refs, and MongoDB atomically
- **Cursor-Based Pagination** — uses `_id` as cursor on song listing and search (no offset drift on inserts)
- **Recently Played** — maintains a server-side ordered list of 10 songs per user using `$pull` + `$push` + `$slice`
- **Zod Validation** — all request bodies validated with Zod schemas after Multer parses multipart data
- **Strict TypeScript** — `strict` + `verbatimModuleSyntax` enforced; all type-only imports use `import type`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ (ESM) |
| Framework | Express 5 |
| Language | TypeScript 5 (strict) |
| Database | MongoDB via Mongoose 9 |
| File Storage | Cloudflare R2 (`@aws-sdk/client-s3`) |
| Auth | JWT (`jsonwebtoken`) + bcrypt |
| Uploads | Multer 2 |
| Validation | Zod 4 |
| Dev Runner | `tsx watch` (no compilation step in dev) |

## Project Structure

```
Backend - Soundwave/
├── tsconfig.json
├── package.json
├── .env                      # Not committed — see Environment Variables
└── src/
    ├── server.ts             # Express app entry + middleware registration
    ├── config/
    │   ├── db.ts             # MongoDB connection (Mongoose)
    │   └── r2.ts             # Cloudflare R2 / S3 client factory
    ├── routes/
    │   ├── authRoutes.ts
    │   ├── songRoutes.ts
    │   ├── artistRoutes.ts
    │   ├── playlistRoutes.ts
    │   ├── userRoutes.ts
    │   └── statRoutes.ts
    ├── controllers/
    │   ├── authController.ts
    │   ├── songController.ts
    │   ├── artistController.ts
    │   ├── playlistController.ts
    │   ├── userController.ts
    │   ├── statsController.ts
    │   └── recommendationController.ts
    ├── Models/
    │   ├── User.ts
    │   ├── Song.ts
    │   ├── Artist.ts
    │   ├── Playlist.ts
    │   ├── RecentlyPlayed.ts
    │   └── SearchHistory.ts
    ├── middleware/
    │   ├── auth.ts           # authenticate + authorizeAdmin
    │   ├── uploadSong.ts     # Multer configuration
    │   └── validate.ts       # Zod request body validator
    ├── Utils/
    │   ├── jwt.ts            # generateToken / verifyToken
    │   └── r2Upload.ts       # uploadToR2 / deleteFromR2
    └── validators/           # Zod schemas per domain
```

## Request Lifecycle

```
Incoming Request
      │
      ▼
   routes/          ← registers path + middleware chain
      │
      ▼
authenticate         ← verifies httpOnly JWT cookie
      │
      ▼
authorizeAdmin?      ← checks user.isAdmin (admin routes only)
      │
      ▼
uploadSong (Multer)  ← parses multipart/form-data, buffers files (upload routes only)
      │
      ▼
validate (Zod)       ← validates req.body after Multer (so fields are available)
      │
      ▼
 controllers/        ← business logic, calls Models + R2 Utils
      │
      ▼
  Response
```

## API Reference

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/signup` | — | Register a new user |
| `POST` | `/login` | — | Login; sets `httpOnly` JWT cookie |
| `POST` | `/logout` | — | Clears auth cookie |
| `GET` | `/validate` | Cookie | Validate current session |

### Songs — `/api/songs`

| Method | Path | Auth | Admin | Description |
|--------|------|------|-------|-------------|
| `GET` | `/` | — | — | List all songs (cursor-paginated) |
| `GET` | `/:id` | — | — | Get single song |
| `GET` | `/search` | — | — | Search songs (cursor-paginated) |
| `POST` | `/` | ✓ | ✓ | Upload a new song + cover art to R2 |
| `DELETE` | `/:id` | ✓ | ✓ | Delete song (cascades R2 + Artist refs) |
| `POST` | `/mark-played/:id` | ✓ | — | Mark song as played (triggers 30s timer on client) |
| `GET` | `/recently-played` | ✓ | — | Get user's last 10 played songs |

### Artists — `/api/artists`

| Method | Path | Auth | Admin | Description |
|--------|------|------|-------|-------------|
| `GET` | `/` | — | — | List all artists |
| `GET` | `/:id` | — | — | Get artist + their songs |
| `GET` | `/search` | — | — | Search artists |
| `POST` | `/` | ✓ | ✓ | Create artist |
| `PUT` | `/:id` | ✓ | ✓ | Update artist |
| `DELETE` | `/:id` | ✓ | ✓ | Delete artist |

### Playlists — `/api/playlists`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | ✓ | Get current user's playlists |
| `POST` | `/` | ✓ | Create playlist |
| `PUT` | `/:id` | ✓ | Update playlist |
| `DELETE` | `/:id` | ✓ | Delete playlist |
| `POST` | `/:id/songs` | ✓ | Add song to playlist |
| `DELETE` | `/:id/songs/:songId` | ✓ | Remove song from playlist |

### Users — `/api/users`

| Method | Path | Auth | Admin | Description |
|--------|------|------|-------|-------------|
| `GET` | `/` | ✓ | ✓ | List all users |
| `DELETE` | `/:id` | ✓ | ✓ | Delete user |
| `PUT` | `/:id/role` | ✓ | ✓ | Change user role |

### Stats — `/api/stats`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/` | ✓ | Aggregate counts (songs, artists, users, playlists) |

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB database (local or Atlas)
- A Cloudflare R2 bucket with API credentials

### Install & Run (Development)

```bash
# Install dependencies
npm install

# Create your .env file (see Environment Variables below)
cp .env.example .env

# Start dev server with hot reload
npm run dev
```

### Build & Run (Production)

```bash
npm run build     # Compile TypeScript → dist/
npm start         # Run dist/server.js
```

## Environment Variables

Create a `.env` file in the project root:

```env
# Server
PORT=3000
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/soundwave

# Auth
JWT_SECRET=your_super_secret_jwt_key

# Cloudflare R2
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=soundwave
R2_PUBLIC_URL=https://pub-xxxx.r2.dev
```

> **Never commit `.env` to version control.**

## Data Models

| Model | Key Fields |
|-------|-----------|
| `User` | `username`, `email`, `passwordHash`, `isAdmin`, `recentlyPlayed[]` |
| `Song` | `title`, `artist` (ref), `audioUrl`, `coverUrl`, `duration` |
| `Artist` | `name`, `bio`, `imageUrl`, `songs[]` (refs) |
| `Playlist` | `name`, `owner` (ref), `songs[]` (refs) |
| `RecentlyPlayed` | `user` (ref), `songs[]` (max 10, ordered) |
| `SearchHistory` | `user` (ref), `queries[]` |

## TypeScript Configuration

Key compiler options (`tsconfig.json`):

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "verbatimModuleSyntax": true,   // enforces import type for type-only imports
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "outDir": "dist",
    "rootDir": "src"
  }
}
```

Always use `import type` for type-only imports — the compiler will error if you don't.

## Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `tsx watch src/server.ts` | Hot-reload dev server |
| `build` | `tsc` | Compile to `dist/` |
| `start` | `node dist/server.js` | Run production build |
