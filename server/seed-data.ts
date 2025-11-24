import { db } from "./db";
import { freelancers, productOwners, campaigns, groups, groupMembers, orders } from "@shared/schema";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

async function seedData() {
  try {
    console.log("🌱 Starting database seeding...");

    // Check if data already exists
    const existingFreelancers = await db.select().from(freelancers).limit(1);
    if (existingFreelancers.length > 0) {
      console.log("✅ Database already has data. Skipping seed.");
      process.exit(0);
    }

    // Seed Freelancers
    console.log("📝 Creating freelancers...");
    const hashedPassword = await bcrypt.hash("Test@1234", 10);
    
    const freelancerIds = [
      "f1-" + randomUUID(),
      "f2-" + randomUUID(),
      "f3-" + randomUUID(),
      "f4-" + randomUUID(),
    ];

    await db.insert(freelancers).values([
      {
        id: freelancerIds[0],
        email: "ahmed@example.com",
        password: hashedPassword,
        fullName: "أحمد محمد",
        username: "ahmed_tester",
        phone: "966501234567",
        countryCode: "+966",
        jobTitle: "مختبر تطبيقات محترف",
        teamSize: 5,
        services: ["google_play_review", "ux_testing"],
        bio: "خبرة 3 سنوات في اختبار التطبيقات والمواقع",
        aboutMe: "متخصص في اختبار تجربة المستخدم والإبلاغ عن الأخطاء بدقة عالية",
        isVerified: true,
        acceptedInstructions: true,
      },
      {
        id: freelancerIds[1],
        email: "fatima@example.com",
        password: hashedPassword,
        fullName: "فاطمة علي",
        username: "fatima_reviews",
        phone: "966501234568",
        countryCode: "+966",
        jobTitle: "متخصصة في تقييم التطبيقات",
        teamSize: 3,
        services: ["ios_review", "website_review"],
        bio: "متخصصة في تقييم جودة التطبيقات والمواقع الإلكترونية",
        aboutMe: "خبرة في مجال ضمان الجودة والاختبار الوظيفي للمنتجات الرقمية",
        isVerified: true,
        acceptedInstructions: true,
      },
      {
        id: freelancerIds[2],
        email: "mohammed@example.com",
        password: hashedPassword,
        fullName: "محمد حسن",
        username: "mohammed_leader",
        phone: "966501234569",
        countryCode: "+966",
        jobTitle: "قائد فريق اختبار",
        teamSize: 10,
        services: ["software_testing", "ux_testing", "google_play_review"],
        bio: "قائد فريق متخصص في اختبارات البرمجيات الشاملة",
        aboutMe: "إدارة فرق الاختبار والتأكد من معايير الجودة العالية",
        isVerified: true,
        acceptedInstructions: true,
      },
      {
        id: freelancerIds[3],
        email: "sara@example.com",
        password: hashedPassword,
        fullName: "سارة محمود",
        username: "sara_social",
        phone: "966501234570",
        countryCode: "+966",
        jobTitle: "متخصصة في التسويق الرقمي",
        teamSize: 2,
        services: ["social_media_engagement"],
        bio: "متخصصة في التفاعل عبر وسائل التواصل الاجتماعي",
        aboutMe: "خبرة في زيادة التفاعل والمتابعين على منصات التواصل",
        isVerified: true,
        acceptedInstructions: true,
      },
    ]);

    console.log("✅ Freelancers created");

    // Seed Product Owners
    console.log("📝 Creating product owners...");
    const ownerIds = [
      "o1-" + randomUUID(),
      "o2-" + randomUUID(),
    ];

    await db.insert(productOwners).values([
      {
        id: ownerIds[0],
        email: "startup@example.com",
        password: hashedPassword,
        fullName: "شركة النجم الناشئة",
        companyName: "AlNajm Startup",
        phone: "966501234571",
        productName: "تطبيق التسوق الذكي",
        productType: "mobile_app",
        productDescription: "تطبيق تسوق باستخدام الذكاء الاصطناعي",
        productUrl: "https://alnajm-shop.example.com",
        services: ["google_play_review", "ux_testing"],
        acceptedInstructions: true,
      },
      {
        id: ownerIds[1],
        email: "tech-hub@example.com",
        password: hashedPassword,
        fullName: "مركز التكنولوجيا",
        companyName: "Tech Hub Solutions",
        phone: "966501234572",
        productName: "منصة التعليم الإلكترونية",
        productType: "web_app",
        productDescription: "منصة تعليم عبر الإنترنت تفاعلية",
        productUrl: "https://tech-hub-learning.example.com",
        services: ["website_review", "software_testing"],
        acceptedInstructions: true,
      },
    ]);

    console.log("✅ Product owners created");

    // Seed Campaigns
    console.log("📝 Creating campaigns...");
    const campaignIds = [
      "c1-" + randomUUID(),
      "c2-" + randomUUID(),
    ];

    await db.insert(campaigns).values([
      {
        id: campaignIds[0],
        productOwnerId: ownerIds[0],
        title: "اختبار تطبيق التسوق - إصدار جديد",
        description: "نحتاج إلى اختبار شامل للإصدار الجديد من تطبيقنا",
        productType: "mobile_app",
        productUrl: "https://alnajm-shop.example.com",
        services: ["google_play_review", "ux_testing"],
        package: "premium",
        budget: "500",
        testersNeeded: 20,
        testersAssigned: 0,
        status: "active",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        id: campaignIds[1],
        productOwnerId: ownerIds[1],
        title: "اختبار منصة التعليم",
        description: "اختبار وظائف منصة التعليم الجديدة",
        productType: "web_app",
        productUrl: "https://tech-hub-learning.example.com",
        services: ["website_review", "software_testing"],
        package: "standard",
        budget: "300",
        testersNeeded: 15,
        testersAssigned: 0,
        status: "active",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log("✅ Campaigns created");

    // Seed Groups
    console.log("📝 Creating groups...");
    const groupIds = [
      "g1-" + randomUUID(),
      "g2-" + randomUUID(),
    ];

    await db.insert(groups).values([
      {
        id: groupIds[0],
        name: "فريق الاختبار المتقدم",
        description: "فريق متخصص في اختبار التطبيقات والمواقع",
        leaderId: freelancerIds[2],
        maxMembers: 700,
        currentMembers: 4,
        status: "active",
        privacy: "public",
        averageRating: "4.8",
        totalRatings: 25,
      },
      {
        id: groupIds[1],
        name: "فريق التسويق الرقمي",
        description: "فريق متخصص في التفاعل على وسائل التواصل الاجتماعي",
        leaderId: freelancerIds[3],
        maxMembers: 700,
        currentMembers: 2,
        status: "active",
        privacy: "public",
        averageRating: "4.5",
        totalRatings: 10,
      },
    ]);

    console.log("✅ Groups created");

    // Seed Group Members
    console.log("📝 Adding group members...");
    await db.insert(groupMembers).values([
      {
        id: "gm1-" + randomUUID(),
        groupId: groupIds[0],
        freelancerId: freelancerIds[0],
        role: "member",
        status: "active",
        joinedAt: new Date(),
      },
      {
        id: "gm2-" + randomUUID(),
        groupId: groupIds[0],
        freelancerId: freelancerIds[1],
        role: "member",
        status: "active",
        joinedAt: new Date(),
      },
      {
        id: "gm3-" + randomUUID(),
        groupId: groupIds[1],
        freelancerId: freelancerIds[3],
        role: "leader",
        status: "active",
        joinedAt: new Date(),
      },
    ]);

    console.log("✅ Group members added");

    // Seed Orders
    console.log("📝 Creating orders...");
    await db.insert(orders).values([
      {
        id: "ord1-" + randomUUID(),
        productOwnerId: ownerIds[0],
        groupId: groupIds[0],
        campaignId: campaignIds[0],
        serviceType: "google_play_review",
        count: 10,
        pricePerReview: "25",
        totalAmount: "250",
        status: "pending",
        paymentStatus: "pending",
        createdAt: new Date(),
      },
      {
        id: "ord2-" + randomUUID(),
        productOwnerId: ownerIds[1],
        groupId: groupIds[0],
        campaignId: campaignIds[1],
        serviceType: "website_review",
        count: 15,
        pricePerReview: "20",
        totalAmount: "300",
        status: "pending",
        paymentStatus: "pending",
        createdAt: new Date(),
      },
    ]);

    console.log("✅ Orders created");

    console.log("✅ Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedData();
