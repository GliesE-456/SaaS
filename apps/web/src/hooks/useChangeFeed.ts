import useSWRInfinite from 'swr/infinite';
import { FilterState } from '@/components/changes/FeedFilters';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useChangeFeed(filters: FilterState) {
  const getKey = (pageIndex: number, previousPageData: any) => {
    if (previousPageData && !previousPageData.nextCursor) return null; // reached the end

    let url = `/api/v1/changes?impact=${filters.impact}&readState=${filters.readState}`;
    if (pageIndex > 0 && previousPageData?.nextCursor) {
      url += `&cursor=${previousPageData.nextCursor}`;
    }
    return url;
  };

  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite(
    getKey,
    fetcher,
    { revalidateFirstPage: false }
  );

  const changes = data ? data.flatMap((page) => page.data) : [];
  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.data?.length === 0;
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.nextCursor === null);

  return {
    changes,
    error,
    isLoadingInitialData,
    isLoadingMore,
    isReachingEnd,
    isEmpty,
    loadMore: () => setSize(size + 1),
    mutate,
  };
}
