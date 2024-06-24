import DatabaseProvider from './DatabaseProvider';
import HttpProvider from './HttpProvider';

export default interface Injections {
  http: HttpProvider;
  db: DatabaseProvider;
}
