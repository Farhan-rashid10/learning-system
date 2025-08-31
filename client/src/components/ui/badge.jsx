export function Badge({ children, className }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-800 ${className}`}
    >
      {children}
    </span>
  );
}
