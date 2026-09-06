import React, { useState } from 'react';
import { QUIZ_QUESTIONS } from '../data/quizData';
import { Award, CheckCircle, XCircle, RotateCcw, ArrowRight } from 'lucide-react';

export const QuizMode: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>(new Array(QUIZ_QUESTIONS.length).fill(null));

  const q = QUIZ_QUESTIONS[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (isSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;

    const correct = selectedOption === q.answer;
    if (correct) setScore(score + 1);

    const updated = [...userAnswers];
    updated[currentIdx] = selectedOption;
    setUserAnswers(updated);

    setIsSubmitted(true);
  };

  const handleNext = () => {
    if (currentIdx + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setScore(0);
    setIsSubmitted(false);
    setIsFinished(false);
    setUserAnswers(new Array(QUIZ_QUESTIONS.length).fill(null));
  };

  const pctScore = Math.round((score / QUIZ_QUESTIONS.length) * 100);

  return (
    <div className="max-w-3xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col gap-6 text-white">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-extrabold">Operating Systems Memory Management Quiz</h3>
        </div>
        <span className="text-xs font-mono font-bold text-slate-400">
          Question {currentIdx + 1} of {QUIZ_QUESTIONS.length}
        </span>
      </div>

      {!isFinished ? (
        <div className="flex flex-col gap-5">
          <!-- Question Title -->
          <div className="text-base font-bold leading-snug font-sans">
            {q.question}
          </div>

          <!-- Options List -->
          <div className="flex flex-col gap-2.5">
            {q.options.map((opt, idx) => {
              let optStyle = 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-600';

              if (selectedOption === idx) {
                optStyle = 'bg-purple-500/10 border-purple-500 text-purple-300 font-bold';
              }

              if (isSubmitted) {
                if (idx === q.answer) {
                  optStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                } else if (selectedOption === idx && idx !== q.answer) {
                  optStyle = 'bg-rose-500/20 border-rose-500 text-rose-300';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-3.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-3 ${optStyle}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {isSubmitted && idx === q.answer && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
                  {isSubmitted && selectedOption === idx && idx !== q.answer && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          <!-- Explanation after submit -->
          {isSubmitted && (
            <div className="bg-slate-950 border border-purple-500/30 rounded-xl p-4 text-xs flex flex-col gap-1 text-slate-300">
              <span className="font-extrabold text-purple-400 uppercase text-[10px]">Academic Explanation</span>
              <p className="leading-relaxed font-sans">{q.explanation}</p>
            </div>
          )}

          <!-- Action Button -->
          <div className="flex justify-end pt-2 border-t border-slate-800">
            {!isSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all"
              >
                Next Question <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <!-- Quiz Completed Score Card -->
        <div className="flex flex-col items-center text-center py-8 gap-4">
          <div className="w-20 h-20 rounded-full bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center text-purple-400 text-3xl font-extrabold font-mono shadow-xl">
            {pctScore}%
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">Quiz Completed!</h3>
            <p className="text-sm text-slate-400 mt-1">
              You scored <strong className="text-cyan-400">{score}</strong> out of <strong className="text-white">{QUIZ_QUESTIONS.length}</strong> correct.
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl max-w-md text-xs text-slate-300 font-sans leading-relaxed">
            {pctScore >= 80
              ? '🌟 Excellent performance! You have a strong grasp of contiguous memory allocation, fragmentation, and placement algorithms.'
              : '👍 Good effort! Review Learning Mode and try again to improve your score for your OS lab exam.'}
          </div>

          <button
            onClick={handleRestart}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-2 transition-all mt-2"
          >
            <RotateCcw className="w-4 h-4" /> Retake Quiz
          </button>
        </div>
      )}
    </div>
  );
};
