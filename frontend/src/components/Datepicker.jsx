import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Datepicker = () => {
  const [startDate, setStartDate] = useState(new Date());
  return (
    <DatePicker
      showIcon
      closeOnScroll={true}
      selected={startDate}
      dateFormat="dd/MM/yyyy"
      onChange={(date) => setStartDate(date)}
      showMonthDropdown
      showYearDropdown
    />
  );
};

export default Datepicker;
