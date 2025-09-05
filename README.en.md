# PawMap - Backend

For the Hungarian version, please see [README.md](./README.md).

Welcome to the backend repository for the PawMap project! This server is responsible for managing data, user authentication, and real-time communication for the PawMap web application.

**Frontend Repository:** [**PawMap Frontend**](https://github.com/peter7ec/PawMap-frontend)

---

### Table of Contents
- [Project Overview](#project-overview)
- [Architecture and Technologies](#architecture-and-technologies)
- [API Documentation](#api-documentation)
- [Set up for Development](#-set-up-for-development)
- [Set up for Production](#-set-up-for-production)
- [Possible Problems](#-possible-problems)

---

### Project Overview

This backend service provides all the server-side logic required for the **PawMap** application. Its main responsibilities include:

- **User Management:** Registration, login, and user data management using JWT (JSON Web Token) based authentication.
- **Database Operations:** Storing, querying, and modifying data for dog-friendly places (restaurants, parks, etc.) in a PostgreSQL database.
- **Real-time Communication:** A WebSocket API ensures that user interactions (e.g., new comments) are instantly reflected for all clients.

### Architecture and Technologies

The project is structured as a monorepo using `pnpm` workspaces, containing two main services:

1.  **REST API:** An Express.js based server that handles traditional CRUD (Create, Read, Update, Delete) operations.
2.  **WebSocket API:** A separate server dedicated to real-time communication.

The technologies used include:

- **Framework:** [Express.js](https://expressjs.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Package Manager:** [pnpm](https://pnpm.io/) (with monorepo workspaces)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [Prisma](https://www.prisma.io/) (for database schema management and type generation)
- **Real-time Communication:** WebSocket (ws)
- **Authentication:** JSON Web Token (JWT)
- **Containerization:** [Docker](https://www.docker.com/) and Docker Compose

### API Documentation

Detailed documentation for the REST API endpoints can be found in the `docs` folder in Swagger/OpenAPI format.
*You can link to a Swagger UI page here if you have one, or just indicate that the documentation is in the code.*

---
<br>

# 🧑‍💻 Set up for development

1. Download pnpm
2. Install dependencies:
   ```
   pnpm i
   ```
3. Edit the .env.example file (password, username, jwt secret)
4. Create env files with the
   ```
   pnpm env:sync
   ```
   command.
5. Generate types with Prisma from the schema:
   ```
   pnpm db:generate
   ```
6. Build the database service:
   ```
   pnpm db:build
   ```
7. Create PostgreSQL and Redis containers in Docker:
   ```
   pnpm docker:dev
   ```
8. Generate tables in the PostgreSQL database:
   ```
   pnpm db:migrate
   ```
9. Start the development environment:
   ```
   pnpm dev
   ```

🗒️ *Note*:

- *For the ws-api, the database (prisma) must be built (it needs a "dist" and a "generated" folder in the prisma folder).*
- *With the
  ```
  pnpm db:studio
  ```
  command, you can run Prisma Studio web.*
- *If you want to delete the "dist" and "tsbuild" files, use the
  ```
  pnpm clean
  ```
  command (it will also delete the database's "dist" folder).*
- *Before creating Docker containers, bring down all services.*

# 📊 Set up for production

1. Build all services:
   ```
   pnpm build
   ```
   This will create the "dist" folders.
2. Create and start production containers in Docker:
   ```
   pnpm docker:prod
   ```

# ⛔️ Possible problems

- If Docker doesn't apply the PostgreSQL username and password changes, use the
  ```
  pnpm docker:dev:down
  ```
  or
  ```
  pnpm docker:prod:down
  ```
  command to delete PostgreSQL data (the same applies in prod).
