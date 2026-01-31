export default function Navbar() {
  return (
    <nav className="w-full border-b bg-zinc-800 px-4">
      <div className="w-full mx-auto py-3 md:py-4 flex flex-col items-center justify-center text-center">
        <h1 className="text-xl md:text-2xl font-bold tracking-wide text-white">
          CoTEG
        </h1>
        <h2 className="mt-1 md:mt-2 text-sm md:text-lg text-gray-300 max-w-md md:max-w-none leading-tight">
          A Hybrid T-GCN Model for Multi-Label Emotion Detection with Emotion
          Correlation Modeling
        </h2>
      </div>
    </nav>
  );
}