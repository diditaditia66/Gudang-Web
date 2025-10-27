import { handlers } from "@/auth";

export const { GET, POST } = handlers;
// Pastikan berjalan di Node runtime (bukan edge)
export const runtime = "nodejs";
