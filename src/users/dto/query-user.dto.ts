/** DTO query danh sách user kèm phân trang và tìm kiếm */
export class QueryUserDto {
  page?: number
  limit?: number
  keyword?: string
}
