export function sql(strings: TemplateStringsArray, ...values: any[]): string {
  return strings.reduce((result, str, i) => {
    const value = i < values.length ? values[i] : "";
    return result + str + value;
  }, "");
}
