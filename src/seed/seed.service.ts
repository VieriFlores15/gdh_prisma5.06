import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Role, OrganizationRole } from '@prisma/client'

@Injectable()
export class SeedService {
  constructor(private readonly prisma: PrismaService) {}

  async seed() {
    console.log('🌱 Iniciando seed...')

    // 🏢 Crear organización
    const organization = await this.prisma.organization.create({
      data: {
        name: 'Tech Solutions SAC',
        address: 'San Juan de Lurigancho - Lima'
      }
    })

    // 👤 Crear usuarios
    const user1 = await this.prisma.user.create({
      data: {
        email: 'admin@test.com',
        name: 'Carlos Admin',
        telephone: '999111222',
        password: '123456',
        role: Role.ADMIN
      }
    })

    const user2 = await this.prisma.user.create({
      data: {
        email: 'user1@test.com',
        name: 'Maria User',
        telephone: '988777666',
        password: '123456',
        role: Role.USER
      }
    })

    const user3 = await this.prisma.user.create({
      data: {
        email: 'user2@test.com',
        name: 'Juan User',
        telephone: '977555444',
        password: '123456',
        role: Role.USER
      }
    })

    // 🔗 Asociar usuarios a la organización
    await this.prisma.organizationMember.createMany({
      data: [
        {
          userId: user1.id,
          organizationId: organization.id,
          role: OrganizationRole.OWNER
        },
        {
          userId: user2.id,
          organizationId: organization.id,
          role: OrganizationRole.ADMIN
        },
        {
          userId: user3.id,
          organizationId: organization.id,
          role: OrganizationRole.MEMBER
        }
      ]
    })

    console.log('✅ Seed completado correctamente')

    return {
      organization,
      users: [user1, user2, user3]
    }
  }
}
