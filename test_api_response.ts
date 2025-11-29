// This script will help us understand what the /api/groups endpoint actually returns
import { db } from "./server/db";
import { groups } from "./shared/schema";

async function main() {
    const allGroups = await db.select().from(groups);

    console.log("Sample group data from DB:");
    if (allGroups.length > 0) {
        const firstGroup = allGroups[0];
        console.log("Group fields:", Object.keys(firstGroup));
        console.log("Sample group:", JSON.stringify(firstGroup, null, 2));
    }

    console.log(`\nTotal groups: ${allGroups.length}`);

    const targetLeaderId = "97ea9e4b-9d2d-4896-93ec-66fb641ee545";
    const leaderGroups = allGroups.filter(g => g.leaderId === targetLeaderId);
    console.log(`\nGroups led by ${targetLeaderId}: ${leaderGroups.length}`);

    process.exit(0);
}

main().catch(console.error);
