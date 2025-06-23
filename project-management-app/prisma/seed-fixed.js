const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create sample users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        name: 'System Administrator',
        role: 'ADMIN',
        activeStatus: true,
      },
    }),
    prisma.user.create({
      data: {
        username: 'manager',
        email: 'manager@example.com',
        password: await bcrypt.hash('manager123', 10),
        name: 'Project Manager',
        role: 'MANAGER',
        activeStatus: true,
      },
    }),
    prisma.user.create({
      data: {
        username: 'developer',
        email: 'developer@example.com',
        password: await bcrypt.hash('dev123', 10),
        name: 'Senior Developer',
        role: 'MEMBER',
        activeStatus: true,
      },
    }),
  ])

  console.log('✅ Users created')

  // Create sample projects
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'Mobile App Development',
        description: 'Development of a comprehensive mobile application for customer engagement',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        businessImpact: 8,
        techEffort: 7,
        revenueUplift: 500000,
        headcountSaving: 2.5,
        projectValue: 750000,
        team: 'Mobile Development Team',
        country: 'Singapore',
        pic: 'John Doe',
        jiraUrl: 'https://company.atlassian.net/browse/MOB-123',
        wikiUrl: 'https://company.wiki/mobile-app-project',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-30'),
        managerId: users[1].id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Data Analytics Platform',
        description: 'Building a comprehensive data analytics platform for business intelligence',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        businessImpact: 7,
        techEffort: 8,
        revenueUplift: 250000,
        headcountSaving: 1.0,
        projectValue: 450000,
        team: 'Data Engineering Team',
        country: 'Malaysia',
        pic: 'Jane Smith',
        jiraUrl: 'https://company.atlassian.net/browse/DATA-456',
        wikiUrl: 'https://company.wiki/data-analytics-platform',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-08-31'),
        managerId: users[1].id,
      },
    }),
    prisma.project.create({
      data: {
        name: 'Legacy System Migration',
        description: 'Migration of legacy systems to modern cloud infrastructure',
        status: 'PLANNING',
        priority: 'HIGH',
        businessImpact: 9,
        techEffort: 9,
        revenueUplift: 800000,
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
        jiraUrl: 'https://company.atlassian.net/browse/CRM-789',
        wikiUrl: 'https://company.wiki/crm-upgrade-project',
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
        milestone: 'Phase 1 - Design',
        impact: 4,
        effort: 3,
        projectId: projects[0].id,
        assigneeId: users[2].id,
        createdById: users[1].id,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-15'),
        eta: new Date('2024-02-15'),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement User Authentication',
        description: 'Develop secure user authentication system',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        milestone: 'Phase 2 - Development',
        impact: 5,
        effort: 4,
        projectId: projects[0].id,
        assigneeId: users[2].id,
        createdById: users[1].id,
        startDate: new Date('2024-02-15'),
        endDate: new Date('2024-03-15'),
        eta: new Date('2024-03-20'),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Setup Data Pipeline',
        description: 'Configure data ingestion and processing pipeline',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        milestone: 'Phase 1 - Infrastructure',
        impact: 4,
        effort: 5,
        projectId: projects[1].id,
        assigneeId: users[2].id,
        createdById: users[1].id,
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-04-01'),
        eta: new Date('2024-04-05'),
      },
    }),
    prisma.task.create({
      data: {
        title: 'User Acceptance Testing',
        description: 'Conduct comprehensive user acceptance testing for CRM features',
        status: 'TODO',
        priority: 'HIGH',
        milestone: 'Phase 3 - Testing',
        impact: 4,
        effort: 3,
        projectId: projects[4].id,
        assigneeId: users[2].id,
        createdById: users[1].id,
        startDate: new Date('2024-05-01'),
        endDate: new Date('2024-06-15'),
        eta: new Date('2024-06-15'),
      },
    }),
    prisma.task.create({
      data: {
        title: 'API Documentation',
        description: 'Create comprehensive API documentation for mobile app',
        status: 'BLOCKED',
        priority: 'MEDIUM',
        milestone: 'Phase 2 - Development',
        impact: 3,
        effort: 2,
        projectId: projects[0].id,
        assigneeId: users[2].id,
        createdById: users[1].id,
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-03-15'),
        eta: new Date('2024-01-15'), // Overdue task for testing
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
        severity: 'HIGH',
        likelihood: 'MEDIUM',
        probability: 3,
        impact: 4,
        riskScore: 12,
        status: 'IDENTIFIED',
        mitigationPlan: 'Implement API versioning and fallback mechanisms',
        projectId: projects[0].id,
        assessorId: users[1].id,
        ownerId: users[2].id,
      },
    }),
    prisma.risk.create({
      data: {
        title: 'Data Migration Complexity',
        description: 'Complex data transformation during legacy system migration',
        category: 'TECHNICAL',
        severity: 'CRITICAL',
        likelihood: 'HIGH',
        probability: 4,
        impact: 5,
        riskScore: 20,
        status: 'ASSESSED',
        mitigationPlan: 'Develop comprehensive data mapping and validation procedures',
        projectId: projects[2].id,
        assessorId: users[1].id,
        ownerId: users[1].id,
      },
    }),
    prisma.risk.create({
      data: {
        title: 'Resource Availability',
        description: 'Key team members may not be available during critical project phases',
        category: 'RESOURCE',
        severity: 'MEDIUM',
        likelihood: 'MEDIUM',
        probability: 3,
        impact: 3,
        riskScore: 9,
        status: 'MITIGATED',
        mitigationPlan: 'Cross-train team members and maintain backup resources',
        projectId: projects[1].id,
        assessorId: users[1].id,
        ownerId: users[1].id,
      },
    }),
  ])

  console.log('✅ Risks created')

  // Create sample change requests
  const changeRequests = await Promise.all([
    prisma.changeRequest.create({
      data: {
        title: 'Add Social Media Login',
        description: 'Request to add social media login options (Google, Facebook, Apple)',
        impact: 'Medium - Will require additional development time and testing',
        status: 'PENDING',
        projectId: projects[0].id,
        requestedBy: users[1].id,
      },
    }),
    prisma.changeRequest.create({
      data: {
        title: 'Enhanced Reporting Dashboard',
        description: 'Add advanced filtering and export capabilities to reporting dashboard',
        impact: 'High - Significant development effort but high business value',
        status: 'APPROVED',
        projectId: projects[1].id,
        requestedBy: users[1].id,
      },
    }),
  ])

  console.log('✅ Change Requests created')

  // Create sample activity logs
  const activityLogs = await Promise.all([
    prisma.activityLog.create({
      data: {
        action: 'Task status changed',
        oldValue: 'TODO',
        newValue: 'IN_PROGRESS',
        field: 'status',
        projectId: projects[0].id,
        taskId: tasks[1].id,
        userId: users[2].id,
      },
    }),
    prisma.activityLog.create({
      data: {
        action: 'Project status updated',
        oldValue: 'PLANNING',
        newValue: 'UAT',
        field: 'status',
        projectId: projects[4].id,
        userId: users[1].id,
      },
    }),
    prisma.activityLog.create({
      data: {
        action: 'Risk assessment completed',
        oldValue: 'IDENTIFIED',
        newValue: 'ASSESSED',
        field: 'status',
        projectId: projects[2].id,
        userId: users[1].id,
      },
    }),
  ])

  console.log('✅ Activity Logs created')

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
  console.log('- 5 projects with enhanced data (including UAT status project)')
  console.log('- 5 tasks with milestones and ETAs')
  console.log('- 3 risks with proper severity/likelihood')
  console.log('- 2 change requests')
  console.log('- 3 activity logs')
  console.log('- 3 metrics')
  console.log('')
  console.log('Login credentials:')
  console.log('Admin: username=admin, password=admin123')
  console.log('Manager: username=manager, password=manager123')
  console.log('Developer: username=developer, password=dev123')
  console.log('')
  console.log('Sample project with UAT status: "CRM System Upgrade"')
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