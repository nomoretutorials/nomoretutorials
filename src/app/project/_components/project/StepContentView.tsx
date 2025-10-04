export type StepContent = {
  overview: string;
  instructions: string[];
  hints: string[];
  checkpoints: string[];
};

type Props = {
  content: StepContent;
};

export default function StepContentView({ content }: Props) {
  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="rounded-lg bg-blue-50 p-4">
        <h3 className="mb-2 font-semibold">📋 Overview</h3>
        <p className="text-gray-700">{content.overview}</p>
      </div>

      {/* Instructions */}
      <div>
        <h3 className="mb-3 font-semibold">📝 Instructions</h3>
        <ol className="space-y-3">
          {content.instructions.map((instruction, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm text-white">
                {i + 1}
              </span>
              <p className="flex-1 text-gray-700">{instruction}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Hints */}
      <div className="rounded-lg bg-yellow-50 p-4">
        <h3 className="mb-2 font-semibold">💡 Hints</h3>
        <ul className="space-y-2">
          {content.hints.map((hint, i) => (
            <li key={i} className="text-sm text-gray-700">
              • {hint}
            </li>
          ))}
        </ul>
      </div>

      {/* Checkpoints */}
      <div className="rounded-lg bg-green-50 p-4">
        <h3 className="mb-2 font-semibold">✅ Checkpoints</h3>
        <ul className="space-y-2">
          {content.checkpoints.map((checkpoint, i) => (
            <li key={i} className="text-sm text-gray-700">
              • {checkpoint}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
