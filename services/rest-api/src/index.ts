import { JWT_SECRET } from "./constants/global";
import startServer from "./config/server";
import app from "./api/app";

async function main() {
    if (!JWT_SECRET) {
        throw new Error("Missing JWT_SECRET. Server cannot start.");
    }

    await startServer(app);
    // eslint-disable-next-line no-console
    console.log(
        `Swagger docs available at ${process.env.API_URL}${process.env.PORT}/api-docs`
    );
}
main();
