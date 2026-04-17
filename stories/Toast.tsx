export function Toast({ message }: { message: string }) {
  return (
    <div className="demo-toast" role="alert">
      <span className="demo-toast__message">{message}</span>
    </div>
  );
}
