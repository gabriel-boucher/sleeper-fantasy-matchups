import { Spinner } from './Spinner';
import './StatusMessage.css';

export function LoadingMessage({ text }: { text: string }) {
  return (
    <div className="status-message" role="status">
      <Spinner />
      {text}
    </div>
  );
}

export function InfoMessage({ text }: { text: string }) {
  return <div className="status-message" role="status">{text}</div>;
}

export function ErrorMessage({ error }: { error: string }) {
  return <div className="error-message" role="alert">{error}</div>;
}
