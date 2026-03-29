import { useState, useRef, useEffect } from 'react';
import ModelPanel from '../features/home/components/ModelPanel.jsx';
import { predictApi } from '../features/home/api/predictApi.jsx';

export default function Home() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [baselineData, setBaselineData] = useState(null);
  const [cotegData, setCotegData] = useState(null);
  const [submittedText, setSubmittedText] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  const exampleSentences = [
    {
      label: "-- Select an example or type your own below --",
      value: ""
    },
    {
      label: "Moment 1: Empty Nest (Pride & Sadness)",
      value: "Watching my daughter drive away to college... I've never been so proud, yet the house feels so empty and quiet now."
    },
    {
      label: "Moment 2: Car Trouble (Panic & Fear)",
      value: "Wait, what? The brakes aren't working! Oh my god, watch out!"
    },
    {
      label: "Moment 3: Post-Exam (Relief & Joy)",
      value: "I am so glad the exam is finally over."
    },
    {
      label: "Moment 4: Bump in the Night (Terror & Dread)",
      value: "I heard a loud crash downstairs at 2 AM. I froze in bed, my heart stopped, and I realized I forgot to lock the back door."
    },
    {
      label: "Moment 5: Burnout (Pride & Breakdown)",
      value: "I was beaming with pride as I handed in the final project, though internally my mind was so broken and burned out that I just wanted to lock myself in a dark room and cry."
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePredict = () => {
    if (!text.trim()) return;
    setSubmittedText(text);
    predictApi(text, setLoading, setBaselineData, setCotegData).then(r => {
      if (!r.success) {
        alert("An error occurred while processing your request. Please try again.");
      }
    });
  };

  const currentSelectionLabel = exampleSentences.find(e => e.value === text)?.label || exampleSentences[0].label;

  return (
    <main className="min-h-screen px-4 py-6 md:px-6 md:py-8 font-sans text-gray-900">
      <section className="max-w-7xl mx-auto space-y-6 md:space-y-8">

        <header className="text-center space-y-6">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight px-2">
            Enter or select a complex emotion-laden sentence
          </h1>

          {/* Dropdown */}
          <div className="max-w-2xl mx-auto px-4" ref={dropdownRef}>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between text-left text-sm md:text-base text-gray-600 bg-white border border-gray-300 rounded-lg p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                <span className="truncate pr-4">{currentSelectionLabel}</span>
                <svg
                  className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu Options */}
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden transition-all">
                  <ul className="p-1.5">
                    {exampleSentences.slice(1).map((example, index) => (
                      <li
                        key={index}
                        onClick={() => {
                          setText(example.value);
                          setIsDropdownOpen(false);
                        }}
                        className={`px-3 py-2.5 mx-0.5 my-0.5 rounded-md text-sm md:text-base text-left cursor-pointer transition-colors
                          ${text === example.value 
                            ? 'bg-gray-200 text-gray-900 font-medium' 
                            : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'  
                          }`}
                      >
                        {example.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Input Area */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm max-w-3xl mx-auto w-full">
          <textarea
            className="w-full h-32 md:h-24 p-3 md:p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm md:text-base"
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
            className={`w-full mt-3 md:mt-4 py-3 rounded-xl font-medium text-white transition-all text-sm md:text-base
              ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-zinc-900 hover:bg-zinc-800 shadow-md active:scale-[0.99]'
              }
            `}>
            {loading ? 'Analyzing...' : 'Run Prediction'}
          </button>
        </div>

        {/* Results Section */}
        {baselineData && cotegData && (
          <div className="space-y-6">
            <div className="p-4 border border-gray-200 rounded-xl text-center max-w-4xl mx-auto shadow-sm">
              <span className="font-semibold text-gray-800">Analyzed Sentence: </span>
              <span className="text-gray-600 italic">"{submittedText}"</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start">
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
          </div>
        )}
      </section>
    </main>
  );
}