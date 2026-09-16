import { Module } from '@nestjs/common'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

/** Module quản lý CRUD user */
@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
