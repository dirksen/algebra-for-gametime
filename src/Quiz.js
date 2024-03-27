import _ from "lodash";
import algebra from "algebra.js";

export default function genQuiz() {
  const n1 = _.random(1, 9);
  const n2 = _.random(1, 9);
  const members = _.shuffle(["x", n1, n2]);
  const ops = _.map(_.range(3), (x) => (_.random(1) ? "+" : "-"));
  let equation = _.zip(ops, members);
  equation.splice(_.random(1, 2), 0, "=");
  equation = _.flattenDeep(equation).join("").trim();
  equation = dropLeadingPlus(equation);
  const question = {
    equation,
    comparator: _.sample(["<", ">", "≤", "≥"]),
  };
  question.toString = () => question.equation.replace(/=/, question.comparator)
  question.solution = solve(question)
  return question;
}

function dropLeadingPlus(equation) {
  equation = equation.replace(/^\+/, "");
  equation = equation.replace(/([<>=≤≥])\+/, "$1");
  return equation;
}

function flip(comparator) {
  switch (true) {
    case comparator === '<':
      return '>';
    case comparator === '>':
      return '<';
    case comparator === '≤':
      return '≥';
    case comparator === '≥':
      return '≤';
    default:
      return
  }
}

function solve(question) {
  const xVal = algebra.parse(question.equation).solveFor('x').toString()
  const positiveXonRight = /=x|=.\+x/.test(question.equation)
  const negativeXonLeft = /-x.*=/.test(question.equation)
  const comparator = (positiveXonRight || negativeXonLeft) ? flip(question.comparator) : question.comparator;
  return `x${comparator}${xVal}`
}

