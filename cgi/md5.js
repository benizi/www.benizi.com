/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */
/* Modified by Benjamin R. Haskell */

var MD5 = {};

/*
 * These are the functions you'll usually want to call
 * They take string arguments and return either hex or base-64 encoded strings
 */
MD5.hex = function(s){ return Util.binl2hex(MD5.core(Util.str2binl(s), s.length * Util.chrsz));}
MD5.base64 = function(s){ return Util.binl2b64(MD5.core(Util.str2binl(s), s.length * Util.chrsz));}
MD5.str = function(s){ return Util.binl2str(MD5.core(Util.str2binl(s), s.length * Util.chrsz));}
MD5.hex_hmac = function(key, data) { return Util.binl2hex(MD5.core_hmac(key, data)); }
MD5.base64_hmac = function(key, data) { return Util.binl2b64(MD5.core_hmac(key, data)); }
MD5.str_hmac = function(key, data) { return Util.binl2str(MD5.core_hmac(key, data)); }

/*
 * Perform a simple self-test to see if the VM is working
 */
MD5.test = function() { return MD5.hex("abc") == "900150983cd24fb0d6963f7d28e17f72"; }

/*
 * Calculate the MD5 of an array of little-endian words, and a bit length
 */
MD5.core = function(x, len) {
  /* append padding */
  x[len >> 5] |= 0x80 << ((len) % 32);
  x[(((len + 64) >>> 9) << 4) + 14] = len;

  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;

  for (var i = 0; i < x.length; i += 16) {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;

    a = MD5.ff(a, b, c, d, x[i+ 0], 7 , -680876936);
    d = MD5.ff(d, a, b, c, x[i+ 1], 12, -389564586);
    c = MD5.ff(c, d, a, b, x[i+ 2], 17,  606105819);
    b = MD5.ff(b, c, d, a, x[i+ 3], 22, -1044525330);
    a = MD5.ff(a, b, c, d, x[i+ 4], 7 , -176418897);
    d = MD5.ff(d, a, b, c, x[i+ 5], 12,  1200080426);
    c = MD5.ff(c, d, a, b, x[i+ 6], 17, -1473231341);
    b = MD5.ff(b, c, d, a, x[i+ 7], 22, -45705983);
    a = MD5.ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
    d = MD5.ff(d, a, b, c, x[i+ 9], 12, -1958414417);
    c = MD5.ff(c, d, a, b, x[i+10], 17, -42063);
    b = MD5.ff(b, c, d, a, x[i+11], 22, -1990404162);
    a = MD5.ff(a, b, c, d, x[i+12], 7 ,  1804603682);
    d = MD5.ff(d, a, b, c, x[i+13], 12, -40341101);
    c = MD5.ff(c, d, a, b, x[i+14], 17, -1502002290);
    b = MD5.ff(b, c, d, a, x[i+15], 22,  1236535329);

    a = MD5.gg(a, b, c, d, x[i+ 1], 5 , -165796510);
    d = MD5.gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
    c = MD5.gg(c, d, a, b, x[i+11], 14,  643717713);
    b = MD5.gg(b, c, d, a, x[i+ 0], 20, -373897302);
    a = MD5.gg(a, b, c, d, x[i+ 5], 5 , -701558691);
    d = MD5.gg(d, a, b, c, x[i+10], 9 ,  38016083);
    c = MD5.gg(c, d, a, b, x[i+15], 14, -660478335);
    b = MD5.gg(b, c, d, a, x[i+ 4], 20, -405537848);
    a = MD5.gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
    d = MD5.gg(d, a, b, c, x[i+14], 9 , -1019803690);
    c = MD5.gg(c, d, a, b, x[i+ 3], 14, -187363961);
    b = MD5.gg(b, c, d, a, x[i+ 8], 20,  1163531501);
    a = MD5.gg(a, b, c, d, x[i+13], 5 , -1444681467);
    d = MD5.gg(d, a, b, c, x[i+ 2], 9 , -51403784);
    c = MD5.gg(c, d, a, b, x[i+ 7], 14,  1735328473);
    b = MD5.gg(b, c, d, a, x[i+12], 20, -1926607734);

    a = MD5.hh(a, b, c, d, x[i+ 5], 4 , -378558);
    d = MD5.hh(d, a, b, c, x[i+ 8], 11, -2022574463);
    c = MD5.hh(c, d, a, b, x[i+11], 16,  1839030562);
    b = MD5.hh(b, c, d, a, x[i+14], 23, -35309556);
    a = MD5.hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
    d = MD5.hh(d, a, b, c, x[i+ 4], 11,  1272893353);
    c = MD5.hh(c, d, a, b, x[i+ 7], 16, -155497632);
    b = MD5.hh(b, c, d, a, x[i+10], 23, -1094730640);
    a = MD5.hh(a, b, c, d, x[i+13], 4 ,  681279174);
    d = MD5.hh(d, a, b, c, x[i+ 0], 11, -358537222);
    c = MD5.hh(c, d, a, b, x[i+ 3], 16, -722521979);
    b = MD5.hh(b, c, d, a, x[i+ 6], 23,  76029189);
    a = MD5.hh(a, b, c, d, x[i+ 9], 4 , -640364487);
    d = MD5.hh(d, a, b, c, x[i+12], 11, -421815835);
    c = MD5.hh(c, d, a, b, x[i+15], 16,  530742520);
    b = MD5.hh(b, c, d, a, x[i+ 2], 23, -995338651);

    a = MD5.ii(a, b, c, d, x[i+ 0], 6 , -198630844);
    d = MD5.ii(d, a, b, c, x[i+ 7], 10,  1126891415);
    c = MD5.ii(c, d, a, b, x[i+14], 15, -1416354905);
    b = MD5.ii(b, c, d, a, x[i+ 5], 21, -57434055);
    a = MD5.ii(a, b, c, d, x[i+12], 6 ,  1700485571);
    d = MD5.ii(d, a, b, c, x[i+ 3], 10, -1894986606);
    c = MD5.ii(c, d, a, b, x[i+10], 15, -1051523);
    b = MD5.ii(b, c, d, a, x[i+ 1], 21, -2054922799);
    a = MD5.ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
    d = MD5.ii(d, a, b, c, x[i+15], 10, -30611744);
    c = MD5.ii(c, d, a, b, x[i+ 6], 15, -1560198380);
    b = MD5.ii(b, c, d, a, x[i+13], 21,  1309151649);
    a = MD5.ii(a, b, c, d, x[i+ 4], 6 , -145523070);
    d = MD5.ii(d, a, b, c, x[i+11], 10, -1120210379);
    c = MD5.ii(c, d, a, b, x[i+ 2], 15,  718787259);
    b = MD5.ii(b, c, d, a, x[i+ 9], 21, -343485551);

    a = Util.safe_add(a, olda);
    b = Util.safe_add(b, oldb);
    c = Util.safe_add(c, oldc);
    d = Util.safe_add(d, oldd);
  }
  return Array(a, b, c, d);

}

/*
 * These functions implement the four basic operations the algorithm uses.
 */
MD5.cmn = function(q, a, b, x, s, t) {
  return Util.safe_add(Util.rol(Util.safe_add(Util.safe_add(a, q), Util.safe_add(x, t)), s),b);
}
MD5.ff = function(a, b, c, d, x, s, t) {
  return MD5.cmn((b & c) | ((~b) & d), a, b, x, s, t);
}
MD5.gg = function(a, b, c, d, x, s, t) {
  return MD5.cmn((b & d) | (c & (~d)), a, b, x, s, t);
}
MD5.hh = function(a, b, c, d, x, s, t) {
  return MD5.cmn(b ^ c ^ d, a, b, x, s, t);
}
MD5.ii = function(a, b, c, d, x, s, t) {
  return MD5.cmn(c ^ (b | (~d)), a, b, x, s, t);
}

/*
 * Calculate the HMAC-MD5, of a key and some data
 */
MD5.core_hmac = function(key, data) {
  var bkey = Util.str2binl(key);
  if(bkey.length > 16) bkey = core_md5(bkey, key.length * Util.chrsz);

  var ipad = Array(16), opad = Array(16);
  for (var i = 0; i < 16; i++) {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }

  var hash = core_md5(ipad.concat(Util.str2binl(data)), 512 + data.length * Util.chrsz);
  return core_md5(opad.concat(hash), 512 + 128);
}
