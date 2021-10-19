import Image from "next/image";
import { useState, useEffect } from "react";

function useComments(issue) {
  const [response, setResponse] = useState(null);
  useEffect(() => {
    const apiUrl = `https://api.github.com/repos/captbaritone/jordaneldredge.com/issues/${issue}/comments`;
    fetch(apiUrl, {
      headers: { Accept: "application/vnd.github.v3.html+json" },
    })
      .then((response) => {
        return response.json();
      })
      .then((body) => {
        setResponse(body);
      })
      .catch((e) => {
        setResponse(null);
      });
  }, [issue]);

  return response;
}

export default function GitHubComments({ issue }) {
  const url = `https://github.com/captbaritone/jordaneldredge.com/issues/${issue}`;
  const comments = useComments(issue);
  if (comments == null) {
    return null;
  }

  return (
    <div className="py-6">
      <h2 className="text-center text-2xl font-semibold pt-5 border-t-2 border-gray-200 border-solid">
        Comments
      </h2>
      {comments.map((comment) => {
        var date = new Date(comment.created_at);
        return (
          <div
            key={comment.id}
            className="flex flex-col mx-auto container shadow mt-5 rounded-b-md"
          >
            <div
              className="flex bg-gray-600 bg-opacity-10 rounded-t-md p-3"
              style={{ position: "relative" }}
            >
              <Image
                width={48}
                height={48}
                src={comment.user.avatar_url}
                className="w-12 h-12 rounded-full object-cover bg-gray-100"
                alt=""
              />
              <div className="flex flex-row justify-between w-full px-3 items-center">
                <div className="font-semibold hover:underline">
                  <a href={comment.user.html_url}>{comment.user.login}</a>
                </div>
                <a
                  href={comment.html_url}
                  className="text-gray-500 italic text-sm  hover:underline"
                >
                  {date.toDateString()}
                </a>
              </div>
            </div>
            <div className="px-5 pt-4 ">
              <div
                className="markdown break-words"
                dangerouslySetInnerHTML={{ __html: comment.body_html }}
              />
            </div>
          </div>
        );
      })}
      <div className="text-lg text-center pt-4 underline">
        <a href={url} target="_blank" rel="noreferrer">
          Add a comment on GitHub
        </a>
      </div>
    </div>
  );
}
