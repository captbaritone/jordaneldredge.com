import "dotenv/config";
import fs from "node:fs";
import path from "path";
import OpenAI from "openai";
import { ContentConnection } from "../lib/data";

const openai = new OpenAI();
const tempDir = path.resolve("./temp");

main();

async function main() {
  const allContent = ContentConnection.all({ sort: "latest", filters: [] });

  let i = 5;

  for (const content of allContent) {
    if (i <= 0) {
      break;
    }
    const summaryImage = content.summaryImage();
    if (summaryImage != null) {
      console.log(
        `Skipping ${content.title()} because it already has an image.`,
      );
      continue;
    }
    console.log(`Generating image for ${content.title()}`);

    const prompt = `An image for a blog post titled "${content.title()}" with the following summary: "${content.summary()}"`;

    // Use OpenAI to generate an image
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      // TODO: 16 / 9
      size: "1792x1024",
    });

    const data = await fetch(response.data[0].url);
    if (!data.ok) {
      throw new Error(`Failed to fetch image: ${response.data[0].url}`);
    }
    const buffer = await data.arrayBuffer();
    const imagePath = path.join(tempDir, `${content.id()}.png`);

    fs.writeFileSync(imagePath, Buffer.from(buffer));
    i--;
  }
}
