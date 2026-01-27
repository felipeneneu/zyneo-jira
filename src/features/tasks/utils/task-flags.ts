export type TaskPriority = "P1" | "P2" | "P3";

const FLAG_VALUE_SEPARATOR = ":";

const isKeyValueFlag = (flag: string) => flag.includes(FLAG_VALUE_SEPARATOR);

export const normalizeFlags = (flags?: string[] | null) =>
  Array.isArray(flags) ? [...flags] : [];

export const getFlagValue = (flags: string[] | null | undefined, key: string) => {
  const list = normalizeFlags(flags);
  const match = list.find((flag) => flag.startsWith(`${key}${FLAG_VALUE_SEPARATOR}`));
  if (!match) return null;
  return match.slice(key.length + 1) || null;
};

export const hasFlag = (flags: string[] | null | undefined, key: string) => {
  const list = normalizeFlags(flags);
  return list.includes(key);
};

export const setFlagValue = (
  flags: string[] | null | undefined,
  key: string,
  value: string | boolean | null | undefined
) => {
  const list = normalizeFlags(flags).filter((flag) => {
    if (flag === key) return false;
    if (flag.startsWith(`${key}${FLAG_VALUE_SEPARATOR}`)) return false;
    return true;
  });

  if (value === null || typeof value === "undefined") {
    return list;
  }

  if (value === true) {
    if (!list.includes(key)) list.push(key);
    return list;
  }

  if (value === false) {
    return list;
  }

  list.push(`${key}${FLAG_VALUE_SEPARATOR}${value}`);
  return list;
};

export const getPriority = (flags: string[] | null | undefined) => {
  const value = getFlagValue(flags, "priority");
  if (value === "P1" || value === "P2" || value === "P3") {
    return value;
  }
  return null;
};
