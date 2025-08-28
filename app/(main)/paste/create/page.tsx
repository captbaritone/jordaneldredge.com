import { notFound } from "next/navigation";
import { userCanCreatePaste } from "../../../../lib/session";
import { create } from "./create";

export default async function CreatePaste() {
  const canCreatePaste = await userCanCreatePaste();
  if (!canCreatePaste) {
    notFound();
  }
  return (
    <div className="markdown">
      <form className="flex flex-col py-4" action={create}>
        <h1>Create Paste</h1>
        <div className="flex flex-col bg-gray-100 rounded-lg border border-gray-400 pb-8">
          <input
            type="text"
            name="filename"
            required
            placeholder="Filename including extension..."
            className="py-1 px-4 m-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
          <textarea
            name="content"
            required
            className="h-64 p-4 border-t border-b border-gray-300 focus:outline-none"
          />
        </div>
        <input
          type="submit"
          value="Create Paste"
          className="self-end my-4 bg-green-700 active:bg-green-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        />
      </form>
    </div>
  );
}
