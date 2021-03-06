import { useRouter } from "next/router";
import ErrorPage from "next/error";
import { getSingerResume } from "../lib/api";
import Layout from "../lib/components/Layout";

export default function Page({ page }) {
  const router = useRouter();
  if (!router.isFallback && !page) {
    return <ErrorPage statusCode={404} />;
  }
  return (
    <Layout title="Singer">
      <h1>Resume</h1>
      <table className="table-auto text-sm">
        <thead>
          <tr className="border-b-2 border-grey-darkest border-solid">
            <th className="text-left">Character</th>
            <th className="text-left">Title</th>
            <th className="text-left">Company</th>
            <th className="text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {page.resume.map((show) => {
            return (
              <tr key={show.id} className="border-b border-grey border-solid">
                <td>{show.character}</td>
                <td className="italic">
                  {show.title}
                  {show.sung_in_translation ? "*" : ""}
                </td>
                <td>{show.company}</td>
                <td>{new Date(show.start_date).getFullYear()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="text-sm italic text-right">*Sung in transation</div>
    </Layout>
  );
}

export async function getStaticProps() {
  const resume = getSingerResume().sort((a, b) =>
    a.start_date > b.start_date ? -1 : 1
  );

  return {
    props: {
      page: {
        resume,
      },
    },
  };
}
