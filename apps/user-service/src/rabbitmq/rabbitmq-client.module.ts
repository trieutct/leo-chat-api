import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ClientProxyFactory, Transport } from '@nestjs/microservices'
import { AppDefault, ConfigKey, EMAIL_SERVICE_QUEUE } from '../common/constants'

/** Token DI để inject ClientProxy kết nối tới email-service qua RabbitMQ */
export const EMAIL_SERVICE_CLIENT = 'EMAIL_SERVICE_CLIENT'

/** Module cung cấp ClientProxy dùng chung để user-service gọi sang email-service (cả RPC lẫn event) */
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: EMAIL_SERVICE_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [
              configService.get<string>(ConfigKey.RABBITMQ_URL) ??
                AppDefault.RABBITMQ_URL,
            ],
            queue: EMAIL_SERVICE_QUEUE,
            queueOptions: {
              durable: true,
            },
          },
        }),
    },
  ],
  exports: [EMAIL_SERVICE_CLIENT],
})
export class RabbitmqClientModule {}
