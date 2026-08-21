/** Tên biến môi trường dùng để đọc qua ConfigService */
export enum ConfigKey {
  RABBITMQ_URL = 'RABBITMQ_URL',
}

/** Giá trị mặc định khi biến môi trường tương ứng không được cấu hình */
export enum AppDefault {
  RABBITMQ_URL = 'amqp://guest:guest@localhost:5672',
}

/** Tên queue RabbitMQ mà email-service lắng nghe */
export const EMAIL_SERVICE_QUEUE = 'email_service_queue'

/** Pattern message dùng trong giao tiếp giữa user-service và email-service */
export enum EmailMessagePattern {
  /** RPC đồng bộ: verify email trước khi tạo user, chờ kết quả trả về */
  VERIFY_EMAIL = 'verify_email',
  /** Event bất đồng bộ: bắn đi sau khi tạo user xong, không chờ kết quả */
  USER_CREATED = 'user_created',
}
