export default function NoteCipher({
  notes,
  showBorder,
}: {
  cipherId: string;
  notes: string;
  showBorder?: boolean;
}) {
  return (
    <>
      <section className={'fields-group ' + (showBorder ? '' : 'no-border')}>
        <article className="field notes-field">
          <label>notes</label>
          <p className="notes-content monospace">{notes || <>&nbsp;</>}</p>
        </article>
      </section>
    </>
  );
}
