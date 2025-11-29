
import { db } from "./server/db";
import { freelancers, groups } from "./shared/schema";

async function main() {
    console.log("Checking database state...");

    const allFreelancers = await db.select().from(freelancers);
    console.log(`Total Freelancers: ${allFreelancers.length}`);
    allFreelancers.forEach(f => console.log(`- Freelancer: ${f.username} (${f.id})`));

    const allGroups = await db.select().from(groups);
    console.log(`Total Groups: ${allGroups.length}`);
    allGroups.forEach(g => console.log(`- Group: ${g.name}, Leader: ${g.leaderId}`));

    process.exit(0);
}

main().catch(console.error);
