import _ from "lodash";
import algebra from "algebra.js";

export default function genQuiz() {
  const plusMinus = _.random(1) ? '':'-';
  const nums = _.range(1, 6);
  const randomlyFlipToNegative = nums.map((n) =>
    Math.random() > 0.5 ? n * -1 : n,
  );
  const shuffled = _.shuffle(randomlyFlipToNegative);
  const [n1, n2, n3, n4] = shuffled.splice(0, 4);
  const templates = _.shuffle([
    `${plusMinus}x+${n1}/${n2}=${n3}/${n4}`,
    `${plusMinus}x+${n1}/${n2}=${n3}/${n4}`,
    `${n1}/${n2}+${plusMinus}x=${n3}/${n4}`,
    `${n1}/${n2}=${plusMinus}x+${n3}/${n4}`,
    `${n1}/${n2}=${n3}/${n4}+${plusMinus}x`,
  ]);
  const firstOne = templates[0];
  const formula = firstOne.replace(/\+-/g, "-")
    .replace(/\/-/g, "/")
    .replace(/\/1/g, "")
    .replace(/1x/g, "x");
  const question = {
    formula,
    comparator: _.sample(["<", ">", "≤", "≥"]),
  };
  question.toString = () => question.formula.replace(/=/g, question.comparator);
  question.solution = solve(question);
  return question;
}

function divide(numerator, denominator) {
  const rslt = numerator / denominator
  return isNaN(rslt) ? 0 : rslt
}

function flip(comparator) {
  switch (comparator) {
    case "<":
      return ">";
    case ">":
      return "<";
    case "≤":
      return "≥";
    case "≥":
      return "≤";
    default:
      return comparator;
  }
}

function solve(question) {
  const formula = algebra.parse(question.formula);
  let lhsCoeff = formula.lhs.terms[0]?.coefficients[0];
  lhsCoeff = divide(lhsCoeff?.numer, lhsCoeff?.denom);
  let rhsCoeff = formula.rhs.terms[0]?.coefficients[0];
  rhsCoeff = divide(rhsCoeff?.numer, rhsCoeff?.denom);
  const comparator =
    lhsCoeff < rhsCoeff ? flip(question.comparator) : question.comparator;
  const solution = formula.solveFor("x").toString();
  return `x${comparator}${solution}`;
}

// const test = {
//   formula: "5=2x-4",
//   comparator: "<",
// };
// console.assert(solve(test) == "x>9/2");
