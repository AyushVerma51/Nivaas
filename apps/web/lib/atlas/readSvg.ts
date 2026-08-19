import fs from "node:fs";
import path from "node:path";

/** Read the India states SVG (server components only). */
export function readIndiaSvg(): string {
  return fs.readFileSync(
    path.join(process.cwd(), "public", "atlas", "india-map.svg"),
    "utf-8",
  );
}
