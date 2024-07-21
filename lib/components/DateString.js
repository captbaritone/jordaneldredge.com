const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

export default function DateString({ date }) {
  return (
    <time dateTime={date.toISOString()}>{dateFormatter.format(date)}</time>
  );
}
