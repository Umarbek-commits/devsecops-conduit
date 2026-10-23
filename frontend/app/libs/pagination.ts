export function buildPaginationHref(
  pathname: string,
  search: string,
  page: number,
): string {
  const searchParams = new URLSearchParams(search);
  searchParams.set("page", String(page));
  return `${pathname}?${searchParams.toString()}`;
}
