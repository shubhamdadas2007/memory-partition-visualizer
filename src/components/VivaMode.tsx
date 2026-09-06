import React, { useState } from 'react';
import { VIVA_QUESTIONS } from '../data/vivaData';
import { VivaQuestion } from '../types';
import { HelpCircle, Eye, EyeOff, Shuffle, ArrowRight } from 'lucide-react';

export const VivaMode: React.FC = () => {
  const [filterDifficulty, setFilterDifficulty] = useState<string>('All');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const filteredQuestions = VIVA_QUESTIONS.filter(q =>
    filterDifficulty === 'All' ? true : q.category === filterDifficulty
  );

  const currentQ = filteredQuestions[currentIdx] || filteredQuestions[0];

  const handleNext = () => {
    setShowAnswer(false);
    setCurrentIdx((prev) => (prev + 1) % filteredQuestions.length);
  };

  const handleRandom = () => {
    setShowAnswer(false);
    const rand = Math.floor(Math.random() * filteredQuestions.length);
    setCurrentIdx(rand);
  };

  return (
    <div className="max-w-3xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col gap-6 text-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-rose-400" />
          <div>
            <h3 className="text-lg font-extrabold">OS Oral Exam / Viva Trainer</h3>
            <p className="text-xs text-slate-400">Practice typical oral examination questions asked by OS professors and lab external examiners.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => {
                setFilterDifficulty(diff);
                setCurrentIdx(0);
                setShowAnswer(false);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                filterDifficulty === diff
                  ? 'bg-rose-500 text-white border-rose-400 shadow-md'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {currentQ ? (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="bg-rose-500/10 text-rose-400 px-2.5 py-1 rounded-md border border-rose-500/30 font-bold">
              {currentQ.category.toUpperCase()} DIFFICULTY | {currentQ.topic}
            </span>
            <span>Question {currentIdx + 1} of {filteredQuestions.length}</span>
          </div>

          <!-- Question Prompt Card -->
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-base font-extrabold font-sans leading-relaxed text-slate-100 shadow-inner">
            "{currentQ.question}"
          </div>

          <!-- Answer Toggle Card -->
          {showAnswer ? (
            <div className="bg-slate-955 border border-emerald-500/30 rounded-2xl p-5 flex flex-col gap-2 font-sans text-xs text-slate-200 shadow-lg">
              <span className="font-extrabold text-emerald-400 uppercase text-[10px] flex items-center gap-1">
                ✓ Model Examiner Answer
              </span>
              <p className="leading-relaxed text-sm text-slate-200">{currentQ.answer}</p>
            </div>
          ) : (
            <div className="bg-slate-950/60 border border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-xs italic flex flex-col items-center gap-2">
              <span>Formulate your response out loud before revealing the answer.</span>
              <button
                onClick={() => setShowAnswer(true)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all mt-1"
              >
                <Eye className="w-4 h-4 text-cyan-400" /> Reveal Model Answer
              </button>
            </div>
          )}

          <!-- Action Buttons -->
          <div className="flex justify-between items-center pt-2 border-t border-slate-800">
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              {showAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showAnswer ? 'Hide Answer' : 'Show Answer'}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRandom}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
              >
                <Shuffle className="w-4 h-4" /> Random
              </button>

              <button
                onClick={handleNext}
                className="px-5 py-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all"
              >
                Next Question <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-slate-500 py-8">No viva questions match this difficulty filter.</div>
      )}
    </div>
  );
};
