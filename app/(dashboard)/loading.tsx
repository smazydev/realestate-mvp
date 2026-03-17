export default function DashboardLoading() {
  return (
    <div className="flex flex-1 items-center justify-center p-8" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900 dark:border-gray-600 dark:border-t-gray-100" />
    </div>
  );
}
