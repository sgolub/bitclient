import Injections from './Injections';

export default interface Service<T1, T2> {
  (injections: Injections, params: T1): Promise<T2> | T2;
}
