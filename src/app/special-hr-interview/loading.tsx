
export default function Loading() {
  return (
    <div className="min-h-screen w-full bg-[#050816] flex items-center justify-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-2 border-accent/20 rounded-full animate-ping" />
        <div className="absolute inset-0 border-2 border-t-accent border-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}
