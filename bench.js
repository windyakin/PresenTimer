var a = [];
var loopLen = 1000000;
//配列を作るa[0,1,2,3,...loopLen]
for (var i = 0; i <= loopLen; i++) a.push(i);
var aLen = a.length;

//コールバック
var cb = function (item, i) {
    if (item >= loopLen) console.timeEnd('bench');
	};

	console.log('===== Native for =====');
	console.time('bench');
	for (var i = 0; i < aLen; i++) {
	    cb(a[i]);
		};

		console.log('===== Native forin =====');
		console.time('bench');
		for (var i in a) {
		    cb(a[i]);
			}

			console.log('===== Native forEach =====');
			console.time('bench');
			a.forEach(function (item) {
			    cb(item);
				});

				console.log('===== Native forEach 2 =====');
				console.time('bench');
				a.forEach(cb);

