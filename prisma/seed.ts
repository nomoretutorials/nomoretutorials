import { ExperienceLevel, ProjectStatus, TechStackCategory } from "@prisma/client";

import prisma from "@/lib/prisma";

async function main() {
  console.log("🌱 Starting database seeding...");

  // Skip demo seeding in production
  if (process.env.NODE_ENV === "production") {
    console.warn("⚠️ Production environment detected. Seeding only reference data...");
    await seedTechStacks();
    console.log("✅ Reference data seeded (production-safe).");
    return;
  }

  // Full seed in dev/staging
  const techStacks = await seedTechStacks();
  const users = await seedUsers();
  await seedProjects(users, techStacks);
  await seedUserTechStacks(users, techStacks);

  console.log("✅ Database seeding completed!");
}

async function seedTechStacks() {
  const techStacksData = [
    // FRONTEND FRAMEWORKS & LIBRARIES
    {
      name: "React",
      slug: "react",
      description: "A JavaScript library for building user interfaces",
      category: TechStackCategory.FRONTEND,
    },
    {
      name: "Next.js",
      slug: "nextjs",
      description: "The React Framework for Production",
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
      name: "TypeScript",
      slug: "typescript",
      description: "Typed JavaScript at Any Scale",
      category: TechStackCategory.FRONTEND,
    },
    {
      name: "Tailwind CSS",
      slug: "tailwindcss",
      description: "Utility-first CSS framework",
      category: TechStackCategory.FRONTEND,
    },
    {
      name: "Bootstrap",
      slug: "bootstrap",
      description: "Popular CSS framework for responsive design",
      category: TechStackCategory.FRONTEND,
    },
    {
      name: "Vite",
      slug: "vite",
      description: "Next generation frontend tooling",
      category: TechStackCategory.FRONTEND,
    },
    {
      name: "shadcn/ui",
      slug: "shadcn-ui",
      description: "Beautifully designed components built with Radix UI and Tailwind CSS",
      category: TechStackCategory.FRONTEND,
    },

    // BACKEND FRAMEWORKS & RUNTIMES
    {
      name: "Node.js",
      slug: "nodejs",
      description: "JavaScript runtime built on Chrome V8 engine",
      category: TechStackCategory.BACKEND,
    },
    {
      name: "Next.js",
      slug: "nextjs",
      description: "A full stack framework by vercel",
      category: TechStackCategory.BACKEND,
    },
    {
      name: "Express",
      slug: "express",
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
      name: "Python",
      slug: "python",
      description: "High-level programming language",
      category: TechStackCategory.BACKEND,
    },
    {
      name: "Django",
      slug: "django",
      description: "High-level Python web framework",
      category: TechStackCategory.BACKEND,
    },
    {
      name: "FastAPI",
      slug: "fastapi",
      description: "Modern, fast web framework for building APIs with Python",
      category: TechStackCategory.BACKEND,
    },
    {
      name: "Flask",
      slug: "flask",
      description: "Lightweight web application framework for Python",
      category: TechStackCategory.BACKEND,
    },
    {
      name: "Ruby on Rails",
      slug: "ruby-on-rails",
      description: "Server-side web application framework written in Ruby",
      category: TechStackCategory.BACKEND,
    },
    {
      name: "PHP",
      slug: "php",
      description: "Server-side scripting language",
      category: TechStackCategory.BACKEND,
    },
    {
      name: "Laravel",
      slug: "laravel",
      description: "PHP web application framework",
      category: TechStackCategory.BACKEND,
    },
    {
      name: "Spring Boot",
      slug: "spring-boot",
      description: "Java-based framework for building applications",
      category: TechStackCategory.BACKEND,
    },
    {
      name: "GraphQL",
      slug: "graphql",
      description: "Query language for APIs",
      category: TechStackCategory.BACKEND,
    },
    {
      name: "tRPC",
      slug: "trpc",
      description: "End-to-end typesafe APIs made easy",
      category: TechStackCategory.BACKEND,
    },

    // DATABASES
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
      name: "SQLite",
      slug: "sqlite",
      description: "Lightweight embedded database",
      category: TechStackCategory.DATABASE,
    },
    {
      name: "Redis",
      slug: "redis",
      description: "In-memory data structure store",
      category: TechStackCategory.DATABASE,
    },
    {
      name: "Supabase",
      slug: "supabase",
      description: "Open source Firebase alternative with PostgreSQL",
      category: TechStackCategory.DATABASE,
    },
    {
      name: "Firebase",
      slug: "firebase",
      description: "Google's mobile and web application development platform",
      category: TechStackCategory.DATABASE,
    },

    // ORM
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

    // AUTHENTICATION & AUTHORIZATION
    {
      name: "Better Auth",
      slug: "better-auth",
      description: "Typescript first authentication library",
      category: TechStackCategory.AUTHENTICATION,
    },
    {
      name: "Clerk",
      slug: "clerk",
      description: "Complete user management and authentication",
      category: TechStackCategory.AUTHENTICATION,
    },
    {
      name: "Supabase Auth",
      slug: "supabase-auth",
      description: "User management and authentication from Supabase",
      category: TechStackCategory.AUTHENTICATION,
    },
    {
      name: "Firebase Auth",
      slug: "firebase-auth",
      description: "Firebase Authentication service",
      category: TechStackCategory.AUTHENTICATION,
    },

    // BACKGROUND JOBS & QUEUES
    {
      name: "Inngest",
      slug: "inngest",
      description: "Durable workflow engine for TypeScript",
      category: TechStackCategory.QUEUE,
    },
    {
      name: "BullMQ",
      slug: "bullmq",
      description: "Queue package for handling distributed jobs",
      category: TechStackCategory.QUEUE,
    },

    // PAYMENT
    {
      name: "Stripe",
      slug: "stripe",
      description: "Payment processing platform",
      category: TechStackCategory.PAYMENT,
    },
    {
      name: "Razor Pay",
      slug: "razor pay",
      description: "Payment processing platform",
      category: TechStackCategory.PAYMENT,
    },
    {
      name: "Dodo Payments",
      slug: "dodo payments",
      description: "Payment processing platform",
      category: TechStackCategory.PAYMENT,
    },
    {
      name: "PayPal",
      slug: "paypal",
      description: "Online payment system",
      category: TechStackCategory.PAYMENT,
    },
    {
      name: "Lemon Squeezy",
      slug: "lemon-squeezy",
      description: "All-in-one platform for digital commerce",
      category: TechStackCategory.PAYMENT,
    },

    // CMS
    {
      name: "Sanity",
      slug: "sanity",
      description: "Platform for structured content",
      category: TechStackCategory.CMS,
    },
    {
      name: "Contentful",
      slug: "contentful",
      description: "Composable content platform",
      category: TechStackCategory.CMS,
    },
    {
      name: "Strapi",
      slug: "strapi",
      description: "Open source headless CMS",
      category: TechStackCategory.CMS,
    },
    {
      name: "WordPress",
      slug: "wordpress",
      description: "Open source content management system",
      category: TechStackCategory.CMS,
    },

    // EMAIL
    {
      name: "Resend",
      slug: "resend",
      description: "Email API for developers",
      category: TechStackCategory.EMAIL,
    },
    {
      name: "SendGrid",
      slug: "sendgrid",
      description: "Email delivery service",
      category: TechStackCategory.EMAIL,
    },
    {
      name: "Nodemailer",
      slug: "nodemailer",
      description: "Email sending module for Node.js",
      category: TechStackCategory.EMAIL,
    },
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

  console.log(`✅ Seeded ${techStacks.length} tech stacks`);
  return techStacks;
}

async function seedUsers() {
  const usersData = [
    {
      name: "John Doe",
      email: "john@example.com",
      emailVerified: true,
      experienceLevel: ExperienceLevel.INTERMEDIATE,
      isOnboarded: true,
    },
    {
      name: "Jane Smith",
      email: "jane@example.com",
      emailVerified: true,
      experienceLevel: ExperienceLevel.BEGINNER,
      isOnboarded: false,
    },
  ];

  const users = await Promise.all(
    usersData.map((userData) =>
      prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: userData,
      })
    )
  );

  console.log(`✅ Seeded ${users.length} users`);
  return users;
}

async function seedProjects(
  users: { id: string; email: string }[],
  techStacks: { id: string; slug: string }[]
) {
  const projectsData = [
    {
      title: "E-commerce Platform",
      description: "A full-stack e-commerce solution with React and Node.js",
      status: ProjectStatus.ACTIVE,
      userEmail: "john@example.com",
      techStacks: ["react", "nodejs", "postgresql", "stripe", "clerk"],
      repositoryUrl: "https://github.com/johndoe/ecommerce-platform",
      features: {
        authentication: true,
        paymentProcessing: true,
        adminDashboard: true,
      },
    },
    {
      title: "Task Management App",
      description: "A simple task management app for teams",
      status: ProjectStatus.DRAFT,
      userEmail: "jane@example.com",
      techStacks: ["nextjs", "prisma", "better-auth", "vercel"],
      repositoryUrl: null,
      features: { realTimeUpdates: false, notifications: true },
    },
  ];

  for (const projectData of projectsData) {
    const user = users.find((u) => u.email === projectData.userEmail);
    if (!user) continue;

    // Check if project already exists
    const existingProject = await prisma.project.findFirst({
      where: {
        title: projectData.title,
        userId: user.id,
      },
    });

    if (existingProject) {
      console.log(`⏭️ Project already exists: ${projectData.title}`);
      continue;
    }

    // Create project with nested relation creation
    await prisma.project.create({
      data: {
        title: projectData.title,
        description: projectData.description,
        status: projectData.status,
        userId: user.id,
        repositoryUrl: projectData.repositoryUrl,
        features: projectData.features,
        ProjectTechStack: {
          create: projectData.techStacks
            .map((slug, i) => {
              const tech = techStacks.find((t) => t.slug === slug);
              return tech ? { techStackId: tech.id, isPrimary: i === 0 } : null;
            })
            .filter(Boolean) as { techStackId: string; isPrimary: boolean }[],
        },
      },
    });

    console.log(`✅ Seeded project: ${projectData.title}`);
  }
}

async function seedUserTechStacks(
  users: { id: string; email: string }[],
  techStacks: { id: string; slug: string }[]
) {
  const userTechStackData = [
    {
      userEmail: "john@example.com",
      techStackSlug: "react",
      proficiencyLevel: ExperienceLevel.INTERMEDIATE,
      isPreferred: true,
    },
    {
      userEmail: "john@example.com",
      techStackSlug: "typescript",
      proficiencyLevel: ExperienceLevel.INTERMEDIATE,
      isPreferred: true,
    },
    {
      userEmail: "john@example.com",
      techStackSlug: "nodejs",
      proficiencyLevel: ExperienceLevel.INTERMEDIATE,
      isPreferred: false,
    },
    {
      userEmail: "jane@example.com",
      techStackSlug: "react",
      proficiencyLevel: ExperienceLevel.BEGINNER,
      isPreferred: true,
    },
    {
      userEmail: "jane@example.com",
      techStackSlug: "nextjs",
      proficiencyLevel: ExperienceLevel.BEGINNER,
      isPreferred: false,
    },
  ];

  for (const data of userTechStackData) {
    const user = users.find((u) => u.email === data.userEmail);
    const tech = techStacks.find((t) => t.slug === data.techStackSlug);
    if (!user || !tech) continue;

    await prisma.userTechStack.upsert({
      where: { userId_techStackId: { userId: user.id, techStackId: tech.id } },
      update: {
        proficiencyLevel: data.proficiencyLevel,
        isPreferred: data.isPreferred,
      },
      create: {
        userId: user.id,
        techStackId: tech.id,
        proficiencyLevel: data.proficiencyLevel,
        isPreferred: data.isPreferred,
      },
    });
  }

  console.log("✅ Seeded user-tech stack relationships");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
