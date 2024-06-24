import './password.scss';

export default function Password({ password }: { password: string }) {
  return (
    <>
      {password.split('').map((c, i) => (
        <span className={'monospace strong ' + getClassName(c)} key={i}>
          {c}
        </span>
      ))}
    </>
  );
}

function getClassName(c: string): string {
  if (/[a-z]{1}/.test(c)) {
    return 'l';
  } else if (/[A-Z]{1}/.test(c)) {
    return 'u';
  } else if (/\d{1}/.test(c)) {
    return 'd';
  } else {
    return 's';
  }
}
