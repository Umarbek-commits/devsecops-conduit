export function SuccessMessage({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="success-message" role="status" aria-live="polite">
      {message}
    </p>
  );
}
