import { PrismaClient } from "../src/generated/prisma";
import {
  ExperienceLevel,
  ProjectStatus,
  TechStackCategory,
} from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Skip demo seeding in production
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "⚠️ Production environment detected. Seeding only reference data..."
    );
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
    {
      name: "React",
      slug: "react",
      description: "A JavaScript library for building UIs",
      category: TechStackCategory.FRONTEND,
    },
    {
      name: "Next.js",
      slug: "nextjs",
      description: "The React Framework for Production",
      category: TechStackCategory.FRONTEND,
    },
    {
      name: "TypeScript",
      slug: "typescript",
      description: "Typed JavaScript at Any Scale",
      category: TechStackCategory.FRONTEND,
    },
    {
      name: "Node.js",
      slug: "nodejs",
      description: "JavaScript runtime built on Chrome V8 engine",
      category: TechStackCategory.BACKEND,
    },
    {
      name: "Express",
      slug: "express",
      description: "Fast web framework for Node.js",
      category: TechStackCategory.BACKEND,
    },
    {
      name: "PostgreSQL",
      slug: "postgresql",
      description: "Open-source relational database",
      category: TechStackCategory.DATABASE,
    },
    {
      name: "Prisma",
      slug: "prisma",
      description: "Next-gen ORM for Node.js & TypeScript",
      category: TechStackCategory.DATABASE,
    },
    {
      name: "Docker",
      slug: "docker",
      description: "Platform for containerized apps",
      category: TechStackCategory.DEVOPS,
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
      techStacks: ["react", "nodejs", "postgresql"],
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
      techStacks: ["nextjs", "prisma"],
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
