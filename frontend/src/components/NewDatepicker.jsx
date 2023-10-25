import { DatePicker } from "antd";
const onChange = (date, dateString) => {
  console.log(date, dateString);
};

export default function NewDatePicker() {
  return (
    <>
      <DatePicker onChange={onChange} />
    </>
  );
}
