# 🧑‍💻 Set up for development

 1. Download pnpm
 2. Install dependencies: `pnpm i`
 3. Edit .env.example file (password, username, jwt secret)
 4. Create env files with `pnpm env:sync` command.
 5. Generate types with prisma from schema: `pnpm db:generate`
 6. Build database: `pnpm db:build`
 7. Create postgresql and redis in docker: `pnpm docker:dev`
 8. Generate tables in postgresql database: `pnpm db:migrate`
 9. Start dev environment: `pnpm dev`

🗒️ *Note*: 
 - *For ws-api the database (prisma) must builded (have "dist" folder and
   "generated" folder on prisma folder).*
 - *With `pnpm db:studio` you can run prisma studio web.*
 - *If you want delete "dist" and "tsbuild" files use `pnpm clean` command. (it is delete database "dist" folder too)*
 - *Before docker container creation, build down every service.*

   

# 📊 Set up for production

 1. Build all services: `pnpm build` This will create "dist" folders.
 2. Create and start production containers on docker: `pnpm docker:prod`

# ⛔️ Possible problems

 - If docker don't want to change postgresql user name and password use `pnpm docker:dev:down` or `pnpm docker:prod:down` command to delete postgres datas (same in prod).
