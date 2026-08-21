import { Module } from '@nestjs/common'
import { RabbitmqClientModule } from '../rabbitmq/rabbitmq-client.module'
import { UserController } from './user.controller'
import { UserService } from './user.service'

/** Module quản lý nghiệp vụ user, kết nối sang email-service qua RabbitMQ */
@Module({
  imports: [RabbitmqClientModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
