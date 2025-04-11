const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

export default function DateString({ date }: { date: Date }) {
  return (
    <time dateTime={date.toISOString()}>{dateFormatter.format(date)}</time>
  );
}

export function TimeString({ date }) {
  return <time dateTime={date.toISOString()}>{date.toLocaleTimeString()}</time>;
}
