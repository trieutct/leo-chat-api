import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { QueryUserDto } from './dto/query-user.dto'
import { createUserSchema } from './schemas/create-user.schema'
import { updateUserSchema } from './schemas/update-user.schema'
import { JoiValidationPipe } from 'src/common/pipes/joi-validation.pipe'
import { SuccessListResponse } from 'src/utils/api.response'

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name)

  constructor(private readonly usersService: UsersService) {}

  /** Lấy danh sách user có phân trang, tìm kiếm theo email/name */
  @Get()
  async findAll(@Query() query: QueryUserDto) {
    this.logger.log(`findAll - query: ${JSON.stringify(query)}`)
    const { items, total_items } = await this.usersService.findAll(query)
    return new SuccessListResponse(items, total_items)
  }

  /** Lấy chi tiết 1 user theo id */
  @Get(':id')
  findOne(@Param('id') id: string) {
    this.logger.log(`findOne - id: ${id}`)
    return this.usersService.findOne(id)
  }

  /** Tạo mới user */
  @Post()
  create(@Body(new JoiValidationPipe(createUserSchema)) dto: CreateUserDto) {
    this.logger.log(`create - email: ${dto.email}`)
    return this.usersService.create(dto)
  }

  /** Cập nhật user theo id */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new JoiValidationPipe(updateUserSchema)) dto: UpdateUserDto,
  ) {
    this.logger.log(`update - id: ${id}, dto: ${JSON.stringify(dto)}`)
    return this.usersService.update(id, dto)
  }

  /** Xóa user theo id */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    this.logger.log(`remove - id: ${id}`)
    await this.usersService.remove(id)
    return null
  }
}
