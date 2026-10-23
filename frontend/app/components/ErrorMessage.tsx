export const ErrorMessage = ({
  error,
  errors,
  id,
}: {
  error?: { message?: string };
  errors?: string[];
  id?: string;
}) => {
  if (!error && !errors?.length) return null;

  const list = errors?.length ? errors : [error?.message];

  return (
    <ul id={id} className="error-messages" role="alert" aria-live="assertive">
      {list.map((message, index) => (
        <li key={`${message}-${index}`}>{message}</li>
      ))}
    </ul>
  );
};
