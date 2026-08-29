import { Controller, Logger } from '@nestjs/common'
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices'
import { EmailMessagePattern } from '../common/constants'
import { EmailService } from './email.service'

/** Payload event khi user-service tạo user thành công */
interface UserCreatedPayload {
  user_id: string
  name: string
  email: string
}

/** Controller nhận message RabbitMQ từ user-service, gồm cả RPC (sync) và event (async) */
@Controller()
export class EmailController {
  private readonly logger = new Logger(EmailController.name)

  constructor(private readonly emailService: EmailService) {}

  /** SYNC - RPC: verify email và trả kết quả về cho user-service chờ */
  @MessagePattern(EmailMessagePattern.VERIFY_EMAIL)
  verifyEmail(@Payload() payload: { email: string }) {
    return this.emailService.verifyEmail(payload.email)
  }

  /**
   * ASYNC - Event: gửi mail chào mừng, không trả kết quả về cho bên gửi.
   * Ack thủ công sau khi xử lý xong; nếu lỗi thì nack không requeue để message
   * được RabbitMQ route sang dead letter queue thay vì mất hoặc lặp vô hạn.
   */
  @EventPattern(EmailMessagePattern.USER_CREATED)
  async handleUserCreated(
    @Payload() payload: UserCreatedPayload,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef()
    const originalMsg = context.getMessage()

    try {
      await this.emailService.sendWelcomeEmail(payload)
      channel.ack(originalMsg)
    } catch (error) {
      this.logger.error(
        `Xử lý user_created thất bại (user: ${payload.user_id}), đẩy sang DLQ: ${error}`,
      )
      // requeue: false -> không lặp vô hạn, message lỗi sẽ vào dead letter queue
      channel.nack(originalMsg, false, false)
    }
  }

  @EventPattern(EmailMessagePattern.TEST_QUEUE_ERROR)
  async testQueueErrror(@Ctx() context: RmqContext) {
    const channel = context.getChannelRef()
    const originalMsg = context.getMessage()

    try {
      await this.emailService.testMessageQueueError('triệu test')
      channel.ack(originalMsg)
    } catch (error) {
      this.logger.error(`Xử lý testQueueErrror thất bại`, { error })
      // requeue: false -> không lặp vô hạn, message lỗi sẽ vào dead letter queue
      channel.nack(originalMsg, false, false)
    }
  }
}
