import { Clerk } from "@clerk/clerk-sdk-node";

const clerk = new Clerk(process.env.CLERK_SECRET_KEY);

export default clerk;
