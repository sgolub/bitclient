import { useState } from 'react';

import './login.scss';
import Logo from '@renderer/components/common/icons/logo';
import useApplicationContext from '@renderer/hooks/useApplicationContext';
import { Navigate } from 'react-router-dom';
import LoginForm from './login';
import PreloginForm from './prelogin';
import Intro from './intro';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const { ctx } = useApplicationContext();

  if (ctx.account) {
    return <Navigate to="/vault" />;
  }

  return (
    <>
      <section className="form-container">
        <Logo className="logo" />
        {ctx.server.displayName !== '' && !email && <h1 className="title">Log In</h1>}
        {ctx.server.displayName === '' && <Intro />}
        {ctx.server.displayName !== '' && !email && (
          <PreloginForm onSuccess={(newEmail: string) => setEmail(newEmail)} />
        )}
        {email && <LoginForm email={email} goBack={() => setEmail('')} />}
      </section>
    </>
  );
}
