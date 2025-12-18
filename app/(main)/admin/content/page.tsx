import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContentConnection from "../../../../lib/data/ContentConnection";
import DateString from "../../../../lib/components/DateString";
import { VC } from "../../../../lib/VC";
import ReindexButton from "./ReindexButton";

export const metadata: Metadata = {
  title: "Content Management",
};

export default async function AdminContent() {
  // Create a VC instance and check permissions
  const vc = await VC.create();
  if (!vc.canViewAdminUI()) {
    notFound();
  }

  // Get all content using ContentConnection with an empty query
  const content = ContentConnection.search(vc, "", "latest", null);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Content Management</h2>
        <ReindexButton />
      </div>

      {/* Content table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">ID</th>
              <th className="p-2">Title</th>
              <th className="p-2">Type</th>
              <th className="p-2">Slug</th>
              <th className="p-2">Date</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {content.map((item) => {
              const isDraft = !!item.metadata().draft;
              const isArchived = !!item.metadata().archive;

              return (
                <tr key={item.id()} className="hover:bg-gray-50">
                  <td className="p-2">{item.id()}</td>
                  <td className="p-2 font-medium max-w-xs truncate">
                    <Link
                      href={item.url().path()}
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      title={item.title()}
                    >
                      {item.title()}
                    </Link>
                  </td>
                  <td className="p-2">
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-xs ${
                        item.pageType() === "post"
                          ? "bg-blue-100 text-blue-800"
                          : item.pageType() === "note"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {item.pageType()}
                    </span>
                  </td>
                  <td
                    className="p-2 max-w-[120px] truncate"
                    title={item.slug()}
                  >
                    {item.slug()}
                  </td>
                  <td className="p-2 whitespace-nowrap">
                    <DateString date={item.dateObj()} />
                  </td>
                  <td className="p-2">
                    {isDraft && (
                      <span className="px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs mr-1">
                        Draft
                      </span>
                    )}
                    {isArchived && (
                      <span className="px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-800 text-xs">
                        Archived
                      </span>
                    )}
                    {!isDraft && !isArchived && (
                      <span className="px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 text-xs">
                        Published
                      </span>
                    )}
                  </td>
                  <td className="p-2 whitespace-nowrap">
                    <Link
                      href={`/debug/content/${item.slug()}`}
                      className="text-blue-600 hover:underline mr-2 text-xs"
                    >
                      Debug
                    </Link>
                    <Link
                      href={item.markdownUrl().path()}
                      className="text-blue-600 hover:underline text-xs"
                      target="_blank"
                    >
                      MD
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
