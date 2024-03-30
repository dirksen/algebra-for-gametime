import _ from "lodash";
import algebra from "algebra.js";

export default function genQuiz() {
  const one2nine = _.range(1, 10);
  const randomlyFlipToNegative = one2nine.map((n) =>
    Math.random() > 0.5 ? n * -1 : n,
  );
  const shuffled = _.shuffle(randomlyFlipToNegative);
  const [n1, n2, n3] = shuffled.splice(0, 3);
  const candidates = _.shuffle([
    `${n1}+${n2}x=${n3}`,
    `${n1}x+${n2}=${n3}`,
    `${n1}=${n2}x+${n3}`,
    `${n1}=${n2}+${n3}x`,
  ]);
  const firstOne = candidates[0];
  const formula = firstOne.replace(/\+-/, "-").replace(/1x/, "x");
  const question = {
    formula,
    comparator: _.sample(["<", ">", "≤", "≥"]),
  };
  question.toString = () => question.formula.replace(/=/, question.comparator);
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
