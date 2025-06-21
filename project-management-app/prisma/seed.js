const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Create sample users with authentication
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@company.com' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@company.com',
        password: await bcrypt.hash('admin123', 10),
        name: 'Admin User',
        role: 'ADMIN',
        activeStatus: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'manager@company.com' },
      update: {},
      create: {
        username: 'manager',
        email: 'manager@company.com',
        password: await bcrypt.hash('manager123', 10),
        name: 'Project Manager',
        role: 'MANAGER',
        activeStatus: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'developer@company.com' },
      update: {},
      create: {
        username: 'developer',
        email: 'developer@company.com',
        password: await bcrypt.hash('dev123', 10),
        name: 'Developer',
        role: 'MEMBER',
        activeStatus: true,
      },
    }),
  ])

  console.log('✅ Users created')

  // Create sample projects with enhanced data
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'Customer Mobile App',
        description: 'Mobile application for customer engagement and service delivery',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        businessImpact: 9,
        techEffort: 7,
        revenueUplift: 250000,
        headcountSaving: 2.5,
        projectValue: 500000,
        team: 'Mobile Development Team',
        country: 'Singapore',
        pic: 'John Doe',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-08-30'),
        managerId: users[1].id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Data Analytics Platform',
        description: 'Internal analytics platform for business intelligence and reporting',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        businessImpact: 8,
        techEffort: 8,
        revenueUplift: 150000,
        headcountSaving: 3.0,
        projectValue: 750000,
        team: 'Data Engineering Team',
        country: 'Malaysia',
        pic: 'Jane Smith',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-09-15'),
        managerId: users[1].id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Legacy System Migration',
        description: 'Migration of legacy systems to modern cloud infrastructure',
        status: 'PLANNING',
        priority: 'URGENT',
        businessImpact: 10,
        techEffort: 9,
        revenueUplift: 0,
        headcountSaving: 5.0,
        projectValue: 1200000,
        team: 'Infrastructure Team',
        country: 'Thailand',
        pic: 'Mike Johnson',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-12-31'),
        managerId: users[1].id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'E-commerce Integration',
        description: 'Integration with major e-commerce platforms for sales channel expansion',
        status: 'DONE',
        priority: 'HIGH',
        businessImpact: 7,
        techEffort: 5,
        revenueUplift: 300000,
        headcountSaving: 1.5,
        projectValue: 400000,
        team: 'Integration Team',
        country: 'Vietnam',
        pic: 'Sarah Wilson',
        startDate: new Date('2023-10-01'),
        endDate: new Date('2024-01-31'),
        managerId: users[1].id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'CRM System Upgrade',
        description: 'Upgrading customer relationship management system with new features',
        status: 'UAT',
        priority: 'MEDIUM',
        businessImpact: 6,
        techEffort: 6,
        revenueUplift: 180000,
        headcountSaving: 2.0,
        projectValue: 350000,
        team: 'CRM Development Team',
        country: 'Philippines',
        pic: 'Alex Chen',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        managerId: users[1].id,
      },
    }),
  ])

  console.log('✅ Projects created')

  // Create sample tasks
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Design Mobile App UI/UX',
        description: 'Create comprehensive UI/UX design for mobile application',
        status: 'DONE',
        priority: 'HIGH',
        impact: 4,
        effort: 3,
        projectId: projects[0].id,
        assigneeId: users[2].id,
        createdById: users[1].id,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-15'),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement User Authentication',
        description: 'Develop secure user authentication system',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        impact: 5,
        effort: 4,
        projectId: projects[0].id,
        assigneeId: users[2].id,
        createdById: users[1].id,
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-03-15'),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Setup Data Pipeline',
        description: 'Configure data ingestion and processing pipeline',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        impact: 4,
        effort: 5,
        projectId: projects[1].id,
        assigneeId: users[2].id,
        createdById: users[1].id,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-04-01'),
      },
    }),
    prisma.task.create({
      data: {
        title: 'User Acceptance Testing',
        description: 'Conduct comprehensive user acceptance testing for CRM features',
        status: 'UAT',
        priority: 'HIGH',
        impact: 4,
        effort: 3,
        projectId: projects[4].id,
        assigneeId: users[2].id,
        createdById: users[1].id,
        startDate: new Date('2024-05-01'),
        endDate: new Date('2024-06-15'),
      },
    }),
  ])

  console.log('✅ Tasks created')

  // Create sample risks
  const risks = await Promise.all([
    prisma.risk.create({
      data: {
        title: 'Third-party API Dependency',
        description: 'Risk of third-party API changes affecting mobile app functionality',
        category: 'TECHNICAL',
        probability: 3,
        impact: 4,
        riskScore: 12,
        status: 'IDENTIFIED',
        mitigationPlan: 'Implement API versioning and fallback mechanisms',
        projectId: projects[0].id,
        assessorId: users[1].id,
      },
    }),
    prisma.risk.create({
      data: {
        title: 'Data Migration Complexity',
        description: 'Complex data transformation during legacy system migration',
        category: 'TECHNICAL',
        probability: 4,
        impact: 5,
        riskScore: 20,
        status: 'ASSESSED',
        mitigationPlan: 'Develop comprehensive data mapping and validation procedures',
        projectId: projects[2].id,
        assessorId: users[1].id,
      },
    }),
  ])

  console.log('✅ Risks created')

  // Create sample metrics
  const metrics = await Promise.all([
    prisma.projectMetric.create({
      data: {
        name: 'Development Progress',
        value: 65.5,
        unit: '%',
        category: 'PERFORMANCE',
        projectId: projects[0].id,
      },
    }),
    prisma.projectMetric.create({
      data: {
        name: 'Budget Utilization',
        value: 45.2,
        unit: '%',
        category: 'FINANCIAL',
        projectId: projects[0].id,
      },
    }),
    prisma.projectMetric.create({
      data: {
        name: 'ROI Projection',
        value: 125.5,
        unit: '%',
        category: 'FINANCIAL',
        projectId: projects[1].id,
      },
    }),
  ])

  console.log('✅ Metrics created')
  console.log('🎉 Database seeded successfully!')
  console.log('Created:')
  console.log('- 3 users (admin, manager, developer)')
  console.log('- 4 projects with enhanced data')
  console.log('- 3 tasks')
  console.log('- 2 risks')
  console.log('- 3 metrics')
  console.log('')
  console.log('Login credentials:')
  console.log('Admin: username=admin, password=admin123')
  console.log('Manager: username=manager, password=manager123')
  console.log('Developer: username=developer, password=dev123')
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