import { useState } from 'react';
import Logo from '@renderer/components/common/icons/logo';
import useApplicationContext from '@renderer/hooks/useApplicationContext';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { TwoFactorAuthProvider } from '@bitclient/common/types/auth';
import BitwardenServer from '@bitclient/common/types/BitwardenServer';

import ChooseServer from './1-chooseServer';
import Prelogin from './2-prelogin';
import Login from './3-login';
import ChooseTwoFactor from './4-chooseTwoFactor';
import TwoFactor from './5-twoFactor';

import './login.scss';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [, setPassword] = useState('');
  const [twoFactorProviders, setTwoFactorProviders] = useState<TwoFactorAuthProvider[]>([]);
  const [twoFactorType, setTwoFactorType] = useState(TwoFactorAuthProvider.None);

  const navigate = useNavigate();

  const { ctx, updateContext } = useApplicationContext();
  if (ctx.account) {
    return <Navigate to="/vault" />;
  }

  return (
    <>
      <section className="form-container">
        <Logo className="logo" />
        <Routes>
          <Route
            index
            element={
              <ChooseServer
                goToPrelogin={(newServer: BitwardenServer) => {
                  ctx.setServer(newServer);
                  updateContext(ctx);
                  navigate('/auth/prelogin');
                }}
              />
            }
          />
          <Route
            path="/prelogin"
            element={
              <Prelogin
                goToLogin={(newEmail: string) => {
                  setEmail(newEmail);
                  navigate('/auth/login');
                }}
                goBack={() => {
                  ctx.setServer(BitwardenServer.empty());
                  updateContext(ctx);
                  setEmail('');
                  navigate('/auth');
                }}
              />
            }
          />
          <Route
            path="/login"
            element={
              <Login
                email={email}
                goToChooseTwoFactor={(newPassword: string, providers: TwoFactorAuthProvider[]) => {
                  setPassword(newPassword);
                  setTwoFactorProviders(providers.reverse());
                  if (providers.length === 1) {
                    setTwoFactorType(providers[0]);
                    navigate('/auth/twoFactor');
                    return;
                  }
                  navigate('/auth/chooseTwoFactor');
                }}
                goBack={() => {
                  setEmail('');
                  setPassword('');
                  if (ctx.server.isEmpty()) {
                    navigate('/auth');
                  } else {
                    navigate('/auth/prelogin');
                  }
                }}
              />
            }
          />
          <Route
            path="/chooseTwoFactor"
            element={
              <ChooseTwoFactor
                email={email}
                twoFactorProviders={twoFactorProviders}
                goToTwoFactor={(newTwoFactorAuthProvider: TwoFactorAuthProvider) => {
                  setTwoFactorType(newTwoFactorAuthProvider);
                  navigate('/auth/twoFactor');
                }}
                goBack={() => {
                  setEmail('');
                  setPassword('');
                  setTwoFactorProviders([]);
                  // setTwoFactorType(TwoFactorAuthProvider.None);

                  if (ctx.server.isEmpty()) {
                    navigate('/auth');
                  } else {
                    navigate('/auth/prelogin');
                  }
                }}
              />
            }
          />
          <Route
            path="/twoFactor"
            element={
              <TwoFactor
                email={email}
                // password={password}
                twoFactorType={twoFactorType}
                goBack={() => {
                  setEmail('');
                  setPassword('');
                  setTwoFactorProviders([]);
                  setTwoFactorType(TwoFactorAuthProvider.None);

                  if (ctx.server.isEmpty()) {
                    navigate('/auth');
                  } else {
                    navigate('/auth/prelogin');
                  }
                }}
              />
            }
          />
        </Routes>
      </section>
    </>
  );
}
