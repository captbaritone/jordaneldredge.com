export type Sql = string & { __sqlBrand: any };
export function sql(strings: TemplateStringsArray, ...values: any[]): Sql {
  // @ts-ignore
  return strings.reduce((result, str, i) => {
    const value = i < values.length ? values[i] : "";
    return result + str + value;
  }, "");
}
