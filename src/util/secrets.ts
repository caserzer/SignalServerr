// import logger from "./logger";
// import dotenv from "dotenv";
// import fs from "fs";

// if (fs.existsSync(".env")) {
//     logger.debug("Using .env file to supply config environment variables");
//     dotenv.config({ path: ".env" });
// } else {
//     logger.error("unable to find  .env file to supply config environment variables");
//     process.exit(1);
// }

// export const MYSQL_HOST = process.env["MYSQL_HOST"];
// export const MYSQL_USER = process.env["MYSQL_USER"];
// export const MYSQL_PASSWORD = process.env["MYSQL_PASSWORD"];
// export const MYSQL_DATABASE = process.env["MYSQL_DATABASE"];
// export const MYSQL_PORT = process.env["MYSQL_PORT"];
// export const APP_PORT = process.env["APP_PORT"];




// if (!MYSQL_HOST || !MYSQL_USER || !MYSQL_PASSWORD || !MYSQL_DATABASE || !MYSQL_PORT || !APP_PORT) {
//     logger.error("insufficient configuration provided");
//     process.exit(1);
// }
