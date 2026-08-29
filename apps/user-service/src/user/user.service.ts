import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import {
  catchError,
  firstValueFrom,
  throwError,
  timeout,
  TimeoutError,
} from 'rxjs'
import { PrismaService } from '../prisma/prisma.service'
import { EMAIL_SERVICE_CLIENT } from '../rabbitmq/rabbitmq-client.module'
import { EmailMessagePattern } from '../common/constants'
import { CreateUserDto } from './dto/create-user.dto'
import { UserEntity } from './entities/user.entity'

/** Kết quả trả về từ email-service khi verify email qua RPC */
interface VerifyEmailResult {
  is_valid: boolean
  reason?: string
}

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)

  constructor(
    private readonly prisma: PrismaService,
    @Inject(EMAIL_SERVICE_CLIENT) private readonly emailClient: ClientProxy,
  ) {}

  /** Tạo user: verify email đồng bộ (RPC) trước khi ghi DB, xong bắn event async gửi mail chào mừng */
  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    this.emailClient.emit(EmailMessagePattern.TEST_QUEUE_ERROR, {})
    // bước 1 - SYNC: gọi RPC sang email-service, chờ kết quả verify trước khi tạo user
    const verifyResult = await this.verifyEmail(createUserDto.email)
    if (!verifyResult.is_valid) {
      throw new BadRequestException(verifyResult.reason ?? 'Email không hợp lệ')
    }

    const existedUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    })
    if (existedUser) {
      throw new ConflictException('Email đã được sử dụng')
    }

    const user = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
      },
    })

    // bước 2 - ASYNC: bắn event gửi mail chào mừng, không chờ kết quả (fire-and-forget)
    this.emailClient.emit(EmailMessagePattern.USER_CREATED, {
      user_id: user.id,
      name: user.name,
      email: user.email,
    })

    return user
  }

  /** Gọi RPC verify_email tới email-service qua reply queue, timeout 5s nếu không có phản hồi */
  private async verifyEmail(email: string): Promise<VerifyEmailResult> {
    return firstValueFrom(
      this.emailClient
        .send<VerifyEmailResult>(EmailMessagePattern.VERIFY_EMAIL, { email })
        .pipe(
          timeout(5000),
          catchError((error: unknown) => {
            if (error instanceof TimeoutError) {
              this.logger.error(`Verify email timeout: ${email}`)
              return throwError(
                () =>
                  new ServiceUnavailableException(
                    'email-service không phản hồi, vui lòng thử lại',
                  ),
              )
            }
            return throwError(() => error)
          }),
        ),
    )
  }
}
