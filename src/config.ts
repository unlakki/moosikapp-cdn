const getDiskTokenArray = () => {
  const keys = Object.keys(process.env).filter(
    (key) => /DISK\d+/.test(key),
  );

  if (keys.length === 0) {
    throw new Error('No DISK found.');
  }

  return keys.map((key) => <string>process.env[key]);
};

const getJWTSecretKey = () => {
  const jwtSecretKey = process.env.JWT_SECRET;
  if (!jwtSecretKey) {
    throw new Error('No JWT secret key.');
  }

  return jwtSecretKey;
};

export const diskTokenArray = getDiskTokenArray();

export const jwtSecretKey = getJWTSecretKey();
