var Base64 = {};
Base64.chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
Base64.encode = function(input) {
 var r = '';
 for (var j=0; j<input.length; j+=3) {
  var str = input.substring(j,j+3);
  var q = new Array(4);
  var s = new Array(3);
  for (var i=0; i<3; i++) { s[i] = (str.length > i) ? str.charCodeAt(i) : 0; }
  q[0] = s[0] >> 2;
  q[1] = ((s[0] & 3) << 4) + (s[1] >> 4);
  q[2] = ((s[1] & 15) << 2) + (s[2] >> 6);
  q[3] = s[2] & 63;
  for (var i=1; i<3; i++) { if (str.length < i+1) { q[i+1] = 64; } }
  for (var i=0; i<4; i++) { r+=Base64.chars.charAt(q[i]); }
 }
 r += ['','===','==','='][r.length % 4];
 return r;
}
Base64.decode = function(input) {
 var r = '';
 var onlyb64 = '';
 for (var j=0; j<input.length; j++) {
  var c = input.charAt(j);
  if (Base64.chars.indexOf(c) < 0) continue;
  onlyb64 += c;
 }
 for (var j=0; j<onlyb64.length; j+=4) {
  var str = onlyb64.substring(j,j+4);
  var q = new Array(4);
  var s = new Array(3);
  for (var i=0; i<4; i++) { q[i] = Base64.chars.indexOf(str.charAt(i)); }
  for (var i=0; i<4; i++) { if (str.length < i) { q[i] = 0; } }
  s[0] = (q[0]        << 2) + ((q[1] >> 4) & 3);
  s[1] = ((q[1] & 15) << 4) + ((q[2] >> 2) & 15);
  s[2] = ((q[2] & 3 ) << 6) + q[3];
  for (var i=0; i<3 && i+j<onlyb64.length-1; i++) { r += String.fromCharCode(s[i]); }
 }
 return r;
}
Base64.contains_only_chars = function(str) {
 var i;
 for (i=0; i<str.length; i++) {
  var c = str.charAt(i);
  var v = str.charCodeAt(i);
  if (v > 127 || v < 32) {
   alert("bad character ("+c+") in input\n");
   return false;
  }
 }
 return true;
}
Base64.from_hex = function(str) {
 var r = '';
 str = str.toLowerCase();
 for (var i=0; i<str.length/2; i++) {
  var v = 0;
  v += parseInt(str.charAt(i*2), 16);
  v <<= 4;
  v += parseInt(str.charAt(i*2 + 1), 16);
  r += String.fromCharCode(v);
 }
 return Base64.encode(r);
}
