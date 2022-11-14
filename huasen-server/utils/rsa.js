const constants = require('constants');
const crypto = require('crypto');

const rsaPublicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDeGJGWCwekus6kxqCafRWjX23R
ICAHMZN/6oEH4bqwut/frOUXbcVCOzShnye81Ow2p0zA9GR6NApmvs0QgT2FK7j0
9ArQATZ7tVUFE//HnyJj7Dm3D1u60itvizJiiekS9Ob23rERswr//Vc6CnsLqV8U
1dzCUMS2aNTAI8l7rwIDAQAB
-----END PUBLIC KEY-----
`;

const rsaPrivateKey = `-----BEGIN PRIVATE KEY-----
MIICeAIBADANBgkqhkiG9w0BAQEFAASCAmIwggJeAgEAAoGBAN4YkZYLB6S6zqTG
oJp9FaNfbdEgIAcxk3/qgQfhurC639+s5RdtxUI7NKGfJ7zU7DanTMD0ZHo0Cma+
zRCBPYUruPT0CtABNnu1VQUT/8efImPsObcPW7rSK2+LMmKJ6RL05vbesRGzCv/9
VzoKewupXxTV3MJQxLZo1MAjyXuvAgMBAAECgYEAzcuoQ4cu6vZqeobO1LgpL7xC
bvA8nU3T5kiujVYd/pr6zTFRCpednBRuXYCzeqc1xiLZ3UXYQOAt7yzHqY6IKD79
5Hola/6Tven9+h9aZsWlCyRLMBFq0IjT/Qq6kbucxwtZq71CZuvDNLBeYeMKTJu6
f7zveT40H6Te5AttxlECQQDxuZXdyL3F95+weiW4vMgYPmLsAitALYE3TQ071/fE
gPcoP3xd8ktkEu6ivMi8eTJuMOtKYr7Wrp6GMSfnoi3JAkEA6zY7Km8vk33WmDlU
p2FgCdPb7of8iBS5okTgzu1MgbPCPjGfemZwwbMt0K1pYtTZQIvbIPxaxk+ertcB
DeE5twJBAOzZUl4g7snGSyMpXEK6Pzl6D4V+zpAwxjbAeeIUSEKztvkp05td6L8i
yc6NOgdqnZ5YsoONY76JFO0ZxybwwvkCQQCRhsgshQZGlwECxdXeiZzF99KHTpOs
DkacY0lEPgWr6fAwUrt9G4yAC8A48FHX2CFikiVNz1TKhdCEFHqOf98ZAkArj/Ju
+BZM9Xr6RWEAinsao6A8IUZDwr4I71lAgIZotG+8ntQCwQWoMpDX5ldD74Ma6XO/
VJPOwx0vHx4BTRBM
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
function rsaEncryptLong(method, text, length) {
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
    let s =
      method === 'public'
        ? publicEncrypt(preEncryptCells[i], rsaPublicKey, 'utf8', 'hex')
        : privateEncrypt(preEncryptCells[i], rsaPrivateKey, 'utf8', 'hex');
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
function rsaDecryptLong(method, text) {
  let preDecriptCells = text.split(':hs:');
  return preDecriptCells.reduce((pre, cur) => {
    let s =
      method === 'public'
        ? publicDecrypt(cur, rsaPublicKey, 'hex', 'utf8')
        : privateDecrypt(cur, rsaPrivateKey, 'hex', 'utf8');
    return pre + s;
  }, '');
}

module.exports = {
  rsaPublicKey,
  rsaPrivateKey,
  publicEncrypt,
  publicDecrypt,
  privateDecrypt,
  privateEncrypt,
  rsaEncryptLong,
  rsaDecryptLong,
};

// 示例
// const str = 'huasen';
// const cipherText = publicEncrypt(str, rsaPublicKey, 'utf8', 'hex'); // 公钥加密
// const decryptText = privateDecrypt(cipherText, rsaPrivateKey, 'hex', 'utf8'); // 私钥解密
// console.log(str === decryptText); // true

// const cipherTextPrivate = privateEncrypt(str, rsaPrivateKey, 'utf8', 'hex'); // 私钥加密
// const decryptTextPublic = publicDecrypt(cipherTextPrivate, rsaPublicKey, 'hex', 'utf8'); // 公钥解密
// console.log(str === decryptTextPublic); // true
