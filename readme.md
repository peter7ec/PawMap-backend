# PawMap - Backend

For the English version, please see [README.en.md](./README.en.md).


Üdv a PawMap projekt backend repository-jában! Ez a szerver felel a PawMap webalkalmazás adatainak kezeléséért, a felhasználói hitelesítésért és a valós idejű kommunikációért.

**Frontend Repository:** [**PawMap Frontend**](https://github.com/peter7ec/PawMap-frontend)

---

### Tartalomjegyzék
- [Projekt bemutatása](#projekt-bemutatása)
- [Architektúra és technológiák](#architektúra-és-technológiák)
- [API Dokumentáció](#api-dokumentáció)
- [Fejlesztői környezet beállítása (Development)](#-fejlesztői-környezet-beállítása-development)
- [Éles környezet beállítása (Production)](#-éles-környezet-beállítása-production)
- [Lehetséges problémák](#-lehetséges-problémák)

---

### Projekt bemutatása

Ez a backend szolgáltatás biztosítja a **PawMap** alkalmazás működéséhez szükséges összes szerveroldali logikát. A fő feladatai:

- **Felhasználókezelés:** Regisztráció, bejelentkezés és felhasználói adatok kezelése JWT (JSON Web Token) alapú hitelesítéssel.
- **Adatbázis műveletek:** A kutyabarát helyek (éttermek, parkok stb.) adatainak tárolása, lekérdezése és módosítása a PostgreSQL adatbázisban.
- **Valós idejű kommunikáció:** Egy WebSocket API biztosítja, hogy a felhasználói interakciók (pl. új kommentek) azonnal megjelenjenek minden kliens számára.

### Architektúra és technológiák

A projekt egy monorepo struktúrában lett felépítve `pnpm` workspace-ek segítségével, ami két fő szolgáltatást (service-t) foglal magában:

1.  **REST API:** Egy Express.js alapú szerver, ami a hagyományos CRUD (Create, Read, Update, Delete) műveleteket kezeli.
2.  **WebSocket API:** Egy különálló szerver a valós idejű kommunikációhoz.

A felhasznált technológiák:

- **Keretrendszer:** [Express.js](https://expressjs.com/)
- **Nyelv:** [TypeScript](https://www.typescriptlang.org/)
- **Csomagkezelő:** [pnpm](https://pnpm.io/) (monorepo workspace-szel)
- **Adatbázis:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [Prisma](https://www.prisma.io/) (adatbázis séma kezeléséhez és típusgeneráláshoz)
- **Valós idejű kommunikáció:** WebSocket (ws)
- **Hitelesítés:** JSON Web Token (JWT)
- **Konténerizáció:** [Docker](https://www.docker.com/) és Docker Compose

### API Dokumentáció

A REST API végpontjainak részletes leírása megtalálható a `docs` mappában, Swagger/OpenAPI formátumban.
*Itt linkelhetsz egy Swagger UI oldalra, ha van, vagy csak jelezheted, hogy a dokumentáció a kódban van.*


---
<br>


# 🧑‍💻 Set up for development

1. Download pnpm
2. Install dependencies:
   ```
   pnpm i
   ```
3. Edit .env.example file (password, username, jwt secret)
4. Create env files with
   ```
   pnpm env:sync
   ```
   command.
5. Generate types with prisma from schema:
   ```
   pnpm db:generate
   ```
6. Build database:
   ```
   pnpm db:build
   ```
7. Create postgresql and redis in docker:
   ```
   pnpm docker:dev
   ```
8. Generate tables in postgresql database:
   ```
   pnpm db:migrate
   ```
9. Start dev environment:
   ```
   pnpm dev
   ```

🗒️ *Note*:

- *For ws-api the database (prisma) must builded (have "dist" folder and
  "generated" folder on prisma folder).*
- *With
  ```
  pnpm db:studio
  ```
  you can run prisma studio web.*
- *If you want delete "dist" and "tsbuild" files use
  ```
  pnpm clean
  ```
  command. (it is delete database "dist" folder too)*
- *Before docker container creation, build down every service.*

# 📊 Set up for production

1. Build all services:
   ```
   pnpm build
   ```
   This will create "dist" folders.
2. Create and start production containers on docker:
   ```
   pnpm docker:prod
   ```

# ⛔️ Possible problems

- If docker don't want to change postgresql user name and password use
  ```
  pnpm docker:dev:down
  ```
  or
  ```
  pnpm docker:prod:down
  ```
  command to delete postgres datas (same in prod).


