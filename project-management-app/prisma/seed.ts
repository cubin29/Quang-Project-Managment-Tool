import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create sample users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'john.doe@company.com' },
      update: {},
      create: {
        email: 'john.doe@company.com',
        name: 'John Doe',
        role: 'MANAGER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'jane.smith@company.com' },
      update: {},
      create: {
        email: 'jane.smith@company.com',
        name: 'Jane Smith',
        role: 'ADMIN',
      },
    }),
    prisma.user.upsert({
      where: { email: 'bob.wilson@company.com' },
      update: {},
      create: {
        email: 'bob.wilson@company.com',
        name: 'Bob Wilson',
        role: 'MEMBER',
      },
    }),
  ])

  console.log('✅ Users created')

  // Create sample projects
  const projects = await Promise.all([
    prisma.project.upsert({
      where: { name: 'Website Redesign' },
      update: {},
      create: {
        name: 'Website Redesign',
        description: 'Complete overhaul of the company website with modern design and improved user experience',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        budget: 150000,
        expectedRevenue: 500000,
        headcountSavings: 2,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-06-30'),
        managerId: users[0].id,
      },
    }),
    prisma.project.upsert({
      where: { name: 'Mobile App Development' },
      update: {},
      create: {
        name: 'Mobile App Development',
        description: 'Native mobile application for iOS and Android platforms',
        status: 'PLANNING',
        priority: 'HIGH',
        budget: 200000,
        expectedRevenue: 800000,
        headcountSavings: 5,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-12-31'),
        managerId: users[1].id,
      },
    }),
    prisma.project.upsert({
      where: { name: 'Data Analytics Platform' },
      update: {},
      create: {
        name: 'Data Analytics Platform',
        description: 'Internal analytics platform for business intelligence and reporting',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        budget: 300000,
        expectedRevenue: 1200000,
        headcountSavings: 8,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-10-31'),
        managerId: users[0].id,
      },
    }),
    prisma.project.upsert({
      where: { name: 'Customer Support Portal' },
      update: {},
      create: {
        name: 'Customer Support Portal',
        description: 'Self-service portal for customer support and knowledge base',
        status: 'COMPLETED',
        priority: 'MEDIUM',
        budget: 75000,
        expectedRevenue: 200000,
        headcountSavings: 3,
        startDate: new Date('2023-09-01'),
        endDate: new Date('2023-12-15'),
        managerId: users[2].id,
      },
    }),
  ])

  console.log('✅ Projects created')

  // Create sample tasks for the first project
  const websiteProject = projects[0]
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'UI/UX Design',
        description: 'Create wireframes and mockups for the new website design',
        status: 'DONE',
        priority: 'HIGH',
        impact: 5,
        effort: 4,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-15'),
        dueDate: new Date('2024-02-15'),
        projectId: websiteProject.id,
        assigneeId: users[1].id,
        createdById: users[0].id,
        columnId: 'done',
        position: 1,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Frontend Development',
        description: 'Implement the new design using React and TypeScript',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        impact: 5,
        effort: 5,
        startDate: new Date('2024-02-16'),
        endDate: new Date('2024-04-30'),
        dueDate: new Date('2024-04-30'),
        projectId: websiteProject.id,
        assigneeId: users[2].id,
        createdById: users[0].id,
        columnId: 'in-progress',
        position: 1,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Content Migration',
        description: 'Migrate existing content to the new CMS',
        status: 'TODO',
        priority: 'MEDIUM',
        impact: 3,
        effort: 3,
        dueDate: new Date('2024-05-15'),
        projectId: websiteProject.id,
        assigneeId: users[1].id,
        createdById: users[0].id,
        columnId: 'todo',
        position: 1,
      },
    }),
  ])

  console.log('✅ Tasks created')

  // Create sample risks
  const risks = await Promise.all([
    prisma.risk.create({
      data: {
        title: 'Third-party Integration Delays',
        description: 'Potential delays in third-party API integrations could impact timeline',
        category: 'TECHNICAL',
        probability: 3,
        impact: 4,
        riskScore: 12,
        status: 'IDENTIFIED',
        mitigationPlan: 'Identify alternative APIs and create contingency plans',
        projectId: projects[1].id,
        assessorId: users[0].id,
      },
    }),
    prisma.risk.create({
      data: {
        title: 'Budget Overrun',
        description: 'Current development pace may exceed allocated budget',
        category: 'FINANCIAL',
        probability: 2,
        impact: 5,
        riskScore: 10,
        status: 'ASSESSED',
        mitigationPlan: 'Weekly budget reviews and scope adjustments',
        projectId: websiteProject.id,
        assessorId: users[1].id,
      },
    }),
  ])

  console.log('✅ Risks created')

  // Create sample metrics
  const metrics = await Promise.all([
    prisma.projectMetric.create({
      data: {
        name: 'Current Spend',
        value: 45000,
        unit: 'USD',
        category: 'FINANCIAL',
        projectId: websiteProject.id,
      },
    }),
    prisma.projectMetric.create({
      data: {
        name: 'Team Velocity',
        value: 85,
        unit: 'story points/sprint',
        category: 'PERFORMANCE',
        projectId: websiteProject.id,
      },
    }),
    prisma.projectMetric.create({
      data: {
        name: 'Code Coverage',
        value: 92,
        unit: '%',
        category: 'QUALITY',
        projectId: projects[1].id,
      },
    }),
  ])

  console.log('✅ Metrics created')

  console.log('🎉 Database seeded successfully!')
  console.log(`Created:`)
  console.log(`- ${users.length} users`)
  console.log(`- ${projects.length} projects`)
  console.log(`- ${tasks.length} tasks`)
  console.log(`- ${risks.length} risks`)
  console.log(`- ${metrics.length} metrics`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  }) 