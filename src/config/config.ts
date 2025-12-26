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
};

const config: TConfig = {
  port: Number(process.env.PORT),
  dbUri: process.env.DB_URI as string,
  jwtSecret: process.env.JWT_SECRET as string,
  expiresIn: process.env.EXPIRES_IN as string,
};

export default config;
