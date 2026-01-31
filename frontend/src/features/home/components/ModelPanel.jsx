import { useState } from 'react';
import MetricRow from './MetricRow';

const GO_EMOTIONS = [
  'admiration', 'amusement', 'anger', 'annoyance', 'approval', 'caring',
  'confusion', 'curiosity', 'desire', 'disappointment', 'disapproval',
  'disgust', 'embarrassment', 'excitement', 'fear', 'gratitude', 'grief',
  'joy', 'love', 'nervousness', 'optimism', 'pride', 'realization',
  'relief', 'remorse', 'sadness', 'surprise', 'neutral',
];

export default function ModelPanel({
  modelName,
  data,
  colorTheme = 'blue',
  isHighlight = false,
}) {
  const [showAllScores, setShowAllScores] = useState(false);
  const { predicted, scores, metrics, thresholds = {} } = data;

  const theme = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      bar: 'bg-blue-500',
      ring: 'ring-blue-500',
    },
    green: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      bar: 'bg-emerald-500',
      ring: 'ring-emerald-500',
    },
  }[colorTheme];

  const containerStyle = isHighlight
    ? `ring-2 ${theme.ring} shadow-lg lg:scale-[1.01]`
    : 'border border-gray-200 shadow-sm';

  return (
    <div
      className={`bg-white rounded-2xl p-4 md:p-6 transition-all duration-300 ${containerStyle}`}>

      {/* --- HEADER --- */}
      {/* Mobile: Stack vertically. Desktop: Row with space-between */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 border-b border-gray-100 pb-4 gap-4 sm:gap-0">
        <div className="flex flex-col">
          <h2 className="text-lg md:text-xl font-bold text-gray-800">{modelName}</h2>
          {isHighlight && (
            <span className="mt-1 w-fit text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">
              Recommended
            </span>
          )}
        </div>

        {/* --- DYNAMIC METRICS GRID --- */}
        {metrics && Object.keys(metrics).length > 0 ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 w-full sm:w-auto">
            <MetricRow
              label="Macro F1"
              value={metrics.macro_f1}
              highlight={isHighlight}
            />
            <MetricRow label="Weighted F1" value={metrics.weighted_f1} />
            <MetricRow label="Exact Acc" value={metrics.exact_accuracy} />
            <MetricRow label="Hamming" value={metrics.hamming_loss} isLoss />
          </div>
        ) : (
          <div className="text-xs text-gray-400 italic mt-2">
            Metrics not loaded
          </div>
        )}
      </div>

      {/* --- PREDICTED BADGES --- */}
      <div className="mb-6 min-h-[50px]">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
          Final Prediction
        </h3>
        <div className="flex flex-wrap gap-2">
          {predicted && predicted.length > 0 ? (
            predicted.map((e) => (
              <span
                key={e}
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold capitalize shadow-sm ${theme.bg} ${theme.text} border ${theme.border}`}>
                {e}
              </span>
            ))
          ) : (
            <span className="text-gray-400 italic text-sm">
              No strong emotions detected
            </span>
          )}
        </div>
      </div>

      {/* --- SCORES & THRESHOLDS --- */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Detailed Analysis
          </h3>
          <button
            onClick={() => setShowAllScores(!showAllScores)}
            className="text-xs font-medium text-gray-500 hover:text-gray-800 underline p-2 -mr-2">
            {showAllScores ? 'Hide details' : 'Show all'}
          </button>
        </div>

        <div
          className={`space-y-3 pr-2 custom-scrollbar transition-all duration-500 ease-in-out ${
            showAllScores ? '' : 'max-h-64 overflow-y-auto'
          }`}>
          {scores &&
            GO_EMOTIONS.sort((a, b) => (scores[b] || 0) - (scores[a] || 0)).map(
              (label) => {
                const score = scores[label] || 0;
                const threshold = thresholds[label] ?? 0.5;
                const isPredicted = predicted.includes(label);

                if (!showAllScores && !isPredicted && score < 0.05) return null;

                return (
                  <div key={label} className="group">
                    <div className="flex justify-between text-xs mb-1">
                      <span
                        className={`font-medium capitalize ${isPredicted ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>
                        {label}
                      </span>
                      <div className="font-mono text-[10px] text-gray-400">
                        <span
                          className={
                            isPredicted ? 'text-gray-900 font-bold' : ''
                          }>
                          {score.toFixed(4)}
                        </span>
                        <span className="mx-1 opacity-50">/</span>
                        <span className="text-gray-500" title="Threshold">
                          Thr: {threshold.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${isPredicted ? theme.bar : 'bg-gray-300'}`}
                        style={{ width: `${score * 100}%` }}
                      />
                    </div>
                  </div>
                );
              },
            )}
        </div>
      </div>
    </div>
  );
}