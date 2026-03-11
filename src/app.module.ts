import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SeedService } from './seed/seed.service';
import { SeedModule } from './seed/seed.module'
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';


@Module({
  imports: [SeedModule, PrismaModule, UsersModule],
  controllers: [AppController],
  providers: [AppService, SeedService],
})
export class AppModule {}
