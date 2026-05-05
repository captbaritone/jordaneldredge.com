import { basename } from "path";
import { Command } from "commander";
import { getBaseUrl } from "../config";
import { gql, EXIT_USAGE, EXIT_NOT_FOUND } from "../graphql";
import { readContent } from "../input";
import { info, outputData, formatBytes, isInteractive } from "../output";

export const pasteCommand = new Command("paste").description("Manage pastes");

pasteCommand
  .command("list")
  .description("List your pastes")
  .action(async () => {
    const base = getBaseUrl();
    const data = await gql<{
      myPastes: Array<{
        id: number;
        fileName: string;
        size: number;
        createdAt: string;
        url: string;
      }>;
    }>(`
      query {
        myPastes {
          id
          fileName
          size
          createdAt
          url
        }
      }
    `);

    const pastes = data.myPastes.map((p) => ({
      ...p,
      url: `${base}${p.url}`,
    }));

    outputData(pastes, () => {
      if (pastes.length === 0) {
        info("No pastes yet.");
        return;
      }

      console.log(
        "ID".padEnd(6) +
          "Filename".padEnd(30) +
          "Size".padEnd(10) +
          "Created",
      );
      console.log("-".repeat(70));

      for (const p of pastes) {
        console.log(
          String(p.id).padEnd(6) +
            (p.fileName || "<unnamed>").padEnd(30) +
            formatBytes(p.size).padEnd(10) +
            new Date(p.createdAt).toLocaleDateString(),
        );
      }
    });
  });

pasteCommand
  .command("create [filename]")
  .description("Create a new paste (reads content from stdin or --file)")
  .option("-f, --file <path>", "Read content from a file instead of stdin")
  .action(async (fileNameArg: string | undefined, options: { file?: string }) => {
    const content = await readContent(options);
    if (!content) {
      info(
        "Provide content via stdin or --file\n" +
          "  je paste create --file ./script.js\n" +
          "  echo 'hello' | je paste create note.txt",
      );
      process.exit(EXIT_USAGE);
    }

    const fileName = fileNameArg ?? (options.file ? basename(options.file) : null);
    if (!fileName) {
      info("Filename is required when reading from stdin.\n  echo 'hello' | je paste create note.txt");
      process.exit(EXIT_USAGE);
    }

    const base = getBaseUrl();
    const data = await gql<{
      createPaste: {
        id: number;
        fileName: string;
        url: string;
      };
    }>(
      `
      mutation($fileName: String!, $content: String!) {
        createPaste(fileName: $fileName, content: $content) {
          id
          fileName
          url
        }
      }
    `,
      { fileName, content },
    );

    const p = data.createPaste;
    const result = {
      action: "create",
      id: p.id,
      fileName: p.fileName,
      url: `${base}${p.url}`,
      status: "ok",
    };

    outputData(result, () => {
      info(`Created paste #${p.id}: ${result.url}`);
    });
  });

pasteCommand
  .command("get <id>")
  .description("Print paste content to stdout")
  .action(async (id: string) => {
    const data = await gql<{
      paste: {
        id: number;
        fileName: string;
        content: string;
        size: number;
        createdAt: string;
      } | null;
    }>(
      `
      query($id: Int!) {
        paste(id: $id) {
          id
          fileName
          content
          size
          createdAt
        }
      }
    `,
      { id: parseInt(id, 10) },
    );

    if (!data.paste) {
      info(`Paste #${id} not found.`);
      process.exit(EXIT_NOT_FOUND);
    }

    process.stdout.write(data.paste.content);
  });

pasteCommand
  .command("edit <id>")
  .description("Update an existing paste")
  .option("-f, --file <path>", "Read new content from a file instead of stdin")
  .option("-n, --filename <name>", "Set a new filename")
  .action(
    async (id: string, options: { file?: string; filename?: string }) => {
      const variables: Record<string, unknown> = { id: parseInt(id, 10) };

      if (options.filename) {
        variables.fileName = options.filename;
      }

      const content = await readContent(options);
      if (content) {
        variables.content = content;
      }

      if (!variables.fileName && !variables.content) {
        info(
          "Provide new content via stdin or --file, and/or --filename to rename.",
        );
        process.exit(EXIT_USAGE);
      }

      const data = await gql<{
        updatePaste: { id: number; fileName: string };
      }>(
        `
        mutation($id: Int!, $fileName: String, $content: String) {
          updatePaste(id: $id, fileName: $fileName, content: $content) {
            id
            fileName
          }
        }
      `,
        variables,
      );

      const result = {
        action: "update",
        id: data.updatePaste.id,
        fileName: data.updatePaste.fileName,
        status: "ok",
      };

      outputData(result, () => {
        info(`Updated paste #${result.id}`);
      });
    },
  );

pasteCommand
  .command("delete <id>")
  .description("Delete a paste (admin only)")
  .action(async (id: string) => {
    await gql(
      `
      mutation($id: Int!) {
        deletePaste(id: $id)
      }
    `,
      { id: parseInt(id, 10) },
    );

    const result = {
      action: "delete",
      id: parseInt(id, 10),
      status: "ok",
    };

    outputData(result, () => {
      info(`Deleted paste #${id}`);
    });
  });
