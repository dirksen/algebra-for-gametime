import React, { useState, useEffect } from "react";
import _ from "lodash";
import "./index.css";
import Picker from "react-scrollable-picker";
import genQuiz from "./Quiz";
import Confetti from "react-confetti";

const params = new URLSearchParams(window.location.search);
const leng = Number(params.get("leng") || 5);
const questions = _.range(leng).map(genQuiz);
const genOptions = (ops) => ops.map((x) => ({ value: x, label: x }));
const optionGroups = {
  comparator: ["≤", "<", "?", ">", "≥"].map((i) => ({
    value: i,
    label: `x ${i}`,
  })),
  sign: [
    { value: "", label: "+" },
    { value: "-", label: "-" },
  ],
  digits: genOptions(_.range(20)),
};
const initAnswer = {
  comparator: "?",
  sign: "",
  digits: 0,
};
const records = [];

export default function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [correct, setCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState(initAnswer);
  const [showerConfetti, setShowerConfetti] = useState(true);
  const assembeldAnswer = `${answer.comparator}${answer.sign}${answer.digits}`;

  const checkAnswer = (e) => {
    e.preventDefault();
    setCorrect(assembeldAnswer === questions[currentQuestion].solution);
  };

  useEffect(() => {
    if (correct) {
      document.getElementById("quiz").reset();
      const nextQuestion = currentQuestion + 1;
      records.push(
        questions[currentQuestion].toString(),
      );
      setAnswer(initAnswer);
      setCorrect(null);
      setScore(score + 1);
      setCurrentQuestion(nextQuestion);
      if (nextQuestion >= questions.length)
        setTimeout(() => {
          setShowerConfetti(false);
        }, 30000);
    }
  }, [assembeldAnswer, correct, currentQuestion, score]);

  return (
    <form id="quiz" onSubmit={checkAnswer}>
      <div>
        {(currentQuestion >= questions.length && (
            <div>
              <Confetti recycle={showerConfetti} />
              <h1 className="notice">
                You scored {score} out of {questions.length}
              </h1>
              <article>
              <b>Here are the questions you have done:</b>
              {
                records.map((entry, idx) => (
                  <p key={idx}>{entry}</p>
                ))
              }
              <hr/>
              <p>{(new Date()).toLocaleTimeString()}</p>
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
                <h1>{questions[currentQuestion].toString()}</h1>
                <div>
                  <Picker
                    optionGroups={optionGroups}
                    valueGroups={answer}
                    onChange={(n, v) => setAnswer({ ...answer, [n]: v })}
                  />
                  <button type="submit">Check</button>
                </div>
              </article>
            </>
          )}
      </div>
    </form>
  );
}
