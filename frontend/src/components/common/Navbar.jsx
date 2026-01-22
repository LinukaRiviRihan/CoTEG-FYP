export default function Navbar() {
  return (
    <nav className="w-full border-b bg-zinc-800">
      <div className="w-full mx-auto py-4 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold tracking-wide text-white">CoTEG</h1>
        <h2 className="mt-2 text-lg text-gray-300">
          A Hybrid T-GCN Model for Multi-Label Emotion Detection with Emotion
          Correlation Modeling
        </h2>
      </div>
    </nav>
  );
}
