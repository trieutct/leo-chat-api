import { Global, Module } from '@nestjs/common'
import { PrismaService } from './prisma.service'

/** Module dùng chung cho PrismaService, Global để không phải import lại ở từng feature module */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
