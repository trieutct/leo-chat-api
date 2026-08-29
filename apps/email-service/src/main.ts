import { NestFactory } from '@nestjs/core'
import { Transport, type MicroserviceOptions } from '@nestjs/microservices'
import * as amqplib from 'amqplib'
import { AppModule } from './app.module'
import {
  AppDefault,
  ConfigKey,
  EMAIL_SERVICE_DLQ,
  EMAIL_SERVICE_DLX,
  EMAIL_SERVICE_PREFETCH_COUNT,
  EMAIL_SERVICE_QUEUE,
} from './common/constants'

/** Assert sẵn dead letter exchange + dead letter queue trên RabbitMQ trước khi lắng nghe queue chính */
async function setupDeadLetterQueue(rabbitmqUrl: string): Promise<void> {
  const connection = await amqplib.connect(rabbitmqUrl)
  const channel = await connection.createChannel()

  await channel.assertExchange(EMAIL_SERVICE_DLX, 'fanout', { durable: true })
  await channel.assertQueue(EMAIL_SERVICE_DLQ, { durable: true })
  await channel.bindQueue(EMAIL_SERVICE_DLQ, EMAIL_SERVICE_DLX, '')

  await channel.close()
  await connection.close()
}

/** Khởi tạo email-service như 1 pure microservice, lắng nghe queue RabbitMQ (đóng vai consumer) */
async function bootstrap() {
  const rabbitmqUrl =
    process.env[ConfigKey.RABBITMQ_URL] ?? AppDefault.RABBITMQ_URL

  await setupDeadLetterQueue(rabbitmqUrl)

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl],
        queue: EMAIL_SERVICE_QUEUE,
        // manual ack: chỉ ack sau khi xử lý xong, nack (không requeue) khi lỗi để đẩy sang DLQ
        noAck: false,
        prefetchCount: EMAIL_SERVICE_PREFETCH_COUNT,
        queueOptions: {
          durable: true,
          // message bị nack (không requeue) sẽ được route sang DLX rồi vào DLQ thay vì mất
          arguments: {
            'x-dead-letter-exchange': EMAIL_SERVICE_DLX,
          },
        },
      },
    },
  )

  await app.listen()

  console.log(
    `email-service listening on queue "${EMAIL_SERVICE_QUEUE}" (DLQ: "${EMAIL_SERVICE_DLQ}")`,
  )
}
void bootstrap()
