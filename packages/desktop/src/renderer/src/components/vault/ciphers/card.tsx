import { BaseDataViewModel, CardDataViewModel } from '@bitclient/common/models/view/Vault';
import { PasswordField } from '../fields/password';
import { TextField } from '../fields/text';
import { CardNumberField } from '../fields/cardNumber';
import { CardType } from '@bitclient/common/types/vault';

export default function CardCipher({
  cipherId,
  cipher,
}: {
  cipherId: string;
  cipher: BaseDataViewModel & CardDataViewModel;
}) {
  function formatExpDate(expMonth: string, expYear: string) {
    if (!expMonth || !expYear) {
      return '';
    }
    return expMonth.padStart(2, '0') + '/' + expYear;
  }

  function isExpired(expMonth: string, expYear: string) {
    const date = new Date();
    if (date.getUTCFullYear() > parseInt(expYear)) {
      return true;
    } else if (date.getUTCFullYear() === parseInt(expYear)) {
      return date.getUTCMonth() + 1 > parseInt(expMonth);
    }
    return false;
  }

  return (
    <>
      <section className="fields-group no-border">
        {cipher.brand !== CardType.Other && (
          <TextField name="brand" value={cipher.brand} hideCopyButton={true} />
        )}
      </section>
      <section className="fields-group">
        <CardNumberField
          cipherId={cipherId}
          name="number"
          value={cipher.number}
          preview={cipher.preview}
          type={cipher.brand}
          copyOnClick={true}
        />
        <TextField
          name="cardholder name"
          className="monospace"
          value={cipher.cardholderName.toLocaleUpperCase()}
          showIfEmpty={true}
          copyOnClick={true}
        />
        <div className="fields-row">
          <TextField
            className={
              'monospace lucida ' + (isExpired(cipher.expMonth, cipher.expYear) ? 'red' : '')
            }
            name="expiration date"
            value={formatExpDate(cipher.expMonth, cipher.expYear)}
            showIfEmpty={true}
            copyOnClick={true}
          />
          <PasswordField
            name="security code"
            cipherId={cipherId}
            value={cipher.code}
            length={cipher.brand === CardType.Amex ? 4 : 3}
            showIfEmpty={true}
            highlight={false}
            copyOnClick={true}
          />
        </div>
      </section>
    </>
  );
}
