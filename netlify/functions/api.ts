import serverless from "serverless-http";
import app from "../../server/index.ts";

export const handler = serverless(app);
