import React, { useState } from 'react';
import { LEARNING_TOPICS, Topic } from '../data/learningData';
import { BookOpen, Check, AlertCircle, ChevronRight } from 'lucide-react';

export const LearningMode: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<Topic>(LEARNING_TOPICS[0]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Sidebar Topics List -->
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col gap-3">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            OS Memory Textbook Theory ({LEARNING_TOPICS.length} Topics)
          </h3>
        </div>

        <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1">
          {LEARNING_TOPICS.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic)}
              className={`p-3 text-left rounded-xl border transition-all flex items-center justify-between gap-2 ${
                selectedTopic.id === topic.id
                  ? 'bg-amber-500/10 border-amber-500/50 text-white shadow-md'
                  : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-amber-400">{topic.title}</div>
                <div className="text-[11px] text-slate-500">{topic.category}</div>
              </div>
              <ChevronRight className={`w-4 h-4 shrink-0 ${selectedTopic.id === topic.id ? 'text-amber-400' : 'text-slate-600'}`} />
            </button>
          ))}
        </div>
      </div>

      <!-- Main Topic Content -->
      <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col gap-5 text-slate-200">
        <div className="border-b border-slate-800 pb-4">
          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/30 uppercase">
            {selectedTopic.category}
          </span>
          <h2 className="text-xl font-extrabold text-white mt-2">{selectedTopic.title}</h2>
        </div>

        <!-- Definition -->
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Definition & Core Principle</h4>
          <p className="text-sm text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800 font-sans">
            {selectedTopic.definition}
          </p>
        </div>

        <!-- Formula (If exists) -->
        {selectedTopic.formula && (
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mathematical / Logic Formula</h4>
            <div className="bg-slate-950 border border-cyan-500/30 rounded-xl p-3.5 font-mono text-cyan-400 text-xs font-bold">
              {selectedTopic.formula}
            </div>
          </div>
        )}

        <!-- Practical Example -->
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Practical Example</h4>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 font-mono">
            {selectedTopic.example}
          </div>
        </div>

        <!-- Advantages & Disadvantages -->
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 flex flex-col gap-2">
            <strong className="text-emerald-400 font-bold uppercase text-[11px] flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Advantages
            </strong>
            <ul className="list-disc list-inside flex flex-col gap-1 text-slate-300">
              {selectedTopic.advantages.map((adv, i) => (
                <li key={i}>{adv}</li>
              ))}
            </ul>
          </div>

          <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-4 flex flex-col gap-2">
            <strong className="text-rose-400 font-bold uppercase text-[11px] flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Disadvantages
            </strong>
            <ul className="list-disc list-inside flex flex-col gap-1 text-slate-300">
              {selectedTopic.disadvantages.map((dis, i) => (
                <li key={i}>{dis}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
