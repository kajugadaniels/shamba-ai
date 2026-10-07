import { clerkMiddleware } from "@clerk/nextjs/server";
// Planning stays public. Owned Route Handlers explicitly require auth().userId.
export default clerkMiddleware();
export const config = { matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico)).*)", "/(api|trpc)(.*)"] };
