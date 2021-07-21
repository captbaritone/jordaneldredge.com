const dateFormater = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

export default function DateString({ date }) {
  return dateFormater.format(date);
}
