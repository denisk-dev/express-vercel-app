export const skip = (pageNumber: number, pageSize: number) =>
  pageNumber > 0 ? (pageNumber - 1) * pageSize : 0;

export const getSortBy = (sortDirection: string, sortBy: string) => {
  const sortObj: any = {};
  if (sortBy && sortDirection) {
    sortObj[sortBy] = sortDirection === "desc" ? -1 : 1;
  }

  return sortObj;
};

export default { skip };
