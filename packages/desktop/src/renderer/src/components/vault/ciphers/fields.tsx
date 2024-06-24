import { CustomFieldViewModel } from '@bitclient/common/models/view/Vault';
import { CustomFieldType } from '@bitclient/common/types/vault';
import { TextField } from '../fields/text';
import { PasswordField } from '../fields/password';
import { Fragment } from 'react/jsx-runtime';

export default function CustomFields({
  cipherId,
  fields,
  showBorder,
}: {
  cipherId: string;
  fields: CustomFieldViewModel[];
  showBorder?: boolean;
}) {
  return (
    <>
      {fields.length > 0 && (
        <section className={'fields-group ' + (showBorder ? '' : 'no-border')}>
          {fields.map((field, i) => {
            return (
              <Fragment key={i}>
                {field.type === CustomFieldType.Text && (
                  <TextField name={field.name} value={field.value} copyOnClick={showBorder} />
                )}
                {field.type === CustomFieldType.Password && (
                  <PasswordField
                    cipherId={cipherId}
                    name={field.name}
                    value={field.value}
                    copyOnClick={showBorder}
                  />
                )}
                {field.type === CustomFieldType.Boolean && (
                  <article className="field custom-field">
                    <p className="custom-field-name">{field.name}</p>
                    <p className="custom-field-value">
                      <input
                        className="toggle"
                        type="checkbox"
                        name="rememberMe"
                        id="rememberMe"
                        autoComplete="off"
                        checked={field.value === 'true'}
                        readOnly={true}
                      />
                    </p>
                  </article>
                )}
              </Fragment>
            );
          })}
        </section>
      )}
    </>
  );
}
