export default function NotYou({ email, goBack }: { email: string; goBack: () => void }) {
  return (
    <>
      <label>
        Logging in as&nbsp;<strong>{email}</strong>
      </label>
      <br />
      <button type="button" className="btn link" onClick={goBack}>
        Not you?
      </button>
    </>
  );
}
