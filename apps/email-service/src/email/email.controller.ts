import { Controller } from '@nestjs/common'
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices'
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
  constructor(private readonly emailService: EmailService) {}

  /** SYNC - RPC: verify email và trả kết quả về cho user-service chờ */
  @MessagePattern(EmailMessagePattern.VERIFY_EMAIL)
  verifyEmail(@Payload() payload: { email: string }) {
    return this.emailService.verifyEmail(payload.email)
  }

  /** ASYNC - Event: gửi mail chào mừng, không trả kết quả về cho bên gửi */
  @EventPattern(EmailMessagePattern.USER_CREATED)
  handleUserCreated(@Payload() payload: UserCreatedPayload) {
    this.emailService.sendWelcomeEmail(payload)
  }
}
