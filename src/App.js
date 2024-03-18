import React, { useState, useEffect } from "react";
import _ from "lodash";
import "./index.css";
import Picker from "react-scrollable-picker";
import genQuiz from "./Quiz";
import Confetti from 'react-confetti';

const params = new URLSearchParams(window.location.search);
const leng = Number(params.get('leng') || 5);
const lastQuizTimeStamp = Number(params.get('ts'))
const questions = _.range(leng).map(genQuiz);
const genOptions = (ops) =>
  ops.map((x) => ({ value: x, label: x }));
const optionGroups = {
  comparator: [ '≤', '<', '?', '>', '≥' ].map((i) => ({
    value: i,
    label: `x ${i}`,
  })),
  sign: [{value: '', label: "+"}, {value: '-', label: "-" }],
  digits: genOptions(_.range(20)),
};
const initAnswer = {
  comparator: "?",
  sign: "",
  digits: "0"
};
const records = [];

function reportHref(records, phone) {
  const now = (new Date()).getTime()
  const verificationURL = '${location}?ts=${now}'
  return `sms://${phone}?body=${encodeURIComponent(verificationURL)}`
}

export default function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [correct, setCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [phone, setPhone] = useState('');
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
      records.push([questions[currentQuestion].toString(), assembeldAnswer].join('\t'))
      setAnswer(initAnswer);
      setCorrect(null);
      setScore(score + 1);
      setCurrentQuestion(nextQuestion);
      if (nextQuestion >= questions.length)
        setTimeout(() => {setShowerConfetti(false)}, 30000)
    }
  }, [assembeldAnswer, correct, currentQuestion, score]);

  return (
    <form id="quiz" onSubmit={checkAnswer}>
      <div>
        {(lastQuizTimeStamp &&
          <h1>Last finished time: {(new Date(Number(lastQuizTimeStamp))).toLocaleString()}</h1>)
        || (currentQuestion >= questions.length &&
          <div>
            <Confetti recycle={showerConfetti}/>
            <h1 className='notice'>You scored {score} out of {questions.length}</h1>
            <label>Phone:
              <input value={phone} onChange={e=>setPhone(e.target.value)} type='text' placeholder='000-000-0000'/>
            </label>
            <a href={reportHref(records, phone)} className="button">Report</a>
          </div>)
        || (
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
