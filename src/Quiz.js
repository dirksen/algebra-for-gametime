import _ from "lodash";
import algebra from "algebra.js";

export default function genQuiz() {
  const plusMinus = _.random(1) ? '':'-';
  const nums = '1/2 1/3 2/3 1/4 3/4 1/5 3/5 4/5 1/6 5/6 1/8 3/8'.split(' ')
  const randomlyFlipToNegative = nums.map((n) =>
    _.random(1) > 0 ? `-${n}` : n,
  );
  const shuffled = _.shuffle(randomlyFlipToNegative);
  const [n1, n2] = shuffled.splice(0, 2);
  const templates = _.shuffle([
    `${plusMinus}x+${n1}=${n2}`,
    `${n1}+${plusMinus}x=${n2}`,
    `${n1}=${plusMinus}x+${n2}`,
    `${n1}=${n2}+${plusMinus}x`,
  ]);
  const formula = templates[0].replace(/\+-/g, '-');
  const question = {
    formula,
    comparator: _.sample(["<", ">", "≤", "≥"]),
  };
  const htmlizedComparator = question.comparator.replace('<', '&lt;').replace('>', '&gt;')
  question.toString = () => question.formula.replace(/=/g, htmlizedComparator).replace(/(\d)\/(\d)/g, '&frac$1$2;');
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
