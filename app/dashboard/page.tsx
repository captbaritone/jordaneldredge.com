import { db } from "../../lib/db";
import { getSession } from "../../lib/session";

export default async function Dashboard() {
  const session = await getSession();
  if (!session.userId) {
    return <p>Not logged in</p>;
  }
  const content = db
    .prepare<[], { id: number; title: string }>("SELECT * FROM content")
    .all();
  return (
    <div className="markdown">
      <h1>Dashboard</h1>
      <h2>Content</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
          </tr>
        </thead>
        <tbody>
          {content.map((item) => {
            return (
              <tr key={item.id}>
                <td>{item.title}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
