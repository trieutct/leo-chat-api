import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'
// user-service có schema/database riêng, độc lập hoàn toàn với app gốc
import { PrismaClient } from '../generated/prisma'
import { ConfigKey } from '../common/constants'

/** Service quản lý kết nối Prisma tới PostgreSQL, tự connect/disconnect theo vòng đời module */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name)

  constructor(configService: ConfigService) {
    // driver adapter bắt buộc với Prisma 7 khi bật previewFeatures driverAdapters
    const adapter = new PrismaPg({
      connectionString: configService.get<string>(
        ConfigKey.USER_SERVICE_DATABASE_URL,
      ),
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
