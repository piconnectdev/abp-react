// /src/lib/api-client.ts
// Chúng ta không cần các factory function nữa vì client được cấu hình tại điểm khởi tạo.
// File này có thể được giữ lại cho các helper function khác hoặc xóa đi nếu không còn gì.

import { User } from 'oidc-client-ts'
import { getUserManager } from './oidc-client'

/**
 * Helper để lấy thông tin user từ oidc-client-ts.
 * Chỉ hoạt động ở phía client.
 * @returns Promise chứa thông tin user hoặc null.
 */
async function getCurrentUser(): Promise<User | null> {
  // Hàm này chỉ nên được gọi ở client-side, nơi `window` object tồn tại.
  const userManager = getUserManager()
  // getUser() sẽ trả về user từ storage (sessionStorage/localStorage) nếu có.
  return await userManager.getUser()
}
