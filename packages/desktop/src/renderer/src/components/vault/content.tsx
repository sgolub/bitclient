import { CipherType } from '@bitclient/common/types/vault';
import NoteCipher from './ciphers/note';
import LoginCipher from './ciphers/login';
import CardCipher from './ciphers/card';
import IdentityCipher from './ciphers/identity';
import CustomFields from './ciphers/fields';
import useApplicationContext from '@renderer/hooks/useApplicationContext';
import Folder from '../common/icons/folder';
import Office from '../common/icons/office';
import Circle from '../common/icons/circle';
import Collection from '../common/icons/collection';
import {
  BaseDataViewModel,
  CardDataViewModel,
  CipherViewModel,
  IdentityDataViewModel,
  LoginDataViewModel,
} from '@bitclient/common/models/view/Vault';
import CiphersFavicon from './favicon';

import './content.scss';

export default function CipherContent({
  cipher,
  folder,
  organization,
  collections,
}: {
  cipher: CipherViewModel;
  folder: string | null;
  organization: string | null;
  collections: string[];
}) {
  const { ctx } = useApplicationContext();
  return (
    <>
      <div className="cipher-content">
        <div className="cipher-content-inner">
          <div className="cipher-header">
            {organization && (
              <div className="cipher-organization">
                <Office className="icon fill" />
                {organization}
              </div>
            )}
            {!organization && (
              <div className="cipher-organization">
                <Circle fill={ctx.account?.avatarColor || ''} className="icon" />
                {ctx.account?.name}
              </div>
            )}
            {folder && (
              <div className="cipher-folder">
                <Folder className="icon" />
                {folder}
              </div>
            )}
            {collections.length > 0 && (
              <div className="cipher-collections">
                <Collection className="icon fill" />
                {collections.join(', ')}
              </div>
            )}
            {/* {cipher.favorite && (
              <div className="cipher-favorite">
                <Star className="icon" />
              </div>
            )} */}
            {/* <div className="cipher-favorite">
              {cipher.favorite ? <Star className="icon" /> : <StarEmpty className="icon" />}
            </div> */}
          </div>
          <div className="cipher-name">
            <div className="cipher-icon">
              <CiphersFavicon cipher={cipher} />
            </div>
            <div className="name">{cipher.name}</div>
          </div>
          {cipher.type === CipherType.Login && (
            <LoginCipher
              cipherId={cipher.id}
              cipher={cipher.data as BaseDataViewModel & LoginDataViewModel}
            />
          )}
          {cipher.type === CipherType.Card && (
            <CardCipher
              cipherId={cipher.id}
              cipher={cipher.data as BaseDataViewModel & CardDataViewModel}
            />
          )}
          {cipher.type === CipherType.Identity && (
            <IdentityCipher
              cipherId={cipher.id}
              cipher={cipher.data as BaseDataViewModel & IdentityDataViewModel}
            />
          )}
          {cipher.data.fields.length > 0 && (
            <CustomFields
              cipherId={cipher.id}
              fields={cipher.data.fields}
              showBorder={cipher.type === CipherType.SecureNote}
            />
          )}
          {(cipher.notes || cipher.type === CipherType.SecureNote) && (
            <NoteCipher
              cipherId={cipher.id}
              notes={cipher.notes}
              showBorder={cipher.type === CipherType.SecureNote}
            />
          )}
        </div>
        <div className="cipher-content-footer">
          {cipher.creationDate && (
            <div className="date">Created {cipher.creationDate.toLocaleString()}</div>
          )}
          {cipher.revisionDate &&
            cipher.creationDate.toUTCString() !== cipher.revisionDate.toUTCString() &&
            !cipher.deletedDate && (
              <div className="date">Updated {cipher.revisionDate.toLocaleString()}</div>
            )}
          {cipher.deletedDate && (
            <div className="date">Deleted {cipher.revisionDate.toLocaleString()}</div>
          )}
        </div>
      </div>
    </>
  );
}
