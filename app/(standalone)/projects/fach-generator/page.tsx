import FachPage from "./fach";

export default function Page() {
  const baseSeed = Math.random() * 1000000; // Generate a random seed for the Fach page
  return <FachPage baseSeed={baseSeed} />;
}
