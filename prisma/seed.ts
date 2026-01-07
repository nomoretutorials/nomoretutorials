import { PrismaClient, TechStackCategory } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting tech stack seeding...");

  const techStacksData = [
    // ==================== FULLSTACK ====================
    {
      name: "Next.js",
      slug: "nextjs",
      description: "Full-stack React framework with server-side rendering",
      category: TechStackCategory.FULLSTACK,
    },
    {
      name: "Remix",
      slug: "remix",
      description: "Full-stack web framework built on React Router",
      category: TechStackCategory.FULLSTACK,
    },
    {
      name: "TanStack Start",
      slug: "tanstack-start",
      description: "Full-stack framework from the TanStack ecosystem",
      category: TechStackCategory.FULLSTACK,
    },

    // ==================== FRONTEND ====================
    {
      name: "React",
      slug: "react",
      description: "A JavaScript library for building user interfaces",
      category: TechStackCategory.FRONTEND,
    },
    {
      name: "Vue.js",
      slug: "vuejs",
      description: "Progressive JavaScript Framework",
      category: TechStackCategory.FRONTEND,
    },
    {
      name: "Angular",
      slug: "angular",
      description: "Platform for building web applications",
      category: TechStackCategory.FRONTEND,
    },
    {
      name: "Svelte",
      slug: "svelte",
      description: "Cybernetically enhanced web apps",
      category: TechStackCategory.FRONTEND,
    },

    // ==================== BACKEND ====================
    {
      name: "Node.js + Express",
      slug: "nodejs-express",
      description: "Fast, unopinionated web framework for Node.js",
      category: TechStackCategory.BACKEND,
    },
    {
      name: "NestJS",
      slug: "nestjs",
      description: "Progressive Node.js framework for scalable applications",
      category: TechStackCategory.BACKEND,
    },
    {
      name: "Python + Django",
      slug: "python-django",
      description: "High-level Python web framework",
      category: TechStackCategory.BACKEND,
    },
    {
      name: "Python + FastAPI",
      slug: "python-fastapi",
      description: "Modern, fast web framework for building APIs with Python",
      category: TechStackCategory.BACKEND,
    },

    // ==================== DATABASE ====================
    {
      name: "PostgreSQL",
      slug: "postgresql",
      description: "Open-source relational database",
      category: TechStackCategory.DATABASE,
    },
    {
      name: "MySQL",
      slug: "mysql",
      description: "Popular open-source relational database",
      category: TechStackCategory.DATABASE,
    },
    {
      name: "MongoDB",
      slug: "mongodb",
      description: "NoSQL document database",
      category: TechStackCategory.DATABASE,
    },
    {
      name: "Redis",
      slug: "redis",
      description: "In-memory data structure store",
      category: TechStackCategory.DATABASE,
    },

    // ==================== ORM ====================
    {
      name: "Prisma",
      slug: "prisma",
      description: "Next-generation ORM for Node.js & TypeScript",
      category: TechStackCategory.ORM,
    },
    {
      name: "Drizzle ORM",
      slug: "drizzle-orm",
      description: "TypeScript ORM for SQL databases",
      category: TechStackCategory.ORM,
    },

    // ==================== AUTHENTICATION ====================
    {
      name: "Better Auth",
      slug: "better-auth",
      description: "TypeScript-first authentication library",
      category: TechStackCategory.AUTHENTICATION,
    },
    {
      name: "Clerk",
      slug: "clerk",
      description: "Complete user management and authentication",
      category: TechStackCategory.AUTHENTICATION,
    }
  ];

  const techStacks = await Promise.all(
    techStacksData.map((stack) =>
      prisma.techStack.upsert({
        where: { slug: stack.slug },
        update: {},
        create: stack,
      })
    )
  );

  console.log(`✅ Seeded ${techStacks.length} tech stacks successfully`);
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
