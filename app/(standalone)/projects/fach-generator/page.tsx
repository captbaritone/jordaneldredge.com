import FachPage from "./fach";

export const metadata = {
  title: "Funny Fach Generator",
  description: "Generate a funny random Fach name with a click",
  twitter: {
    title: "Funny Fach Generator",
    description: "Generate a funny random Fach name with a click",
  },
};

export const dynamic = "force-dynamic";

export default function Page() {
  const baseSeed = Math.random() * 1000000; // Generate a random seed for the Fach page
  return <FachPage baseSeed={baseSeed} />;
}
