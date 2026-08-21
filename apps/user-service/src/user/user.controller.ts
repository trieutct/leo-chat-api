import { Body, Controller, Get, Post } from '@nestjs/common'
import { JoiValidationPipe } from '../common/pipes/joi-validation.pipe'
import { CreateUserDto } from './dto/create-user.dto'
import { createUserSchema } from './schemas/create-user.schema'
import { UserService } from './user.service'
import { UserEntity } from './entities/user.entity'

/** Controller nhận request tạo user, validate rồi giao cho service xử lý */
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /** Tạo user mới: verify email đồng bộ (RPC) trước, sau đó bắn event gửi mail chào mừng bất đồng bộ */
  @Post()
  create(
    @Body(new JoiValidationPipe(createUserSchema)) createUserDto: CreateUserDto,
  ): Promise<UserEntity> {
    return this.userService.create(createUserDto)
  }

  @Get()
  ping(): string {
    return 'pong'
  }
}
