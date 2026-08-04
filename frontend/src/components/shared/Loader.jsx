export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-3">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">{text}</p>
    </div>
  );
}

