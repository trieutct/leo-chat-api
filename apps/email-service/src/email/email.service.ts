import { Injectable, Logger } from '@nestjs/common'

/** Kết quả verify email trả về cho user-service qua RPC */
export interface VerifyEmailResult {
  is_valid: boolean
  reason?: string
}

/** Danh sách domain email bị chặn, dùng để demo nhánh verify thất bại */
const BLOCKED_EMAIL_DOMAINS = ['blocked.com']

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)

  /** Verify email hợp lệ hay không (giả lập, không gọi service thật) */
  verifyEmail(email: string): VerifyEmailResult {
    this.logger.log(`[SYNC] Đang verify email: ${email}`)

    const domain = email.split('@')[1]
    if (domain && BLOCKED_EMAIL_DOMAINS.includes(domain)) {
      return { is_valid: false, reason: `Domain "${domain}" bị chặn` }
    }

    return { is_valid: true }
  }

  /** Gửi mail chào mừng (giả lập, chỉ log ra console) */
  sendWelcomeEmail(payload: {
    user_id: string
    name: string
    email: string
  }): void {
    this.logger.log(
      `[ASYNC] Đã gửi mail chào mừng tới ${payload.email} (user: ${payload.name}, id: ${payload.user_id})`,
    )
  }
}
