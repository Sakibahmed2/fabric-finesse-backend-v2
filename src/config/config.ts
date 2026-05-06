import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

type TConfig = {
  port: number;
  dbUri: string;
  jwtSecret: string;
  expiresIn: string;
  baseUrl: string;
  frontendUrl: string;
  sslStoreId?: string;
  sslStorePassword?: string;
};

const config: TConfig = {
  port: Number(process.env.PORT),
  dbUri: process.env.DB_URI as string,
  jwtSecret: process.env.JWT_SECRET as string,
  expiresIn: process.env.EXPIRES_IN as string,
  baseUrl: process.env.BASE_URL as string,
  frontendUrl: (process.env.FRONTEND_URL as string) || "http://localhost:3000",
  sslStoreId: process.env.SSL_STORE_ID as string,
  sslStorePassword: process.env.SSL_STORE_PASSWORD as string,
};

export default config;
