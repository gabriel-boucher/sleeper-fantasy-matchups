import './StatusMessage.css';

export function LoadingMessage({ text }: { text: string }) {
  return (
    <div className="status-message" role="status">
      <span className="spinner" aria-hidden="true" />
      {text}
    </div>
  );
}

export function ErrorMessage({ error }: { error: string }) {
  return <div className="error-message" role="alert">{error}</div>;
}
