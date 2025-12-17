import useApplicationContext from '@renderer/hooks/useApplicationContext';

export default function WrongServer({ reset }: { reset: () => void }) {
  const { ctx } = useApplicationContext();

  return (
    <>
      <div className="form-row text-center">
        <label htmlFor="server">
          Connect to&nbsp;<strong>{ctx.server.displayName}</strong>
        </label>
        <p>
          <button type="button" className="btn link" onClick={reset}>
            Wrong server?
          </button>
        </p>
      </div>
    </>
  );
}
