import { getSingerResume } from "../../../lib/data";

export const metadata = {
  title: "Singer Resume",
};

export const dynamic = "force-static";

export default function Page() {
  const resume = getSingerResume().sort((a, b) =>
    a.start_date > b.start_date ? -1 : 1,
  );

  return (
    <div className="markdown">
      <h1>Singer Resume</h1>
      <table className="resume">
        <thead>
          <tr>
            <th className="role">Role</th>
            <th className="title">Title</th>
            <th className="company">Company</th>
            <th className="year">Year</th>
          </tr>
        </thead>
        <tbody>
          {resume.map((show) => {
            return (
              <tr key={show.id}>
                <td className="role">{show.character}</td>
                <td className="title">
                  <i>{show.title}</i>
                  {show.sung_in_translation ? "*" : ""}
                </td>
                <td className="company">{show.company}</td>
                <td className="year">
                  {new Date(show.start_date).getFullYear()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="resume-note">* Sung in translation</p>
    </div>
  );
}
