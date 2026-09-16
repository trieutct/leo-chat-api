import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { QueryUserDto } from './dto/query-user.dto'
import type { User } from 'src/generated/prisma'
import { CommonListResponse } from 'src/utils/api.response'

/** Giá trị mặc định khi query danh sách user không truyền phân trang */
const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Tạo mới user, kiểm tra email trùng trước khi ghi DB */
  async create(dto: CreateUserDto): Promise<User> {
    const existed = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })
    if (existed) {
      throw new ConflictException('Email đã tồn tại')
    }

    return this.prisma.user.create({ data: dto })
  }

  /** Lấy danh sách user có phân trang, kèm tìm kiếm theo email/name */
  async findAll(query: QueryUserDto): Promise<CommonListResponse<User>> {
    const page = query.page && query.page > 0 ? query.page : DEFAULT_PAGE
    const limit = query.limit && query.limit > 0 ? query.limit : DEFAULT_LIMIT
    const keyword = query.keyword?.trim()

    // keyword rỗng thì không filter, tránh where thừa
    const where = keyword
      ? {
          OR: [
            { email: { contains: keyword, mode: 'insensitive' as const } },
            { name: { contains: keyword, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [items, totalItems] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ])

    return { items, total_items: totalItems }
  }

  /** Lấy chi tiết 1 user theo id, ném lỗi nếu không tìm thấy */
  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) {
      throw new NotFoundException('Không tìm thấy user')
    }
    return user
  }

  /** Cập nhật user theo id, kiểm tra tồn tại và email trùng (nếu đổi email) */
  async update(id: string, dto: UpdateUserDto): Promise<User> {
    await this.findOne(id)

    if (dto.email) {
      const existed = await this.prisma.user.findUnique({
        where: { email: dto.email },
      })
      if (existed && existed.id !== id) {
        throw new ConflictException('Email đã tồn tại')
      }
    }

    return this.prisma.user.update({ where: { id }, data: dto })
  }

  /** Xóa user theo id, ném lỗi nếu không tìm thấy */
  async remove(id: string): Promise<void> {
    await this.findOne(id)
    await this.prisma.user.delete({ where: { id } })
  }
}
