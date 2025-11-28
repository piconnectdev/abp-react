import { appsControllerFindAll } from '@/core-client'
import { PagedResultDtoOfAppDto } from '@/core-client/types.gen'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { QueryNames } from '../QueryConstants'

/**
 * Custom hook để lấy danh sách các "apps" từ core-service.
 *
 * @param pageIndex - Chỉ số trang hiện tại.
 * @param pageSize - Số lượng item trên mỗi trang.
 * @param filter - Chuỗi lọc (tùy chọn).
 * @returns Kết quả của useQuery, bao gồm dữ liệu, trạng thái, và các thuộc tính khác.
 */
export const useApps = (
  pageIndex: number,
  pageSize: number,
  filter?: string
): UseQueryResult<PagedResultDtoOfAppDto, unknown> => {
  return useQuery({
    queryKey: [QueryNames.GetApps, pageIndex, pageSize, filter],
    queryFn: async () => {
      const { data } = await appsControllerFindAll({
        query: {
          SkipCount: pageIndex * pageSize,
          MaxResultCount: pageSize,
          Filter: filter,
        },
      })
      return data
    },
  })
}
