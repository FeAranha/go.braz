import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function seed() {
  await prisma.organization.deleteMany()
  await prisma.user.deleteMany()
  await prisma.timeline.deleteMany()
  await prisma.service.deleteMany()

  const passwordHash = await hash('123456', 1)

  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@acme.com',
      avatarUrl: 'https://github.com/fearanha.png',
      passwordHash,
    },
  })

  const anotherUser = await prisma.user.create({
    data: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      avatarUrl: faker.image.avatarLegacy(),
      passwordHash,
    },
  })

  const anotherUser2 = await prisma.user.create({
    data: {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      avatarUrl: faker.image.avatarLegacy(),
      passwordHash,
    },
  })

  const services = await Promise.all(
    Array.from({ length: 3 }).map(() =>
      prisma.service.create({
        data: {
          item: faker.number.int({ min: 1, max: 10 }),
          name: faker.commerce.productName(),
          description: faker.lorem.sentence(),
        },
      }),
    ),
  )

  const timelines = await Promise.all(
    services.map((service) =>
      prisma.timeline.create({
        data: {
          startDate: new Date(),
          endDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1),
          ),
          serviceId: service.id,
        },
      }),
    ),
  )

  await prisma.organization.create({
    data: {
      name: 'Acme Inc (Admin)',
      domain: 'acme.com',
      slug: 'acme-admin',
      avatarUrl: faker.image.avatarGitHub(),
      shouldAttachUsersByDomain: true,
      ownerId: user.id,
      projects: {
        createMany: {
          data: Array.from({ length: 3 }).map((_, index) => ({
            name: faker.lorem.words(5),
            slug: faker.lorem.slug(5),
            description: faker.lorem.paragraph(),
            avatarUrl: faker.image.avatarGitHub(),
            ownerId: user.id,
            phase: 'PRELIMINARY',
            taxesCollected: faker.datatype.boolean(),
            protocolSubmittedToCity: faker.datatype.boolean(),
            cityProjectApproved: faker.datatype.boolean(),
            projectInExecution: faker.datatype.boolean(),
            cnoRegistered: faker.datatype.boolean(),
            SEROmeasured: faker.datatype.boolean(),
            cndRF: faker.datatype.boolean(),
            timelineId: timelines[index].id,
          })),
        },
      },
      members: {
        createMany: {
          data: [
            {
              userId: user.id,
              role: 'ADMIN',
            },
            {
              userId: anotherUser.id,
              role: 'MEMBER',
            },
            {
              userId: anotherUser2.id,
              role: 'MEMBER',
            },
          ],
        },
      },
    },
  })

  await prisma.organization.create({
    data: {
      name: 'Acme Inc (Billing)',
      slug: 'acme-billing',
      avatarUrl: faker.image.avatarGitHub(),
      shouldAttachUsersByDomain: true,
      ownerId: user.id,
      projects: {
        createMany: {
          data: Array.from({ length: 3 }).map((_, index) => ({
            name: faker.lorem.words(5),
            slug: faker.lorem.slug(5),
            description: faker.lorem.paragraph(),
            avatarUrl: faker.image.avatarGitHub(),
            ownerId: anotherUser.id,
            phase: 'PRELIMINARY',
            taxesCollected: faker.datatype.boolean(),
            protocolSubmittedToCity: faker.datatype.boolean(),
            cityProjectApproved: faker.datatype.boolean(),
            projectInExecution: faker.datatype.boolean(),
            cnoRegistered: faker.datatype.boolean(),
            SEROmeasured: faker.datatype.boolean(),
            cndRF: faker.datatype.boolean(),
            timelineId: timelines[index].id,
          })),
        },
      },
      members: {
        createMany: {
          data: [
            {
              userId: user.id,
              role: 'BILLING',
            },
            {
              userId: anotherUser.id,
              role: 'ADMIN',
            },
            {
              userId: anotherUser2.id,
              role: 'MEMBER',
            },
          ],
        },
      },
    },
  })

  await prisma.organization.create({
    data: {
      name: 'Acme Inc (Member)',
      slug: 'acme-member',
      avatarUrl: faker.image.avatarGitHub(),
      shouldAttachUsersByDomain: true,
      ownerId: user.id,
      projects: {
        createMany: {
          data: Array.from({ length: 3 }).map((_, index) => ({
            name: faker.lorem.words(5),
            slug: faker.lorem.slug(5),
            description: faker.lorem.paragraph(),
            avatarUrl: faker.image.avatarGitHub(),
            ownerId: anotherUser2.id,
            phase: 'PRELIMINARY',
            taxesCollected: faker.datatype.boolean(),
            protocolSubmittedToCity: faker.datatype.boolean(),
            cityProjectApproved: faker.datatype.boolean(),
            projectInExecution: faker.datatype.boolean(),
            cnoRegistered: faker.datatype.boolean(),
            SEROmeasured: faker.datatype.boolean(),
            cndRF: faker.datatype.boolean(),
            timelineId: timelines[index].id,
          })),
        },
      },
      members: {
        createMany: {
          data: [
            {
              userId: user.id,
              role: 'MEMBER',
            },
            {
              userId: anotherUser.id,
              role: 'ADMIN',
            },
            {
              userId: anotherUser2.id,
              role: 'MEMBER',
            },
          ],
        },
      },
    },
  })
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
