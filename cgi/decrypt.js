if (typeof benizi === 'undefined') benizi = {};

benizi.decrypt = function(cyphertext, key) {
  var data = new benizi.CBC(key).decrypt(Base64.decode(cyphertext));
  var marker = "//OK\n";
  var success = (data.substr(0, marker.length) === marker);
  return {success:success, data:data};
};
