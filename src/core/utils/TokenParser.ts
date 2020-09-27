import JWT from 'jsonwebtoken';
import Token from '../models/Token';
import ConfigProvider from '../services/ConfigProvider';

class TokenParser {
  private readonly _configProvider: ConfigProvider;

  constructor(configProvider: ConfigProvider) {
    this._configProvider = configProvider;
  }

  public tryParseToken = (token: string) => {
    try {
      return <Token>JWT.verify(token, this._configProvider.jwtSecretKey);
    } catch (e) {
      return null;
    }
  };
}

export default TokenParser;
