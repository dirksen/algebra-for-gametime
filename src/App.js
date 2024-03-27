import React, { useState, useEffect } from "react";
import _ from "lodash";
import "./index.css";
import genQuiz from "./Quiz";
import Confetti from "react-confetti";

const params = new URLSearchParams(window.location.search);
const leng = Number(params.get("leng") || 5);
const questions = _.range(leng).map(genQuiz);
const records = [];
const numpad = `
C ⌫ +/- =
7 8 9 <
4 5 6 >
1 2 3 ≤
Check _ 0 ≥
`
  .trim()
  .split("\n")
  .map((x) => x.split(" "));

export default function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [correct, setCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState("x");
  const [showerConfetti, setShowerConfetti] = useState(true);

  const handleNumBtn = (e) => {
    e.preventDefault();
    const val = e.target.innerText;
    const comparatorRegex = new RegExp("[=<>≤≥]");
    switch (true) {
      case val === 'Check':
        setCorrect(answer === questions[currentQuestion].solution);
        break;
      case val === "+/-":
        const addNegativeSign = (x) => x.replace(comparatorRegex, "$&-");
        const flipDoubleNegative = (x) => x.replace("--", "");
        setAnswer(flipDoubleNegative(addNegativeSign(answer)));
        break;
      case val === "⌫":
        setAnswer(answer.replace(/.$/, "") || "x");
        break;
      case val === "C":
        setAnswer("x");
        break;
      case /[0-9]/.test(val) && !comparatorRegex.test(answer):
        // No comparator yet, prevent number input
        break;
      case comparatorRegex.test(val) && comparatorRegex.test(answer):
        // replace existing comparator with new one
        setAnswer(answer.replace(comparatorRegex, val));
        break;
      case comparatorRegex.test(val):
        // append comparator
        setAnswer(answer + val);
        break;
      default:
        setAnswer(`${answer}${val}`);
    }
  };

  useEffect(() => {
    if (correct) {
      document.getElementById("quiz").reset();
      const nextQuestion = currentQuestion + 1;
      records.push(`${questions[currentQuestion].toString()} (${answer})`);
      setAnswer("x");
      setCorrect(null);
      setScore(score + 1);
      setCurrentQuestion(nextQuestion);
      if (nextQuestion >= questions.length)
        setTimeout(() => {
          setShowerConfetti(false);
        }, 30000);
    }
  }, [correct, currentQuestion, score]);

  return (
    <form id="quiz">
      <div>
        {(currentQuestion >= questions.length && (
          <div>
            <Confetti recycle={showerConfetti} />
            <h1 className="notice">
              You scored {score} out of {questions.length}
            </h1>
            <article>
              <b>Here are the questions you have done:</b>
              {records.map((entry, idx) => (
                <p key={idx}>{entry}</p>
              ))}
              <hr />
              <p>{new Date().toLocaleTimeString()}</p>
            </article>
          </div>
        )) || (
          <>
            <Confetti recycle={correct} />
            <article
              className={`notice ${correct === null || correct ? "" : "incorrect"}`}
            >
              <div>
                <span>Question {currentQuestion + 1}</span>/{questions.length}
              </div>
              <h2 className="question">
                {questions[currentQuestion].toString()}
              </h2>
              <div className={"numpad-body"}>
                <div id="answer-input" className={"answer-input"}>
                  {answer}
                </div>
                {numpad.map((row, rowIdx) =>
                  row.map((key, colIdx) => {
                    if (key !== "_") {
                      let className = ''
                      let inputType = ''
                      switch (key) {
                        case 'Check':
                          colIdx = `${colIdx + 1}/${colIdx + 3}`
                          className = "btn-check"
                          inputType = 'submit'
                          break
                        case 'C':
                          className = 'btn-clear'
                          colIdx += 1
                          break
                        default:
                          colIdx += 1
                          break
                      }
                      return (
                        <button
                          key={`${rowIdx}-${colIdx}`}
                          onClick={handleNumBtn}
                          className={className}
                          type={inputType}
                          style={{ gridRow: rowIdx + 2, gridColumn: colIdx }}
                        >
                          {key}
                        </button>
                      );
                    }
                  }),
                )}
              </div>
            </article>
          </>
        )}
      </div>
    </form>
  );
}
