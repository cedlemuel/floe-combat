const ReviewSkeleton = () => {
  return (
    <div className="relative flex flex-col gap-3 p-5 sm:p-8 border-l border-t border-borderColor animate-pulse">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-4 h-4 rounded-full bg-white/10" />
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <div className="h-3 w-full rounded-sm bg-white/10" />
        <div className="h-3 w-5/6 rounded-sm bg-white/10" />
        <div className="h-3 w-2/3 rounded-sm bg-white/10" />
      </div>

      <div className="pt-2 pb-4 border-b border-borderColor">
        <div className="h-3 w-40 rounded-sm bg-white/10" />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <div className="w-8 h-8 rounded-full bg-white/10" />
        <div className="flex flex-col gap-1.5">
          <div className="h-2.5 w-20 rounded-sm bg-white/10" />
          <div className="h-2.5 w-16 rounded-sm bg-white/10" />
        </div>
      </div>
    </div>
  );
};

export default ReviewSkeleton;