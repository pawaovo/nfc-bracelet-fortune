const encodeToBase64 = (value: string): string => {
  const utf8Bytes: number[] = [];

  for (let i = 0; i < value.length; i++) {
    let charCode = value.charCodeAt(i);

    if (charCode < 0x80) {
      utf8Bytes.push(charCode);
    } else if (charCode < 0x800) {
      utf8Bytes.push(0xc0 | (charCode >> 6));
      utf8Bytes.push(0x80 | (charCode & 0x3f));
    } else if (charCode < 0xd800 || charCode >= 0xe000) {
      utf8Bytes.push(0xe0 | (charCode >> 12));
      utf8Bytes.push(0x80 | ((charCode >> 6) & 0x3f));
      utf8Bytes.push(0x80 | (charCode & 0x3f));
    } else {
      i++;
      const nextCharCode = value.charCodeAt(i);
      charCode = 0x10000 + (((charCode & 0x3ff) << 10) | (nextCharCode & 0x3ff));
      utf8Bytes.push(0xf0 | (charCode >> 18));
      utf8Bytes.push(0x80 | ((charCode >> 12) & 0x3f));
      utf8Bytes.push(0x80 | ((charCode >> 6) & 0x3f));
      utf8Bytes.push(0x80 | (charCode & 0x3f));
    }
  }

  const uint8Array = new Uint8Array(utf8Bytes);

  if (typeof uni !== 'undefined' && typeof uni.arrayBufferToBase64 === 'function') {
    return uni.arrayBufferToBase64(uint8Array.buffer);
  }

  if (typeof btoa !== 'undefined') {
    let binary = '';
    uint8Array.forEach(byte => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  }

  throw new Error('Base64 encoding not supported in this environment');
};

export const generateDevJWT = (userId: string, openid: string): string => {
  const payload = {
    sub: userId,
    openid,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
  };

  const header = { alg: 'DEV', typ: 'JWT' };

  const encodedHeader = encodeToBase64(JSON.stringify(header));
  const encodedPayload = encodeToBase64(JSON.stringify(payload));

  return `DEV.${encodedHeader}.${encodedPayload}`;
};
