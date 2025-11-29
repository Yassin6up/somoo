
import { db } from "./server/db";
import { freelancers, groups, productOwners } from "./shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    const email = "yassinkokabi4@gmail.com";
    console.log(`Searching for user with email: ${email}`);

    // Check Freelancers
    const freelancer = await db.query.freelancers.findFirst({
        where: eq(freelancers.email, email)
    });

    if (freelancer) {
        console.log("Found Freelancer:", {
            id: freelancer.id,
            username: freelancer.username,
            email: freelancer.email
        });

        const userGroups = await db.select().from(groups).where(eq(groups.leaderId, freelancer.id));
        console.log(`Groups led by this freelancer (${userGroups.length}):`);
        userGroups.forEach(g => console.log(`- ${g.name} (ID: ${g.id})`));
    } else {
        console.log("User not found in Freelancers table.");
    }

    // Check Product Owners
    const po = await db.query.productOwners.findFirst({
        where: eq(productOwners.email, email)
    });

    if (po) {
        console.log("Found Product Owner:", {
            id: po.id,
            fullName: po.fullName,
            email: po.email
        });
    } else {
        console.log("User not found in Product Owners table.");
    }

    // List all groups and their leaders for reference
    console.log("\n--- All Groups ---");
    const allGroups = await db.select().from(groups);
    allGroups.forEach(g => console.log(`Group: ${g.name}, LeaderID: ${g.leaderId}`));

    process.exit(0);
}

main().catch(console.error);
