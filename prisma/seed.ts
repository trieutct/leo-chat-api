import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma'

const TOTAL_RECORD = 10_000
const BATCH_SIZE = 1_000

/** Sinh dữ liệu user giả để test tốc độ query có/không index */
function buildFakeUsers(prefix: string, count: number, offset: number) {
  return Array.from({ length: count }, (_, index) => {
    const seq = offset + index
    return {
      email: `${prefix}_${seq}@example.com`,
      name: `${prefix} User ${seq}`,
    }
  })
}

/** Seed dữ liệu vào 2 bảng users (có index) và users_2 (không index) theo batch */
async function seedData(prisma: PrismaClient): Promise<void> {
  console.log(`Bắt đầu seed ${TOTAL_RECORD} record cho mỗi bảng...`)

  // Xóa data cũ để đảm bảo seed sạch, tránh trùng lặp
  await prisma.user.deleteMany()
  // await prisma.user2.deleteMany()

  for (let offset = 0; offset < TOTAL_RECORD; offset += BATCH_SIZE) {
    const batch_size = Math.min(BATCH_SIZE, TOTAL_RECORD - offset)

    // Dùng cùng prefix để 2 bảng có data giống hệt nhau -> so sánh công bằng
    // await prisma.user.createMany({
    //   data: buildFakeUsers('user', batch_size, offset),
    // })

    // await prisma.user2.createMany({
    //   data: buildFakeUsers('user', batch_size, offset),
    // })

    // await Promise.all([
    //   prisma.user.createMany({
    //     data: buildFakeUsers('user', batch_size, offset),
    //   }),
    //   prisma.user2.createMany({
    //     data: buildFakeUsers('user', batch_size, offset),
    //   }),
    // ])

    console.log(`Đã seed ${offset + batch_size}/${TOTAL_RECORD}`)
  }

  console.log('Seed hoàn tất.\n')
}

/** Đo thời gian tìm kiếm 1 email cụ thể trên 1 bảng, chạy nhiều lần lấy trung bình */
async function measureSearch(
  label: string,
  runOnce: () => Promise<unknown>,
  loop = 100,
): Promise<void> {
  // Warm-up 1 lần để loại nhiễu lần đầu (connection, cache...)
  await runOnce()

  const start = performance.now()
  for (let i = 0; i < loop; i++) {
    await runOnce()
  }
  const elapsed = performance.now() - start

  // In tổng thời gian và trung bình mỗi query
  console.log(
    `[${label}] ${loop} query mất ${elapsed.toFixed(2)}ms — trung bình ${(
      elapsed / loop
    ).toFixed(3)}ms/query`,
  )
}

/** So sánh tốc độ tìm kiếm giữa bảng có index và không index */
async function benchmarkSearch(prisma: PrismaClient): Promise<void> {
  // Email nằm gần cuối để buộc phải quét nhiều nếu không có index
  const target_email = `user_${TOTAL_RECORD - 1}@example.com`
  console.log(`Tìm kiếm email: ${target_email}\n`)

  // Bảng users: có index trên email
  await measureSearch('CÓ index (users)', () =>
    prisma.user.findFirst({ where: { email: target_email } }),
  )

  // Bảng users_2: không index trên email -> phải full scan
  await measureSearch('KHÔNG index (users_2)', () =>
    prisma.user.findFirst({ where: { email: target_email } }),
  )
}

/** Xem query plan để xác nhận bảng nào dùng Index Scan, bảng nào Seq Scan */
async function explainQuery(prisma: PrismaClient): Promise<void> {
  const target_email = `user_${TOTAL_RECORD - 1}@example.com`

  console.log('\n--- EXPLAIN ANALYZE ---')

  const plan_indexed = await prisma.$queryRawUnsafe(
    `EXPLAIN ANALYZE SELECT * FROM users WHERE name = $1`,
    target_email,
  )
  console.log('users (có index):')
  console.dir(plan_indexed, { depth: null })

  const plan_no_index = await prisma.$queryRawUnsafe(
    `EXPLAIN ANALYZE SELECT * FROM users_2 WHERE name = $1`,
    target_email,
  )
  console.log('\nusers_2 (không index):')
  console.dir(plan_no_index, { depth: null })
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL chưa được load')
  }

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  })
  const prisma = new PrismaClient({ adapter })

  try {
    await seedData(prisma)
    await benchmarkSearch(prisma)
    await explainQuery(prisma)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(error => {
  console.error('Chạy thất bại:', error)
  process.exit(1)
})
