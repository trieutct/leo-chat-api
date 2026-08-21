import { Module } from '@nestjs/common'
import { EmailController } from './email.controller'
import { EmailService } from './email.service'

/** Module xử lý nghiệp vụ email, đóng vai consumer của RabbitMQ */
@Module({
  controllers: [EmailController],
  providers: [EmailService],
})
export class EmailModule {}
