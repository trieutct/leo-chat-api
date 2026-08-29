/** Tên biến môi trường dùng để đọc qua ConfigService */
export enum ConfigKey {
  GATEWAY_SERVICE_PORT = 'GATEWAY_SERVICE_PORT',
  USER_SERVICE_URL = 'USER_SERVICE_URL',
}

/** Giá trị mặc định khi biến môi trường tương ứng không được cấu hình */
export enum AppDefault {
  // 3000 đã dùng cho app gốc (src/main.ts), 3001 đã dùng cho user-service -> gateway dùng 3002
  GATEWAY_SERVICE_PORT = 3002,
  USER_SERVICE_URL = 'http://localhost:3001',
}
