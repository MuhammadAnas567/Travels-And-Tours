import { handlers } from "@/lib/auth";

/** Auth.js App Router catch-all — SessionProvider calls `/api/auth/session`. */
export const { GET, POST } = handlers;
