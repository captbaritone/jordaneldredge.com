import { Command } from "commander";

export const schemaCommand = new Command("schema")
  .description("Dump command structure as JSON (for agent introspection)")
  .action(() => {
    // Walk up to the root program
    let root: Command = schemaCommand;
    while (root.parent) {
      root = root.parent;
    }

    function extractCommands(cmd: Command): object[] {
      return cmd.commands.map((sub) => {
        const args =
          (sub as any)._args?.map((a: any) => ({
            name: a.name(),
            required: a.required,
            description: a.description,
          })) ?? [];

        const options = sub.options
          .filter((o) => !o.hidden)
          .map((o) => ({
            flags: o.flags,
            description: o.description,
          }));

        const result: Record<string, unknown> = {
          name: sub.name(),
          description: sub.description(),
        };

        if (sub.aliases().length > 0) result.aliases = sub.aliases();
        if (args.length > 0) result.args = args;
        if (options.length > 0) result.options = options;
        if (sub.commands.length > 0) {
          result.subcommands = extractCommands(sub);
        }

        return result;
      });
    }

    const schema = {
      name: root.name(),
      version: root.version(),
      description: root.description(),
      commands: extractCommands(root),
    };

    process.stdout.write(JSON.stringify(schema, null, 2) + "\n");
  });
