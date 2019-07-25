/* 解码 */
function decodePolygon(coordinate, encodeOffsets) {
	var result = [];
	var prevX = encodeOffsets[0];
	var prevY = encodeOffsets[1];

	for (var i = 0; i < coordinate.length; i += 2) {
		var x = coordinate.charCodeAt(i) - 64;
		var y = coordinate.charCodeAt(i + 1) - 64;
		// ZigZag decoding
		x = (x >> 1) ^ (-(x & 1));
		y = (y >> 1) ^ (-(y & 1));
		// Delta deocding
		x += prevX;
		y += prevY;

		prevX = x;
		prevY = y;
		// Dequantize
		result.push([x / 1024, y / 1024]);
	}
	return result;
}
/* 压缩 */
// function encodePolygon(coordinate) {
// 	var prevX = 0,
// 		prevY = 0;
// 	var coorstr = "";
// 	var encodeOffsets = [];
// 	var result = {
// 		'coordinate': coorstr,
// 		'encodeOffsets': encodeOffsets
// 	};
// 	for (var i = coordinate.length - 1; i > 0; i--) {
// 		var x = coordinate[i][0];
// 		var y = coordinate[i][1];
// 		x = x * 1024;
// 		y = y * 1024;
// 		x -= coordinate[i - 1][0] * 1024;
// 		y -= coordinate[i - 1][1] * 1024;
// 		x = (x << 1) ^ (x >> 31);
// 		y = (y << 1) ^ (y >> 31);
// 		coorstr = String.fromCharCode(x + 64) + String.fromCharCode(y + 64) + coorstr;
// 	}
// 	result.coordinate = "@@" + coorstr;
// 	result.encodeOffsets = [coordinate[0][0] * 1024, coordinate[0][1] * 1024]
// 	return result;
// 
// }

function encodePolygon(coordinate, encodeOffsets) {
  var result = '';
  var prevX = quantize(coordinate[0][0]);
  var prevY = quantize(coordinate[0][1]);
  // Store the origin offset
  encodeOffsets[0] = prevX;
  encodeOffsets[1] = prevY;
  for (var i = 0; i < coordinate.length; i++) {
    var point = coordinate[i];
    result+=encode(point[0], prevX);
    result+=encode(point[1], prevY);
    prevX = quantize(point[0]);
    prevY = quantize(point[1]);
  }
  return result;
}
function encode(val, prev){
  // Quantization
  val = quantize(val);
  // var tmp = val;
  // Delta
  val = val - prev;
  if (((val << 1) ^ (val >> 15)) + 64 === 8232) {
    //WTF, 8232 will get syntax error in js code
    val--;
  }
  // ZigZag
  val = (val << 1) ^ (val >> 15);
  // add offset and get unicode
  return String.fromCharCode(val+64);
  // var tmp = {'tmp' : str};
  // try{
  //   eval("(" + JSON.stringify(tmp) + ")");
  // }catch(e) {
  //   console.log(val + 64);
  // }
}
function quantize(val) {
  return Math.ceil(val * 1024);
}
