import React from 'react';

export default function Features() {
  const features = [
    {
      title: "Emotion Correlation Modeling",
      description: "Utilizes Graph Convolutional Networks (GCN) to map the complex relationships between emotions, recognizing that 'Joy' and 'Relief' often co-occur, while learning to distinguish between conflicting emotional states.",
      icon: (
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      iconBg: "bg-blue-500/10",
      borderColor: "border-blue-300"
    },
    {
      title: "Context-Aware Emotion Detection",
      description: "Powered by Transformer architecture to decode deep semantic meaning. It captures subtle linguistic nuances, ensuring the model understands the specific context behind every word.",
      icon: (
        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      iconBg: "bg-purple-500/10",
      borderColor: "border-purple-300"
    },
    {
      title: "Enhanced Multi-Label Accuracy",
      description: "Optimized for complex scenarios where multiple emotions exist simultaneously. CoTEG provides a nuanced emotional profile that far exceeds the precision of standard baseline models.",
      icon: (
        <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      iconBg: "bg-emerald-500/10",
      borderColor: "border-emerald-300"
    }
  ];

  return (
    <div className="min-h-screen px-4 py-12 md:px-6 bg-white font-sans">
      <div className="max-w-7xl mx-auto space-y-12">

        <header className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-blue-600 font-semibold tracking-wide uppercase text-sm">Capabilities</h2>
          <h1 className="text-3xl md:text-3xl font-bold tracking-tight text-zinc-900">
            Why CoTEG is different
          </h1>
          <p className="text-lg text-gray-500">
            A specialized architecture designed to handle the complexity of human sentiment.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-white border ${feature.borderColor} rounded-3xl p-8 shadow-sm flex flex-col`}
            >
              <div className={`w-12 h-12 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-6`}>
                {feature.icon}
              </div>

              <h3 className="text-xl font-bold text-zinc-900 mb-4">
                {feature.title}
              </h3>

              <p className="text-gray-500 leading-relaxed text-sm md:text-base">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}