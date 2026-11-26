
export function columnNumberToLetter(columnNumber: number): string {
  let result = "";
  let number = columnNumber;

  while (number > 0) {
    number--;

    result =
      String.fromCharCode(65 + (number % 26)) + result;

    number = Math.floor(number / 26);
  }

  return result;
}