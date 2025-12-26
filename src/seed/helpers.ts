import fs from "fs";
import path from "path";

export const loadJson = (filename: string) => {
  const filepath = path.join(
    process.cwd(),
    "src",
    "seed",
    "seed-data",
    filename
  );

  return JSON.parse(fs.readFileSync(filepath, "utf-8"));
};
