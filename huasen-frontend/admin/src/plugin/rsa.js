const constants = require('constants');
const crypto = require('crypto');

const rsaPublicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQChy/oQ2UL7JZUvhisjDOmqktW0
yOBAtIsqId4lKtTakZ4ttyU1q8ZP6+bVmHzfQ6jHPbZHDQaVNoMY3xFvECuAFpyh
eTyhY+25dBvJ4wrLchI6JBxcudIg/dabjAFnM1kSOs+adph4Ai1z593UlBJVd9i/
WPZ2e1pLkXhBOnYmzQIDAQAB
-----END PUBLIC KEY-----
`;
const rsaPrivateKey = `-----BEGIN PRIVATE KEY-----
MIICdwIBADANBgkqhkiG9w0BAQEFAASCAmEwggJdAgEAAoGBAKHL+hDZQvsllS+G
KyMM6aqS1bTI4EC0iyoh3iUq1NqRni23JTWrxk/r5tWYfN9DqMc9tkcNBpU2gxjf
EW8QK4AWnKF5PKFj7bl0G8njCstyEjokHFy50iD91puMAWczWRI6z5p2mHgCLXPn
3dSUElV32L9Y9nZ7WkuReEE6dibNAgMBAAECgYBVm4uwpoQeRoBtKNxiK07nhdG1
WiPtmJmZrVnQ6Jy/GRVMsv7pKv4/A16b3ZcUusPux+ROK8Iz6SfsXProfPHGeMEJ
V+eETZL35LNR1FKwwrvONAhI+4/M5+6wW3bbhsKzZcBrS3jUOLwuFWwJcnJZSEM/
A0iElKJbveyRQoIyAQJBANCZ47/ZDCt3detmRKK8SVcZf2oj/FLmrVDczTXdIA41
mTdk0odxwVs+QWqR8LWfv/l7sqLODemfwM4g7hPAhW0CQQDGj4bwKWgAVHDG9xbP
SiE0inSfSSogRueGnmCdYAaMxjMNXsisWi/7PbKy955OZjZx9O4wF8EX3TVFJ6so
sSrhAkEAqleQaKCIVJJnw8OudqmExlB3AKjEKrpee3LjTIH25EOWi2qUlLAq8iSD
bNAiHV6HeOYvOM1FBStEWc8AOzbyfQJANrhlOphepgCfV+XObnACeKVTgHY8WsrP
kYTiIVzOUUtp1FxztzPfl0Col7Ov9/EpPfx/C9fwCfCXdqh4/ezdYQJBAJcMosKM
d0q7HQuk8Kv88NAXlBa8HyX1HHRZwyRQGwsLWOvzJT17atHeHsTlOShub2cbZ0UR
3U9/arL3/TD23Bc=
-----END PRIVATE KEY-----
`;

/**
 * @description
 * 公钥加密数据
 * @param {*} data 待加密数据
 * @param {*} publicKey 公钥
 * @param {*} inputEncoding 加密数据类型
 * @param {*} outputEncoding 输出的数据类型
 * @param {*} padding 填充方式
 * @returns
 */
function publicEncrypt(data, publicKey, inputEncoding, outputEncoding, padding) {
  const encryptText = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: padding || constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(data, inputEncoding),
  );

  return encryptText.toString(outputEncoding);
}

/**
 * @description
 * 公钥解密数据
 * @param {*} data 待解密数据
 * @param {*} publicKey 公钥
 * @param {*} inputEncoding 解密数据类型
 * @param {*} outputEncoding 输出的数据类型
 * @param {*} padding 填充方式
 * @returns
 */
function publicDecrypt(data, publicKey, inputEncoding, outputEncoding, padding) {
  let decryptText = crypto.publicDecrypt(
    {
      key: publicKey,
      padding: padding || constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(data, inputEncoding),
  );

  return decryptText.toString(outputEncoding);
}

/**
 * @description
 * 私钥加密数据
 * @param {*} data 待加密数据
 * @param {*} privateKey 私钥
 * @param {*} inputEncoding 加密数据类型
 * @param {*} outputEncoding 输出的数据类型
 * @param {*} padding 填充方式
 * @returns
 */
function privateEncrypt(data, privateKey, inputEncoding, outputEncoding, padding) {
  const encryptText = crypto.privateEncrypt(
    {
      key: privateKey,
      padding: padding || constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(data, inputEncoding),
  );

  return encryptText.toString(outputEncoding);
}

/**
 * @description
 * 私钥解密数据
 * @param {*} data 待解密数据
 * @param {*} privateKey 私钥
 * @param {*} inputEncoding 解密数据类型
 * @param {*} outputEncoding 输出的数据类型
 * @param {*} padding 填充方式
 * @returns
 */
function privateDecrypt(data, privateKey, inputEncoding, outputEncoding, padding) {
  const decryptText = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: padding || constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(data, inputEncoding),
  );
  return decryptText.toString(outputEncoding);
}

/**
 * 分段加密数据
 * @param {String} method 加密方式 private ｜ public
 * @param {String} text   加密的字串
 * @param {Number} length 段长（明文 / 2 - 11）
 * @returns
 */
function rsaEncryptLong(method, rsaKey, text, length) {
  let index = 0;
  let preEncryptCells = [];
  while (text[index * length]) {
    let startIndex = index * length;
    let endIndex = (index + 1) * length;
    preEncryptCells.push(text.slice(startIndex, endIndex));
    index++;
  }
  let encryptCell = [];
  for (let i = 0; i < preEncryptCells.length; i++) {
    let s = method === 'public' ? publicEncrypt(preEncryptCells[i], rsaKey, 'utf8', 'hex') : privateEncrypt(preEncryptCells[i], rsaKey, 'utf8', 'hex');
    encryptCell.push(s);
  }
  return encryptCell.join(':hs:');
}

/**
 * 分段解密数据
 * @param {String} method 解密方式 private ｜ public
 * @param {String} text   需要解密的字串
 * @returns
 */
function rsaDecryptLong(method, rsaKey, text) {
  let preDecriptCells = text.split(':hs:');
  return preDecriptCells.reduce((pre, cur) => {
    let s = method === 'public' ? publicDecrypt(cur, rsaKey, 'hex', 'utf8') : privateDecrypt(cur, rsaKey, 'hex', 'utf8');
    return pre + s;
  }, '');
}

export { rsaPublicKey, rsaPrivateKey, publicEncrypt, publicDecrypt, privateDecrypt, privateEncrypt, rsaEncryptLong, rsaDecryptLong };

// const str = 'huasen';
// const cipherText = publicEncrypt(str, rsaPublicKey, 'utf8', 'hex'); // 公钥加密
// const decryptText = privateDecrypt(cipherText, rsaPrivateKey, 'hex', 'utf8'); // 私钥解密
// console.log(str === decryptText); // true

// const cipherTextPrivate = privateEncrypt(str, rsaPrivateKey, 'utf8', 'hex'); // 私钥加密
// const decryptTextPublic = publicDecrypt(cipherTextPrivate, rsaPublicKey, 'hex', 'utf8'); // 公钥解密
// console.log(str === decryptTextPublic); // true
