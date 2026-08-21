import { NestFactory } from '@nestjs/core'
import { Transport, type MicroserviceOptions } from '@nestjs/microservices'
import { AppModule } from './app.module'
import { AppDefault, ConfigKey, EMAIL_SERVICE_QUEUE } from './common/constants'

/** Khởi tạo email-service như 1 pure microservice, lắng nghe queue RabbitMQ (đóng vai consumer) */
async function bootstrap() {
  const rabbitmqUrl =
    process.env[ConfigKey.RABBITMQ_URL] ?? AppDefault.RABBITMQ_URL

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl],
        queue: EMAIL_SERVICE_QUEUE,
        queueOptions: {
          durable: true,
        },
      },
    },
  )

  await app.listen()

  console.log(`email-service listening on queue "${EMAIL_SERVICE_QUEUE}"`)
}
void bootstrap()
