//逐帧动画类
var KeyAnimation = function KeyAnimation(el, type, imgs, options) {
	if (!el || !imgs) {
		throw new Error('el、imgs是必选填参数');
		// return false;
	}
	if (type !== 'array' && type !== 'sprite') {
		throw new Error('只支持"array"和"sprite"模式');
		// return false;
	}
	// let that = this;
	var imgsLen = null;
	var canvas = null;
	var count = 0;
	var ctx = null;
	var timeMac = null;
	var state = 'stop';
	// 用投机取巧的做法试试，这个值基本代表了无限
	var infinite = 1000000000;
	var plusNum = null;
	var plusCount = 0;
	var ispause = false;

	// 会有'array'和'sprite'模式
	var mode = type;

	// 默认参数
	var defOpt = {
		cover: 0,
		fps: 24,
		loop: 'infinite',
		resolution: 2
	};
	// 初始化可选参数
	options = options || defOpt;
	options.cover = options.cover || defOpt.cover;
	options.fps = options.fps || defOpt.fps;
	options.loop = options.loop || defOpt.loop;
	// 图片分辨比例，与@2x的概念相似，只有sprite需要该选项，默认为2
	options.resolution = options.resolution || defOpt.resolution;

	// 记录上一次播放行为
	var recordFrom = 0;
	var recordTo = null;
	var recordInf = options.loop;

	var createCanvas = function createCanvas() {
		canvas = $('<canvas>').get(0);
		ctx = canvas.getContext('2d');
		canvas.width = options.width * 2 || el.width() * 2;
		canvas.height = options.height * 2 || el.height() * 2;
		canvas.style.display = 'block';
		//canvas.style.width = '100%';
		canvas.style.height = '100%';
		el.append(canvas);
	};

	// drawImg
	var drawImg = function drawImg(n) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		if (mode === 'array') {
			// 先判断图片有没有宽度，如果没有，一般是图片没有加载下来
			try{
				if (imgs[n].width !== 0) {
					ctx.drawImage(imgs[n], 0, 0, canvas.width, canvas.height);
				};	
			}catch(e){}
			
		} else if (mode === 'sprite') {
			var imgWidth = imgs.width / imgsLen;
			ctx.drawImage(imgs, imgWidth * n, 0, imgWidth, imgs.height, 0, 0, canvas.width, canvas.height);
		} else {
			//console.log('没有匹配模式');
		}
	};

	var showCover = function showCover() {
		drawImg(options.cover);
	};

	var init = function init() {
		createCanvas();

		if (mode === 'array') {
			imgsLen = imgs.length;
		} else {
			// 计算出有多少张雪碧图
			imgsLen = Math.round(2 * imgs.width / (canvas.width * options.resolution));
		}
		//console.log('current mode is:' + mode);
		recordTo = imgsLen - 1;

		showCover();
	};

	// API list

	this.goto = function (n) {
		drawImg(n);
		count = n;
	};

	this.next = function () {
		var n = (count + 1 + imgsLen - 1) % (imgsLen - 1);
		this.goto(n);
	};

	this.prev = function () {
		var n = (count - 1 + imgsLen - 1) % (imgsLen - 1);
		this.goto(n);
	};

	this.fromTo = function (from, to, loop, callback) {
		// 每次调用前先清理上次未执行完的动画
		clearInterval(timeMac);

		var that = this;
		var keyCount = from;
		var timeFn = function timeFn() {
			if (ispause) {
				return;
			}
			if (plusNum <= plusCount) {
				clearInterval(timeMac);
				timeMac = null;
				plusCount = 0;
				plusNum = 0;
				state = 'stop';
				callback && callback();
				return;
			} else {
				if (keyCount > to) {
					keyCount = from;
				};
				that.goto(keyCount);
				// 帧计数器
				keyCount++;
				// 总量计数器
				plusCount++;
			}
			// 播放进度回调
			that.playBack && that.playBack(keyCount - 1);
		};
		plusCount = 0;
		state = 'play';
		loop = !loop || loop === 'infinite' ? infinite : loop;
		// 总量
		plusNum = (to - from + 1) * loop;
		ispause = false;

		// 做一下记录
		recordFrom = from;
		recordTo = to;
		recordInf = loop;

		timeFn();
		timeMac = setInterval(timeFn, 1000 / options.fps);
	};

	// 倒着播，特殊运用
	this.toFrom = function (to, from, loop, callback) {
		// 每次调用前先清理上次未执行完的动画
		clearInterval(timeMac);

		var that = this;
		var keyCount = to;
		var timeFn = function timeFn() {
			if (ispause) {
				return;
			}
			if (plusNum <= plusCount) {
				clearInterval(timeMac);
				timeMac = null;
				plusCount = 0;
				plusNum = 0;
				state = 'stop';
				callback && callback();
				return;
			} else {
				if (keyCount < from) {
					keyCount = to;
				}
				that.goto(keyCount);
				// 帧计数器
				keyCount--;
				// 总量计数器
				plusCount++;
			}
			// 播放进度回调
			that.playBack && that.playBack(keyCount / imgsLen);
		};

		plusCount = 0;
		state = 'play';
		loop = !loop || loop === 'infinite' ? infinite : loop;
		// 总量
		plusNum = (to - from + 1) * loop;
		ispause = false;

		// 做一下记录
		recordFrom = from;
		recordTo = to;
		recordInf = loop;

		timeFn();
		timeMac = setInterval(timeFn, 1000 / options.fps);
	};

	this.repeatplay = function (from, to, loop, callback) {
		var that = this;
		var count = 0;

		loop = !loop || loop === 'infinite' ? infinite : loop;

		var toBack = function toBack() {
			count++;
			if (count === loop) {
				callback && callback();
			} else {
				that.fromTo(from, to, 1, fromBack);
			}
		};

		var fromBack = function fromBack() {
			that.toFrom(to, from, 1, toBack);
		};

		this.fromTo(from, to, 1, fromBack);
	};

	this.from = function (from, loop, callback) {
		var to = imgsLen - 1;
		this.fromTo(from, to, loop, callback);
	};

	this.to = function (to, loop, callback) {
		var from = 0;
		this.fromTo(from, to, loop, callback);
	};

	this.pause = function () {
		ispause = true;
		state = 'stop';
	};

	this.play = function (callback) {
		if (state === 'play') {
			return;
		}
		if (!ispause) {
			this.fromTo(recordFrom, recordTo, recordInf, callback);
		} else {
			ispause = false;
		}
	};

	this.stop = function () {
		clearInterval(timeMac);
		state = 'stop';
		plusNum = null;
		plusCount = 0;
		ispause = false;

		// 重置纪录
		recordFrom = 0;
		recordTo = imgsLen - 1;
		recordInf = options.loop;

		drawImg(options.cover);
	};

	this.getState = function () {
		return state;
	};

	this.getLen = function () {
		return imgsLen;
	};

	this.destroy = function () {
		clearInterval(timeMac);
		timeMac = null;
		ctx = null;
		$(canvas).remove();
		canvas = null;

		for (var key in this) {
			delete this[key];
		}
	};

	init();
};