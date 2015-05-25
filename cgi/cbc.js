// by Benjamin R. Haskell <perl@benizi.com>
// based on Wikipedia diagram. lol. seriously.

// only available block cipher is Blowfish (from blowfish.js in this directory)

var nullPadded = function(text, len) {
  var out = text;
  while (out < len) out += '\0';
  return out;
};

var blockPad = function(text, blocksize) {
  var out = text;
  var need = blocksize - (out.length % blocksize);
  var chr = String.fromCharCode(need);
  for (var i = 0; i < need; i++) out += chr;
  return out;
};

var blockUnpad = function(text) {
  return text.substr(0, text.length - text.charCodeAt(text.length - 1));
};

//TODO var
hex = function (str, repr) {
  return str.split(/(?:)/).map(function(c) {
    var h = c.charCodeAt(0).toString(16);
    if (h.length == 1) h = '0' + h;
    if (repr) h = "\\x" + h;
    return h;
  }).join(repr ? '' : ' ');
}

var CBC = function(key, iv) {
  this.blocksize = 8;
  this.keysize = 16; // for OpenSSL compatibility
  this.key = key || '';
  this.iv = iv || '';
  return this;
};

var openssl_salt = function(sizes, key, salt) {
  var expanded = {};
  var hash = '';
  var salty = '';
  while (salty.length < sizes.keysize + sizes.blocksize) {
    hash = MD5.str(hash + key + salt);
    salty += hash;
  }
  return {
    key: salty.substr(0, sizes.keysize),
    iv: salty.substr(sizes.keysize, sizes.blocksize)
  };
};

CBC.prototype.encrypt = function(plaintext, salt) {
  var plaintext = blockPad(plaintext, this.blocksize);
  var ciphertext = '';

  var key = nullPadded(this.key, this.keysize);
  var iv = nullPadded(this.iv, this.blocksize);

  var salt = salt || '';
  if (!salt.length) {
    for (var i = 0; i < 8; i++) {
      salt += String.fromCharCode(Math.floor(256 * Math.random()));
    }
  }

  this.openssl = openssl_salt(this, key, salt);
  this.salt = salt;
  key = this.openssl.key;
  iv = this.openssl.iv;
  ciphertext = 'Salted__' + salt;

  var cipher = new Blowfish(key);
  while (plaintext.length) {
    var block = plaintext.substr(0, this.blocksize);
    var xored = '';
    for (var i = 0; i < this.blocksize; i++) {
      xored += String.fromCharCode(block.charCodeAt(i) ^ iv.charCodeAt(i));
    }
    var encrypted = cipher.encrypt(xored);
    ciphertext += encrypted;
    iv = encrypted;
    plaintext = plaintext.substr(this.blocksize);
  }

  return ciphertext;
};

CBC.prototype.decrypt = function(ciphertext) {
  var key = nullPadded(this.key, this.keysize);
  var iv = nullPadded(this.iv, this.blocksize)

  if (ciphertext.length > 16 && ciphertext.substr(0, 8) === 'Salted__') {
    this.salt = ciphertext.substr(8, 8);
    ciphertext = ciphertext.substr(16);
    this.openssl = openssl_salt(this, this.key, this.salt);
    key = this.openssl.key;
    iv = this.openssl.iv;
  }

  var cipher = new Blowfish(key);
  var plaintext = '';
  while (ciphertext.length) {
    var block = ciphertext.substr(0, this.blocksize);
    var decrypted = cipher.decrypt(block);
    for (var i = 0; i < this.blocksize; i++) {
      plaintext += String.fromCharCode(decrypted.charCodeAt(i) ^ iv.charCodeAt(i));
    }
    ciphertext = ciphertext.substr(this.blocksize);
    iv = block;
  }
  return blockUnpad(plaintext, this.blocksize);
};

if (typeof benizi === 'undefined') benizi = {};
benizi.CBC = CBC;
