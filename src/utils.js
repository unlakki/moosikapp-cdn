import FS from 'fs';

export function exists(path) {
  return new Promise((resolve) => {
    FS.exists(path.replace('/', '-'), resolve);
  });
}

export function unlink(path) {
  return new Promise((resolve, reject) => {
    FS.unlink(path, (err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(true);
    });
  });
}

export function createCache() {
  FS.exists('./cache', (isExists) => {
    if (!isExists) {
      FS.mkdir('./cache', () => {});
    }
  });
}
