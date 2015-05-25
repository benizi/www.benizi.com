/* Utility functions common to SHA1, MD5, and Blowfish .js */
var Util = {};
Util.hex_uppercase = 0;  /* hex output format. 0 - lowercase; 1 - uppercase */
Util.b64pad  = "="; /* base-64 pad character. "=" for strict RFC compliance */
Util.chrsz = 8; /* bits per input character. 8 - ASCII; 16 - Unicode - TODO - proper UTF-8 */

/* Convert an 8-bit or 16-bit string to an array of big-endian words
 * In 8-bit function, characters >255 have their hi-byte silently ignored.
 */
Util.str2binb = function(str) {
  var bin = Array();
  var mask = (1 << Util.chrsz) - 1;
  for (var i = 0; i < str.length * Util.chrsz; i += Util.chrsz)
    bin[i>>5] |= (str.charCodeAt(i / Util.chrsz) & mask) << (32 - Util.chrsz - i%32);
  return bin;
}

/*
 * Convert an array of big-endian words to a string
 */
Util.binb2str = function(bin) {
  var str = "";
  var mask = (1 << Util.chrsz) - 1;
  for (var i = 0; i < bin.length * 32; i += Util.chrsz)
    str += String.fromCharCode((bin[i>>5] >>> (32 - Util.chrsz - i%32)) & mask);
  return str;
}

/*
 * Convert an array of big-endian words to a hex string.
 */
Util.binb2hex = function(binarray) {
  var hex_tab = Util.hex_uppercase ? "0123456789ABCDEF" : "0123456789abcdef";
  var str = "";
  for (var i = 0; i < binarray.length * 4; i++) {
    str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
           hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
  }
  return str;
}

/*
 * Convert an array of big-endian words to a base-64 string
 */
Util.binb2b64 = function(binarray) {
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var str = "";
  for (var i = 0; i < binarray.length * 4; i += 3) {
    var triplet = (((binarray[i   >> 2] >> 8 * (3 -  i   %4)) & 0xFF) << 16)
                | (((binarray[i+1 >> 2] >> 8 * (3 - (i+1)%4)) & 0xFF) << 8 )
                |  ((binarray[i+2 >> 2] >> 8 * (3 - (i+2)%4)) & 0xFF);
    for (var j = 0; j < 4; j++) {
      if(i * 8 + j * 6 > binarray.length * 32) str += Util.b64pad;
      else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
    }
  }
  return str;
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
Util.safe_add = function(x, y) {
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
Util.rol = function(num, cnt) {
  return (num << cnt) | (num >>> (32 - cnt));
}

/*
 * Convert a string to an array of little-endian words
 * If chrsz is ASCII, characters >255 have their hi-byte silently ignored.
 */
Util.str2binl = function(str) {
  var bin = Array();
  var mask = (1 << Util.chrsz) - 1;
  for (var i = 0; i < str.length * Util.chrsz; i += Util.chrsz)
    bin[i>>5] |= (str.charCodeAt(i / Util.chrsz) & mask) << (i%32);
  return bin;
}

/*
 * Convert an array of little-endian words to a string
 */
Util.binl2str = function(bin) {
  var str = "";
  var mask = (1 << Util.chrsz) - 1;
  for (var i = 0; i < bin.length * 32; i += Util.chrsz)
    str += String.fromCharCode((bin[i>>5] >>> (i % 32)) & mask);
  return str;
}

/*
 * Convert an array of little-endian words to a hex string.
 */
Util.binl2hex = function(binarray) {
  var hex_tab = Util.hex_uppercase ? "0123456789ABCDEF" : "0123456789abcdef";
  var str = "";
  for (var i = 0; i < binarray.length * 4; i++) {
    str += hex_tab.charAt((binarray[i>>2] >> ((i%4)*8+4)) & 0xF) +
           hex_tab.charAt((binarray[i>>2] >> ((i%4)*8  )) & 0xF);
  }
  return str;
}

/*
 * Convert an array of little-endian words to a base-64 string
 */
Util.binl2b64 = function(binarray) {
  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var str = "";
  for (var i = 0; i < binarray.length * 4; i += 3) {
    var triplet = (((binarray[i   >> 2] >> 8 * ( i   %4)) & 0xFF) << 16)
                | (((binarray[i+1 >> 2] >> 8 * ((i+1)%4)) & 0xFF) << 8 )
                |  ((binarray[i+2 >> 2] >> 8 * ((i+2)%4)) & 0xFF);
    for (var j = 0; j < 4; j++) {
      if(i * 8 + j * 6 > binarray.length * 32) str += Util.b64pad;
      else str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);
    }
  }
  return str;
}
