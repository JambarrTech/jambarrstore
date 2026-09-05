import React from 'react';
import { useToast } from '@jambarrtech/shared';

function ToastItem({ toast }: { toast: { id: string; type: string; title: string; description?: string } }) {
  const { dismiss } = useToast();

  return (
    <div
      key={toast.id}
      role="alert"
      className={`rounded-md border p-4 mb-2 transition-all duration-1000 ease-out ${
        toast.type === 'success'
          ? 'bg-green-50 border-green-200 text-green-800'
          : toast.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : toast.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-slate-50 border-slate-200 text-slate-800'
      }`}
    >
      <div className="flex items-start gap-3">
        <svg
          className="h-5 w-5 flex-shrink-0 mt-0.5"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          {toast.type === 'success' && (
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          )}
          {toast.type === 'error' && (
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          )}
          {toast.type === 'warning' && (
            <path d="M12 9v2m0 4h.01M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          )}
          {toast.type === 'info' && (
            <>
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1" />
              <path d="m9 12-2 2 4 4L12 18l6-6-2-2z" fill="currentColor" strokeWidth="0" />
            </>
          )}
        </svg>
        <div className="flex-1 min-w-0">
          <p className="font-medium line-clamp-1">{toast.title}</p>
          {toast.description && (
            <p className="text-sm text-opacity-80 line-clamp-1">{toast.description}</p>
          )}
        </div>
        <button
          onClick={() => dismiss(toast.id)}
          className="ml-2 rounded-md p-0.5 transition-colors duration-150 ease-out hover:bg-current/10"
          aria-label="Fermer la notification"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function ToastDisplay() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem toast={toast} key={toast.id} />
      ))}
    </div>
  );
}