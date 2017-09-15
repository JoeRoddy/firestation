import moment from "moment";

export function formatDate(dateString) {
  let date = new Date(dateString);

  var monthNames = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC"
  ];

  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();

  return day + "-" + monthNames[monthIndex] + "-" + year;
}

export function isValidDate(dateString) {
    return moment(dateString).isValid;
}

export function executeDateComparison(val1, val2, comparator) {
    let m1 = moment(val1);
    let m2 = moment(val2);
    let diff = m1.diff(m2);
debugger;
  switch (comparator) {
    case "<=":
      return diff <= 0;
    case ">=":
      return diff >= 0;
    case ">":
      return diff > 0;
    case "<":
      return diff < 0;
  }
}
