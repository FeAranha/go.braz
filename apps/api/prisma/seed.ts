import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function seed() {
  await prisma.organization.deleteMany()
  await prisma.user.deleteMany()
  await prisma.timeline.deleteMany() // Limpar timelines antes de inserir novas
  await prisma.service.deleteMany() // Limpar serviços antes de inserir novos

  // Criar múltiplos usuários
  const passwordHash = await hash('123456', 1)
  const users = await Promise.all(
    Array.from({ length: 3 }).map(() =>
      prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          avatarUrl: faker.image.avatar(),
          passwordHash,
        },
      }),
    ),
  )

  // Criar múltiplos serviços
  const services = await Promise.all(
    Array.from({ length: 3 }).map(() =>
      prisma.service.create({
        data: {
          item: faker.number.int({ min: 1, max: 10 }), // Exemplo de valor
          name: faker.commerce.productName(),
          description: faker.lorem.sentence(),
        },
      }),
    ),
  )

  // Criar múltiplas timelines utilizando os IDs dos serviços criados
  const timelines = await Promise.all(
    services.map((service) =>
      prisma.timeline.create({
        data: {
          startDate: new Date(), // Data de início
          endDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1),
          ), // Data de término
          serviceId: service.id, // Relacionar com o serviço criado
        },
      }),
    ),
  )

  // Criar uma organização
  await prisma.organization.create({
    data: {
      name: 'Acme Inc (Admin)',
      domain: 'acme.com',
      slug: 'acme-admin',
      avatarUrl: faker.image.avatar(),
      shouldAttachUsersByDomain: true,
      ownerId: users[0].id, // Usar o primeiro usuário como owner
      projects: {
        createMany: {
          data: Array.from({ length: 3 }).map((_, index) => ({
            name: faker.lorem.words(5),
            slug: faker.lorem.slug(5),
            description: faker.lorem.paragraph(),
            avatarUrl: faker.image.avatar(),
            ownerId: users[index % users.length].id, // Atribuir aleatoriamente os usuários
            phase: 'PRELIMINARY', // Defina um valor estático para simplificar
            taxesCollected: faker.datatype.boolean(),
            protocolSubmittedToCity: faker.datatype.boolean(),
            cityProjectApproved: faker.datatype.boolean(),
            projectInExecution: faker.datatype.boolean(),
            cnoRegistered: faker.datatype.boolean(),
            SEROmeasured: faker.datatype.boolean(),
            cndRF: faker.datatype.boolean(),
            timelineId: timelines[index % timelines.length].id, // Relacionar a timeline criada
          })),
        },
      },
    },
  })

  console.log(
    'Database seeded with 3 users, 3 services, 3 timelines, and 1 organization!',
  )
}

// Executar a seed
seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
