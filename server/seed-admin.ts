import { db } from "./db";
import { roles, permissions, rolePermissions, adminUsers } from "@shared/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

// تعريف الصلاحيات الأساسية
const basePermissions = [
  // إدارة المستخدمين الإداريين
  { name: "admin_users:view", nameAr: "عرض المستخدمين الإداريين", resource: "admin_users", action: "view", description: "Can view admin users list" },
  { name: "admin_users:create", nameAr: "إنشاء مستخدم إداري", resource: "admin_users", action: "create", description: "Can create new admin users" },
  { name: "admin_users:edit", nameAr: "تعديل مستخدم إداري", resource: "admin_users", action: "edit", description: "Can edit admin users" },
  { name: "admin_users:delete", nameAr: "حذف مستخدم إداري", resource: "admin_users", action: "delete", description: "Can delete admin users" },
  
  // إدارة الأدوار والصلاحيات
  { name: "roles:view", nameAr: "عرض الأدوار", resource: "roles", action: "view", description: "Can view roles" },
  { name: "roles:manage", nameAr: "إدارة الأدوار", resource: "roles", action: "manage", description: "Can manage roles and permissions" },
  
  // إدارة الفريلانسرز
  { name: "freelancers:view", nameAr: "عرض الفريلانسرز", resource: "freelancers", action: "view", description: "Can view freelancers" },
  { name: "freelancers:edit", nameAr: "تعديل الفريلانسرز", resource: "freelancers", action: "edit", description: "Can edit freelancers" },
  { name: "freelancers:delete", nameAr: "حذف الفريلانسرز", resource: "freelancers", action: "delete", description: "Can delete freelancers" },
  { name: "freelancers:ban", nameAr: "حظر الفريلانسرز", resource: "freelancers", action: "ban", description: "Can ban freelancers" },
  
  // إدارة أصحاب المنتجات
  { name: "product_owners:view", nameAr: "عرض أصحاب المنتجات", resource: "product_owners", action: "view", description: "Can view product owners" },
  { name: "product_owners:edit", nameAr: "تعديل أصحاب المنتجات", resource: "product_owners", action: "edit", description: "Can edit product owners" },
  { name: "product_owners:delete", nameAr: "حذف أصحاب المنتجات", resource: "product_owners", action: "delete", description: "Can delete product owners" },
  { name: "product_owners:ban", nameAr: "حظر أصحاب المنتجات", resource: "product_owners", action: "ban", description: "Can ban product owners" },
  
  // إدارة الجروبات
  { name: "groups:view", nameAr: "عرض الجروبات", resource: "groups", action: "view", description: "Can view groups" },
  { name: "groups:edit", nameAr: "تعديل الجروبات", resource: "groups", action: "edit", description: "Can edit groups" },
  { name: "groups:delete", nameAr: "حذف الجروبات", resource: "groups", action: "delete", description: "Can delete groups" },
  
  // إدارة المشاريع
  { name: "projects:view", nameAr: "عرض المشاريع", resource: "projects", action: "view", description: "Can view projects" },
  { name: "projects:edit", nameAr: "تعديل المشاريع", resource: "projects", action: "edit", description: "Can edit projects" },
  { name: "projects:delete", nameAr: "حذف المشاريع", resource: "projects", action: "delete", description: "Can delete projects" },
  
  // إدارة الطلبات
  { name: "orders:view", nameAr: "عرض الطلبات", resource: "orders", action: "view", description: "Can view orders" },
  { name: "orders:edit", nameAr: "تعديل الطلبات", resource: "orders", action: "edit", description: "Can edit orders" },
  { name: "orders:cancel", nameAr: "إلغاء الطلبات", resource: "orders", action: "cancel", description: "Can cancel orders" },
  { name: "orders:refund", nameAr: "استرجاع المبالغ", resource: "orders", action: "refund", description: "Can refund orders" },
  
  // إدارة المهام
  { name: "tasks:view", nameAr: "عرض المهام", resource: "tasks", action: "view", description: "Can view tasks" },
  { name: "tasks:edit", nameAr: "تعديل المهام", resource: "tasks", action: "edit", description: "Can edit tasks" },
  
  // إدارة السحوبات
  { name: "withdrawals:view", nameAr: "عرض السحوبات", resource: "withdrawals", action: "view", description: "Can view withdrawals" },
  { name: "withdrawals:approve", nameAr: "الموافقة على السحوبات", resource: "withdrawals", action: "approve", description: "Can approve withdrawals" },
  { name: "withdrawals:reject", nameAr: "رفض السحوبات", resource: "withdrawals", action: "reject", description: "Can reject withdrawals" },
  
  // إدارة المدفوعات
  { name: "payments:view", nameAr: "عرض المدفوعات", resource: "payments", action: "view", description: "Can view payments" },
  { name: "payments:process", nameAr: "معالجة المدفوعات", resource: "payments", action: "process", description: "Can process payments" },
  
  // التقارير والإحصائيات
  { name: "reports:view", nameAr: "عرض التقارير", resource: "reports", action: "view", description: "Can view reports and statistics" },
  { name: "reports:export", nameAr: "تصدير التقارير", resource: "reports", action: "export", description: "Can export reports" },
  
  // الإعدادات
  { name: "settings:view", nameAr: "عرض الإعدادات", resource: "settings", action: "view", description: "Can view settings" },
  { name: "settings:edit", nameAr: "تعديل الإعدادات", resource: "settings", action: "edit", description: "Can edit settings" },
  
  // الإشعارات
  { name: "notifications:view", nameAr: "عرض الإشعارات", resource: "notifications", action: "view", description: "Can view notifications" },
  { name: "notifications:send", nameAr: "إرسال الإشعارات", resource: "notifications", action: "send", description: "Can send notifications" },
];

// تعريف الأدوار الأساسية
const baseRoles = [
  {
    name: "admin",
    nameAr: "مدير",
    description: "صلاحيات كاملة لإدارة جميع أجزاء المنصة",
    isSystemRole: true,
    permissions: ["*"], // جميع الصلاحيات
  },
  {
    name: "developer",
    nameAr: "مبرمج",
    description: "صلاحيات تقنية للمطورين",
    isSystemRole: true,
    permissions: [
      "freelancers:view", "freelancers:edit",
      "product_owners:view", "product_owners:edit",
      "groups:view", "groups:edit",
      "projects:view", "projects:edit",
      "orders:view", "orders:edit",
      "tasks:view", "tasks:edit",
      "reports:view",
      "settings:view", "settings:edit",
    ],
  },
  {
    name: "marketer",
    nameAr: "مسوّق",
    description: "صلاحيات تسويقية",
    isSystemRole: true,
    permissions: [
      "freelancers:view",
      "product_owners:view",
      "groups:view",
      "orders:view",
      "reports:view",
      "notifications:view", "notifications:send",
    ],
  },
  {
    name: "support",
    nameAr: "دعم فني",
    description: "صلاحيات الدعم الفني",
    isSystemRole: true,
    permissions: [
      "freelancers:view", "freelancers:edit",
      "product_owners:view", "product_owners:edit",
      "groups:view",
      "projects:view",
      "orders:view", "orders:edit",
      "tasks:view",
      "withdrawals:view",
      "notifications:view", "notifications:send",
    ],
  },
  {
    name: "partner",
    nameAr: "شريك",
    description: "صلاحيات محدودة للشركاء",
    isSystemRole: true,
    permissions: [
      "freelancers:view",
      "product_owners:view",
      "groups:view",
      "projects:view",
      "orders:view",
      "reports:view",
    ],
  },
];

async function seedAdminSystem() {
  console.log("Starting admin system seeding...");

  try {
    // 1. إضافة الصلاحيات
    console.log("Inserting permissions...");
    const insertedPermissions: Record<string, string> = {};
    
    for (const perm of basePermissions) {
      const [existing] = await db.select().from(permissions).where(eq(permissions.name, perm.name));
      
      if (!existing) {
        const [inserted] = await db.insert(permissions).values(perm).returning();
        insertedPermissions[perm.name] = inserted.id;
        console.log(`  ✓ Created permission: ${perm.nameAr}`);
      } else {
        insertedPermissions[perm.name] = existing.id;
        console.log(`  - Permission exists: ${perm.nameAr}`);
      }
    }

    // 2. إضافة الأدوار
    console.log("\nInserting roles...");
    for (const role of baseRoles) {
      const [existingRole] = await db.select().from(roles).where(eq(roles.name, role.name));
      
      let roleId: string;
      if (!existingRole) {
        const [inserted] = await db.insert(roles).values({
          name: role.name,
          nameAr: role.nameAr,
          description: role.description,
          isSystemRole: role.isSystemRole,
        }).returning();
        roleId = inserted.id;
        console.log(`  ✓ Created role: ${role.nameAr}`);
      } else {
        roleId = existingRole.id;
        console.log(`  - Role exists: ${role.nameAr}`);
      }

      // 3. ربط الأدوار بالصلاحيات
      if (role.permissions.includes("*")) {
        // إعطاء جميع الصلاحيات للمدير
        for (const permId of Object.values(insertedPermissions)) {
          const [existing] = await db.select().from(rolePermissions)
            .where(eq(rolePermissions.roleId, roleId));
          
          if (!existing) {
            await db.insert(rolePermissions).values({
              roleId,
              permissionId: permId,
            });
          }
        }
        console.log(`    ✓ Assigned all permissions to ${role.nameAr}`);
      } else {
        // إعطاء صلاحيات محددة
        for (const permName of role.permissions) {
          const permId = insertedPermissions[permName];
          if (permId) {
            const [existing] = await db.select().from(rolePermissions)
              .where(eq(rolePermissions.roleId, roleId));
            
            if (!existing || !existing.permissionId) {
              await db.insert(rolePermissions).values({
                roleId,
                permissionId: permId,
              }).onConflictDoNothing();
            }
          }
        }
        console.log(`    ✓ Assigned ${role.permissions.length} permissions to ${role.nameAr}`);
      }
    }

    // 4. إنشاء مستخدم إداري افتراضي (اختياري)
    const [adminRole] = await db.select().from(roles).where(eq(roles.name, "admin"));
    const [existingAdmin] = await db.select().from(adminUsers).where(eq(adminUsers.email, "admin@sumou.com"));
    
    if (!existingAdmin && adminRole) {
      const hashedPassword = await bcrypt.hash("Admin@123", 10);
      await db.insert(adminUsers).values({
        email: "admin@sumou.com",
        password: hashedPassword,
        fullName: "مدير المنصة",
        phone: "+966500000000",
        roleId: adminRole.id,
        isActive: true,
      });
      console.log("\n✓ Created default admin user:");
      console.log("  Email: admin@sumou.com");
      console.log("  Password: Admin@123");
    }

    console.log("\n✅ Admin system seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding admin system:", error);
    throw error;
  }
}

// تشغيل الـ seeding
seedAdminSystem()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
