export const uniqBy = <T>(arr: T[], key: keyof T): T[] =>
  Object.values(
    arr.reduce(
      (map, item) => ({
        ...map,
        [`${item[key]}`]: item,
      }),
      {},
    ),
  );
