import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma'
import { ConfigKey } from 'src/common/constants'

/** Service quản lý kết nối Prisma tới PostgreSQL, tự connect/disconnect theo vòng đời module */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name)

  constructor(config_service: ConfigService) {
    // driver adapter bắt buộc với Prisma 7 khi bật previewFeatures driverAdapters
    const adapter = new PrismaPg({
      connectionString: config_service.get<string>(ConfigKey.DATABASE_URL),
    })
    super({ adapter })
  }

  /** Kết nối tới database khi module khởi động */
  async onModuleInit(): Promise<void> {
    await this.$connect()
    this.logger.verbose('Đã kết nối PostgreSQL qua Prisma')
  }

  /** Ngắt kết nối database khi module bị hủy */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect()
  }
}
