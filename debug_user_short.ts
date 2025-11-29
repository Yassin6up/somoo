
import { db } from "./server/db";
import { freelancers } from "./shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    const email = "yassinkokabi4@gmail.com";
    const targetId = "97ea9e4b-9d2d-4896-93ec-66fb641ee545";

    const freelancer = await db.query.freelancers.findFirst({
        where: eq(freelancers.email, email)
    });

    if (freelancer) {
        console.log(`User found: ${freelancer.email}`);
        console.log(`ID: ${freelancer.id}`);
        console.log(`Matches target leader ID? ${freelancer.id === targetId}`);
    } else {
        console.log("User not found.");
    }
    process.exit(0);
}

main().catch(console.error);
