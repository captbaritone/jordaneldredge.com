import { createYoga } from "graphql-yoga";
import { getSchema } from "./schema";
import { VC } from "../../../lib/VC";

interface NextContext {
  params: Promise<Record<string, string>>;
}

/** @gqlContext */
export type GQLContext = {
  vc: VC;
};

/** @gqlContext */
export function getVc(ctx: GQLContext): VC {
  return ctx.vc;
}

const { handleRequest } = createYoga<NextContext>({
  schema: getSchema(),
  context: async (ctx) => {
    return {
      // Pass through any params from the Next.js route
      params: ctx.params,
      // Create viewer context
      vc: await VC.create(),
    };
  },

  // While using Next.js file convention for routing, we need to configure Yoga to use the correct endpoint
  graphqlEndpoint: "/api/graphql",

  // Yoga needs to know how to create a valid Next response
  fetchAPI: { Response },

  graphiql: true,
});

export {
  handleRequest as GET,
  handleRequest as POST,
  handleRequest as OPTIONS,
};
