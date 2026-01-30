declare module "papaparse" {
  export type ParseResult<T> = {
    data: T[];
    errors: Array<{ message: string }>;
    meta: Record<string, unknown>;
  };

  export type ParseConfig<T> = {
    header?: boolean;
    skipEmptyLines?: boolean;
    complete?: (results: ParseResult<T>) => void | Promise<void>;
    error?: (error: Error) => void;
  };

  export type UnparseConfig = {
    delimiter?: string;
    quotes?: boolean;
  };

  export const parse: <T>(
    input: File | string,
    config: ParseConfig<T>
  ) => void;

  export const unparse: (
    data: Array<Record<string, string>>,
    config?: UnparseConfig
  ) => string;

  const Papa: {
    parse: typeof parse;
    unparse: typeof unparse;
  };

  export default Papa;
}
