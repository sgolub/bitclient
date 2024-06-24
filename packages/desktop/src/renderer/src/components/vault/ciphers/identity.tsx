import { BaseDataViewModel, IdentityDataViewModel } from '@bitclient/common/models/view/Vault';
import { TextField } from '../fields/text';
import { PasswordField } from '../fields/password';

export default function IdentityCipher({
  cipherId,
  cipher,
}: {
  cipherId: string;
  cipher: BaseDataViewModel & IdentityDataViewModel;
}) {
  return (
    <>
      <section className="fields-group">
        <TextField name="title" value={cipher.title} copyOnClick={true} />
        <TextField
          name="first name"
          value={cipher.firstName}
          showIfEmpty={true}
          copyOnClick={true}
        />
        <TextField name="middle name" value={cipher.middleName} copyOnClick={true} />
        <TextField name="last name" value={cipher.lastName} showIfEmpty={true} copyOnClick={true} />
      </section>
      {(cipher.username || cipher.company) && (
        <section className="fields-group no-border">
          <TextField name="username" value={cipher.username} />
          <TextField name="company" value={cipher.company} />
        </section>
      )}
      {(cipher.ssn || cipher.passportNumber || cipher.licenseNumber) && (
        <section className="fields-group no-border">
          <PasswordField cipherId={cipherId} name="social security number" value={cipher.ssn} />
          <PasswordField cipherId={cipherId} name="passport number" value={cipher.passportNumber} />
          <PasswordField cipherId={cipherId} name="license number" value={cipher.licenseNumber} />
        </section>
      )}
      {(cipher.email ||
        cipher.phone ||
        cipher.address1 ||
        cipher.address2 ||
        cipher.address3 ||
        cipher.city ||
        cipher.state ||
        cipher.country) && (
        <section className="fields-group no-border">
          <TextField name="email" value={cipher.email} />
          <TextField name="phone number" value={cipher.phone} />
          <TextField name="address" value={cipher.address1} />
          <TextField name="" value={cipher.address2} />
          <TextField name="" value={cipher.address3} />
          <TextField name="city" value={cipher.city} />
          <TextField name="state" value={cipher.state} />
          <TextField name="country" value={cipher.country} />
        </section>
      )}
    </>
  );
}
