import { BaseDataViewModel, LoginDataViewModel } from '@bitclient/common/models/view/Vault';
import { TextField } from '../fields/text';
import { PasswordField } from '../fields/password';
import { TotpField } from '../fields/totp';
import { UriField } from '../fields/uri';

export default function LoginCipher({
  cipherId,
  cipher,
}: {
  cipherId: string;
  cipher: BaseDataViewModel & LoginDataViewModel;
}) {
  return (
    <>
      <section className="fields-group">
        <TextField name="username" value={cipher.username} showIfEmpty={true} copyOnClick={true} />
        <PasswordField
          cipherId={cipherId}
          name="password"
          value={cipher.password}
          showIfEmpty={true}
          copyOnClick={true}
        />
        <TotpField name="verification code" value={cipher.totp} copyOnClick={true} />
      </section>
      {/* {cipher.uri && (
        <section className="fields-group">
          <UriField name="uri" value={cipher.uri} />
        </section>
      )} */}
      {cipher.uris.length > 0 && (
        <section className="fields-group no-border">
          <UriField name="uri" values={cipher.uris} />
          {/* {cipher.uris.map((uri) => (
            <UriField key={uri} name="uri" value={uri} />
          ))} */}
        </section>
      )}
    </>
  );
}
