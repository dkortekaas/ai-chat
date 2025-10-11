import { PrismaClient, UserRole, SubscriptionStatus, SubscriptionPlan } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create superuser
  const superuserPassword = await hash('superuser123', 12)
  const superuser = await prisma.user.upsert({
    where: { email: 'superuser@example.com' },
    update: {},
    create: {
      email: 'superuser@example.com',
      name: 'Super User',
      password: superuserPassword,
      role: UserRole.SUPERUSER,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      subscriptionPlan: SubscriptionPlan.ENTERPRISE,
    },
  })

  // Create normal user with trial
  const userPassword = await hash('user123', 12)
  const now = new Date()
  const trialEndDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)) // 30 days
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Normal User',
      password: userPassword,
      role: UserRole.USER,
      subscriptionStatus: SubscriptionStatus.TRIAL,
      trialStartDate: now,
      trialEndDate: trialEndDate,
    },
  })

  // Create admin user
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: UserRole.ADMIN,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
      subscriptionPlan: SubscriptionPlan.BUSINESS,
    },
  })

  // Skip notifications for now since the enum doesn't exist yet

  console.log('✅ Seed completed successfully!')
  console.log('👤 Superuser: superuser@example.com / superuser123')
  console.log('👤 Admin: admin@example.com / admin123')
  console.log('👤 User: user@example.com / user123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
