import { postApiV1GenericByModelNameSearchRead } from '@/core-client'
import { useQuery, UseQueryResult } from '@tanstack/react-query'

/**
 * Custom hook để lấy danh sách các công ty (ResCompany).
 *
 * @param pageIndex - Chỉ số trang hiện tại.
 * @param pageSize - Số lượng item trên mỗi trang.
 * @param domain - Chuỗi domain để lọc (tùy chọn).
 * @returns Kết quả của useQuery.
 */
export const useCompany = (
  pageIndex: number,
  pageSize: number,
  domain?: string
): UseQueryResult<Array<unknown>, unknown> => {
  return useQuery({
    queryKey: ['GetCompanies', pageIndex, pageSize, domain],
    queryFn: async () => {
      const { data } = await postApiV1GenericByModelNameSearchRead({
        path: { modelName: 'ResCompany' },
        body: {
          domain: domain || '',
          offset: pageIndex * pageSize,
          limit: pageSize,
          order: '',
        },
      })
      // API trả về một đối tượng, chúng ta cần trả về mảng `records` bên trong nó.
      // Dữ liệu thực tế nằm trong thuộc tính `records` của đối tượng `data`.
      //if (data && Array.isArray(data.records)) {
      //  return data.records
      //}

      return [] // Trả về mảng rỗng nếu không có dữ liệu hoặc cấu trúc không đúng
    },
  })
}
