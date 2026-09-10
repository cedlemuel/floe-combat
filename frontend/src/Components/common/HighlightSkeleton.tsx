const HighlightSkeleton = () => {
  return (
    <div className="relative aspect-video bg-white/5 border border-borderColor overflow-hidden animate-pulse">
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 flex flex-col gap-2">
        <div className="h-4 sm:h-5 w-2/3 rounded-sm bg-white/10" />
        <div className="h-2.5 w-1/3 rounded-sm bg-white/10" />
      </div>
    </div>
  );
};

export default HighlightSkeleton;