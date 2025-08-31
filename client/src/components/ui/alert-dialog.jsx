import * as React from "react";

export function AlertDialog({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        {children}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export function AlertDialogTrigger({ children, onClick }) {
  return (
    <button
      className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function AlertDialogContent({ children }) {
  return <div className="mt-2">{children}</div>;
}

export function AlertDialogHeader({ children }) {
  return <div className="mb-4">{children}</div>;
}

export function AlertDialogTitle({ children }) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}

export function AlertDialogDescription({ children }) {
  return <p className="text-sm text-gray-600">{children}</p>;
}

export function AlertDialogFooter({ children }) {
  return <div className="mt-4 flex justify-end space-x-2">{children}</div>;
}

export function AlertDialogCancel({ children, onClick }) {
  return (
    <button
      className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function AlertDialogAction({ children, onClick }) {
  return (
    <button
      className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
