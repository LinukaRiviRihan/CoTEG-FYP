import { useState } from 'react';
import ModelPanel from '../features/home/components/ModelPanel.jsx';
import { predictApi } from '../features/home/api/predictApi.jsx';

export default function Home() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [baselineData, setBaselineData] = useState(null);
  const [cotegData, setCotegData] = useState(null);

  const handlePredict = () => {
    predictApi(text, setLoading, setBaselineData, setCotegData);
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-8 font-sans text-gray-900">
      <section className="max-w-7xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Enter a complex emotion-laden sentence
          </h1>
          <p className="text-gray-500">
            (e.g., "I received the acceptance letter for the job abroad today! I
            am over the moon, but realized I have to say goodbye to my parents
            next week, and it’s crushing me.")
          </p>
        </header>

        {/* Input Area */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm max-w-3xl mx-auto w-full">
          <textarea
            className="w-full h-24 p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Type a complex sentence..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' &&
              !e.shiftKey &&
              (e.preventDefault(), handlePredict())
            }
          />
          <button
            onClick={handlePredict}
            disabled={!text.trim() || loading}
            className={`w-full mt-4 py-3 rounded-xl font-medium text-white transition-all
              ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-zinc-900 hover:bg-zinc-800 shadow-md'
              }
            `}>
            {loading ? 'Analyzing...' : 'Run Comparison'}
          </button>
        </div>

        {/* Results Grid - Only show if data exists */}
        {baselineData && cotegData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <ModelPanel
              modelName="CoTEG (Graph Enhanced)"
              colorTheme="green"
              data={cotegData}
              isHighlight={true}
            />
            <ModelPanel
              modelName="Baseline (RoBERTa)"
              colorTheme="blue"
              data={baselineData}
            />
          </div>
        )}
      </section>
    </main>
  );
}
