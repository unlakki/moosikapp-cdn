import Token from '../../models/Token';

interface ITargetManager {
  add: (token: Token) => Promise<boolean>;
  has: (token: Token) => Promise<boolean>;
}

export default ITargetManager;
