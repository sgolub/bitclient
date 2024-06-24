import { ReactApplicationContext } from '@renderer/contexts/applicationContext';
import { useContext } from 'react';

export default function useApplicationContext() {
  const value = useContext(ReactApplicationContext);
  if (value === null || value.ctx === null) {
    throw new Error('Application context is not defined.');
  }
  const { ctx, updateContext } = value;
  return { ctx, updateContext: (context) => updateContext(context.clone()) };
}
