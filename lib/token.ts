import { createHash } from "crypto";

export function generateToken(): string {
  return createHash("sha256").update(Math.random().toString()).digest("hex");
}
