/** Tên biến môi trường dùng để đọc qua ConfigService */
export enum ConfigKey {
  PORT = 'PORT',
  DATABASE_URL = 'DATABASE_URL',
}

/** Giá trị mặc định khi biến môi trường tương ứng không được cấu hình */
export enum AppDefault {
  PORT = 3000,
}

/** Mã trạng thái/lỗi dùng chung cho response API (gồm cả HTTP status chuẩn và mã lỗi nghiệp vụ riêng) */
export enum HttpStatus {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  GROUP_HAS_CHILDREN = 410,
  GROUP_MAX_LEVEL = 411,
  GROUP_MAX_QUANTITY = 412,
  ITEM_NOT_FOUND = 444,
  ITEM_ALREADY_EXIST = 445,
  ITEM_INVALID = 446,
  NETWORK_ERROR = 447,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
  UNSUPPORTED_MEDIA_TYPE = 415,
  ITEM_IS_USING = 449,
  OVER_LIMIT = 450,
  ITEM_IS_INVALID = 448,
}
