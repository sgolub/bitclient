import Earth from '../common/icons/earth';
import { CardType, CipherType } from '@bitclient/common/types/vault';
import Card from '../common/icons/card';
import Notes from '../common/icons/notes';
import Identity from '../common/icons/identity';
import {
  BaseDataViewModel,
  CardDataViewModel,
  CipherViewModel,
  LoginDataViewModel,
} from '@bitclient/common/models/view/Vault';
import { useEffect, useState } from 'react';
import Visa from '../common/icons/cards/Visa';
import Mastercard from '../common/icons/cards/Mastercard';
import Amex from '../common/icons/cards/Amex';
import Discover from '../common/icons/cards/Discover';
import DinersClub from '../common/icons/cards/DinersClub';
import JCB from '../common/icons/cards/JCB';
import Maestro from '../common/icons/cards/Maestro';
import UnionPay from '../common/icons/cards/UnionPay';
import RuPay from '../common/icons/cards/RuPay';
// import { preload } from 'react-dom';

export default function CiphersFavicon({ cipher }: { cipher: CipherViewModel }) {
  const [favicon, setFavicon] = useState<string | null>(null);

  useEffect(() => {
    if (cipher.type !== CipherType.Login) {
      return;
    }

    const uri = (cipher.data as BaseDataViewModel & LoginDataViewModel).uri;

    if (URL.canParse(uri)) {
      const url = new URL(uri);
      // const faviconUrl = `https://www.google.com/s2/favicons?domain=${url.host}&sz=${16 * 3}`;
      const faviconUrl = `https://icons.bitwarden.net/${url.hostname}/icon.png`;
      setFavicon(faviconUrl);
    } else {
      setFavicon(null);
    }
  }, [cipher]);

  return (
    <>
      {cipher.type == CipherType.Login &&
        (favicon ? (
          <img
            src={favicon}
            className="favicon"
            alt={'Favicon for ' + cipher.name}
            onError={() => setFavicon(null)}
          />
        ) : (
          <Earth className="favicon fill" />
        ))}
      {cipher.type == CipherType.Card &&
        getCardIcon((cipher.data as BaseDataViewModel & CardDataViewModel).brand)}
      {cipher.type == CipherType.Identity && <Identity className="favicon" />}
      {cipher.type == CipherType.SecureNote && <Notes className="favicon" />}
    </>
  );
}

function getCardIcon(brand: CardType) {
  switch (brand) {
    case CardType.Visa:
      return <Visa className="favicon card" />;
    case CardType.Mastercard:
      return <Mastercard className="favicon card" />;
    case CardType.Amex:
      return <Amex className="favicon card" />;
    case CardType.Discover:
      return <Discover className="favicon card" />;
    case CardType.DinersClub:
      return <DinersClub className="favicon card" />;
    case CardType.JCB:
      return <JCB className="favicon card" />;
    case CardType.Maestro:
      return <Maestro className="favicon card" />;
    case CardType.UnionPay:
      return <UnionPay className="favicon card" />;
    case CardType.RuPay:
      return <RuPay className="favicon card" />;
    default:
      return <Card className="favicon" />;
  }
}
