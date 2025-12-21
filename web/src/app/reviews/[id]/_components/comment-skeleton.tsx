export const CommentSkeleton = () => {
  return (
    <div className="mt-6 space-y-4">
      <h2 className="text-lg font-semibold">コメント</h2>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="animate-pulse space-y-2 border-b p-4">
          <div className="h-4 w-1/3 rounded bg-gray-300"></div>
          <div className="h-4 w-2/3 rounded bg-gray-300"></div>
          <div className="h-4 w-1/2 rounded bg-gray-300"></div>
        </div>
      ))}
    </div>
  )
}
