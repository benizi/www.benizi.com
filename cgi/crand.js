if (typeof benizi === 'undefined') benizi = {};

var DEBUGGING = false;
var bigint = goog.math.Long;
var copyLong = function(aLong) {
  return new goog.math.Long(aLong.getLowBits(), aLong.getHighBits());
};
var copyArray = function(arr) { return [].concat(arr); };
var INIT_A = bigint.fromString('0x5deece66d', 16);
var INIT_C = bigint.fromString('0xb', 16);
var MASK32 = bigint.fromString('0xffffffff', 16);
var MASK20 = bigint.fromString('0xfffff', 16);
var MASK16 = bigint.fromString('0xffff', 16);
var MASK11 = bigint.fromString('0x7ff', 16);
var MASK8 = bigint.fromString('0xff', 16);
var MASK7 = bigint.fromString('0x7f', 16);
var MASK4 = bigint.fromString('0xf', 16);
var IEEE754_DOUBLE_BIAS = 0x3ff;

var drand48_data = function(xsubi) {
  this.__x = [bigint.fromInt(0),bigint.fromInt(0),bigint.fromInt(0)];
  this.__old_x = [bigint.fromInt(0),bigint.fromInt(0),bigint.fromInt(0)];
  this.__a = copyLong(INIT_A);
  this.__c = copyLong(INIT_C);
  if (xsubi) {
    for (var i = 0; i < xsubi.length; i++) {
      this.__x[i] = copyLong(xsubi[i]);
    }
  }
  return this;
};

drand48_data.prototype.dump = function(group) {
  if (group) console.group(group);
  for (var i = 0; i < 3; i++) {
    console.log('__x[' + i + '] = ' + this.__x[i].toString(16));
  }
  console.log('__a    = ' + this.__a.toString(16));
  console.log('__c    = ' + this.__c.toString(16));
  if (group) console.groupEnd();
};

var long_from_seed = function(seed) {
  if (typeof seed === 'string') {
    return bigint.fromString(seed, seed.match(/^0x/) ? 16 : null);
  }
  return copyLong(seed);
};

var srand48_r = function(seed) {
  var seedlong = long_from_seed(seed);
  seedlong = seedlong.and(MASK32);
  var buffer = new drand48_data;
  buffer.__x[2] = seedlong.shiftRight(16);
  buffer.__x[1] = seedlong.and(MASK32);
  buffer.__x[0] = bigint.fromString('0x330e', 16);
  return buffer;
};

var seed48_r = function(seed, oldbuffer) {
  var buffer = new drand48_data;
  if (oldbuffer) {
    for (var i = 0; i < 3; i++) {
      buffer.__old_x[i] = oldbuffer.__x[i];
    }
  }
  var seedlong = long_from_seed(seed);
  for (var i = 0; i < 3; i++) {
    buffer.__x[i] = seedlong.shiftRightUnsigned(8 * i).and(0xff);
  }
  buffer.__a = copyLong(INIT_A);
  buffer.__c = copyLong(INIT_C);
  return buffer;
};

bigint.prototype.asFloat = function() {
  var low = this.getLowBits();
  var high = this.getHighBits();
  var ab = new ArrayBuffer(8);
  var dv = new DataView(ab);
  dv.setUint32(0, high);
  dv.setUint32(1, low);
  return dv.getFloat64(0);
};

var isBigEndian = function() {
  var ab = new ArrayBuffer(4);
  var uc = new Uint8Array(ab);
  var ui = new Uint32Array(ab);
  uc[0] = 0x01;
  uc[1] = 0x02;
  uc[2] = 0x03;
  uc[3] = 0x04;
  return ui[0] == 0x01020304;
};

var byteSwap = function(n) {
  var ab = new ArrayBuffer(4);
  var chars = new Uint8Array(ab);
  var ints = new Uint32Array(ab);
  ints[0] = n;
  for (var i = 0; i < 2; i++) {
    var t = chars[i];
    chars[i] = chars[3-i];
    chars[3-i] = t;
  }
  return ints[0];
};

var newDouble = function(negative, exponent, mantissa0, mantissa1) {
  var ab = new ArrayBuffer(8);
  var chars = new Uint8Array(ab);
  var ints = new Uint32Array(ab);
  if (isBigEndian()) {
    // big endian: neg:1 exp:11 m0:20 m1:32
    debugger
  } else {
    // lil endian: m1:32
    ints[0] = mantissa1.and(MASK32).toInt();
    // m0:20 exp:11 neg:1
    chars[4] = /* [mmmmmmmm:0-7] */
      mantissa0.and(MASK8).toInt();
    chars[5] = /* [mmmmmmmm:8-15] */
      mantissa0.shiftRight(8).and(MASK8).toInt();
    chars[6] = /* [eeee:0-3] [mmmm:16-19] */
      exponent.and(MASK4).shiftLeft(4).add(
          mantissa0.shiftRight(16).and(MASK4)).toInt();
    chars[7] = /* [n:0] [eeeeeee:4-10] */
      negative.shiftLeft(7).add(
          exponent.shiftRight(4).and(MASK7)).toInt();
  }
  var da = new Float64Array(ab);

  if (DEBUGGING) {
  var args = [negative, exponent, mantissa0, mantissa1];
  var strings = args.map(function(x) { return x.toString() });
  console.group('newDouble(' + strings.join(', ') + ')');
  console.log('' + da[0] + ' = neg:' + negative.toInt() +
      ' exp:' + exponent.toInt().toString(16) +
      ' mantissa0:' + mantissa0.toInt().toString(16) +
      ' mantissa1:' + mantissa1.toInt().toString(16));
  console.log('ints[0] = ' + ints[0].toString(16) +
      ' ints[1] = ' + ints[1].toString(16));
  console.log([0,1,2,3,4,5,6,7].map(function(i) {
        var h = chars[i].toString(16);
        if (h.length < 2) h = '0' + h;
        return h;
        }).join(""));
  console.groupEnd();
  }

  return da[0];
}

var __erand48_r = function(oldxsubi, buffer) {
  var state = __drand48_iterate(oldxsubi, buffer);
  var xsubi = state.xsubi;
  var negative = bigint.fromInt(0);
  var exponent = bigint.fromInt(IEEE754_DOUBLE_BIAS);
  var mantissa0 = xsubi[2].shiftLeft(4).or(xsubi[1].shiftRight(12)).and(MASK20);
  var mantissa1 = xsubi[1].and(MASK16).shiftLeft(20).or(xsubi[0].shiftLeft(4));

  var dbl = newDouble(negative, exponent, mantissa0, mantissa1);

  return {
    buffer: new drand48_data(state.xsubi),
    state:state,
    exponent:exponent,
    mantissa0:mantissa0,
    mantissa1:mantissa1,
    dbl:dbl,
    result: dbl - 1.0
  };
};

var __drand48_iterate = function(xsubi, buffer) {
  var X;
  var result;
  X = xsubi[2].shiftLeft(32).or(xsubi[1].shiftLeft(16)).or(xsubi[0]);
  result = X.multiply(buffer.__a).add(buffer.__c);
  var outxsubi = [];
  outxsubi[0] = result.and(MASK16);
  outxsubi[1] = result.shiftRight(16).and(MASK16);
  outxsubi[2] = result.shiftRight(32).and(MASK16);
  var newbuf = new drand48_data(outxsubi);
  return {xsubi:outxsubi, buffer:newbuf, result:result};
};

var drand48_r = function(buffer) {
  var e = __erand48_r(buffer.__x, buffer);
  return {e:e, buffer: e.buffer, result: e.result};
};

var _buf;
benizi.srand = function(n) {
  if (n === null) n = (new Date).getValue();
  _buf = srand48_r(n.toString());
};
benizi.rand = function() {
  if (!_buf) benizi.srand();
  var data = drand48_r(_buf);
  _buf = data.buffer;
  return data.result;
};

if (DEBUGGING) {
benizi.srand(0);
for (var i = 0; i < 10; i++) {
  console.log(rand());
}
buf = srand48_r('0');
d = drand48_r(buf);
e = drand48_r(buf);
console.log(d.result);
console.log(e.result);
}

benizi.crypt = function(key, salt) {
  return 'TODO';
};
