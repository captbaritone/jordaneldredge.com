import eslintShiki from "./eslintShiki";

test("eslintShiki", async () => {
  const ast = await eslintShiki(`
\`\`\`js
const foo = bar
\`\`\`
`);

  expect(ast).toEqual({});
});
