import FachPage from "./fach";
import { connection } from "next/server";

export const metadata = {
  title: "Funny Fach Generator",
  description: "Generate a funny random Fach name with a click",
  twitter: {
    title: "Funny Fach Generator",
    description: "Generate a funny random Fach name with a click",
  },
};

export const dynamic = "force-dynamic";

export default async function Page() {
  await connection();
  // https://nextjs.org/docs/messages/next-prerender-current-time#guarding-the-time-with-await-connection
  // eslint-disable-next-line react-hooks/purity
  const baseSeed = Math.random() * 1000000; // Generate a random seed for the Fach page
  return <FachPage baseSeed={baseSeed} />;
}
