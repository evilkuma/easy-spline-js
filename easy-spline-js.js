
CanvasRenderingContext2D.prototype.cub_spline = ({
	canvas: null,
	splines: [],

	down: false,
	selected: false,
	selected_line: false,

	strong_matrix: [
		[1, 0, 0],
		[-3, 4, -1],
		[2, -4, 2]
	],
	mul_to_strong: function(m) {
		var res = [0,0,0];
		for(var i in res) {
			for(var j in this.strong_matrix) {
				res[i] += this.strong_matrix[i][j]*m[j];
			}
		}
		return res;
	},
	build: function(points, start, end) {
		var x_m = [];
		var y_m = [];

		for(var i in points) {
			x_m.push(points[i][0]);
			y_m.push(points[i][1]);
		}

		var x_p = this.mul_to_strong(x_m);
		var y_p = this.mul_to_strong(y_m);

		var calc = i => {
			var x = x_p[0] + x_p[1]*i + x_p[2]*i*i;
			var y = y_p[0] + y_p[1]*i + y_p[2]*i*i;
			return [x, y];
		}

		var step = 0.01;
		var i = start;

		return {
			i: i,
			_start: start,
			_end: end,
			get start() {
				return this._start
			},
			set start(val) {
				this._start = val;
				if(this.i !== val) {
					this.i = val;
				}
			},
			get end() {
				return this._end;
			},
			set end(val) {
				this._end = val;
				this.start = this._start; // use start setter
			},
			next() {
				if(this.i === this.start) {
					this.i += step;
					return calc(this.start);
				}
				for(;this.i <= this.end + step;) {
					this.i += step;
					return calc(this.i);
				}
				return false;
			}
		}
		// function(ctx) {
		// 	ctx.moveTo(pos[0], pos[1]);		
		// 	i += step;
		// 	for(;i <= end + step; i += step) {
		// 		pos = calc(i);
		// 		ctx.lineTo(pos[0], pos[1]);
		// 	}
		// }
	},
	cross: function(keys, start, end, pos) {
		var x_m = [];
		var y_m = [];

		for(var i in keys) {
			x_m.push(keys[i][0]);
			y_m.push(keys[i][1]);
		}

		var x_p = mul_to_strong(x_m);
		var y_p = mul_to_strong(y_m);

		var calc = i => {
			var x = x_p[0] + x_p[1]*i + x_p[2]*i*i;
			var y = y_p[0] + y_p[1]*i + y_p[2]*i*i;
			return [x, y];
		}

		var step = 0.01;
		i = start + step;
		for(;i <= end + step; i += step) {
			var posi = calc(i);
			if(pos[0] > posi[0] - 5 && pos[0] < posi[0] + 5 && pos[1] > posi[1] - 5 && pos[1] < posi[1] + 5) {
				return true;
			}
		}
		return false;
	},

	mousedown: function(e) {
		var pos = [e.layerX, e.layerY];
		if(e.button === 0 && this.selected_line === false) {
			this.down = true;
			if(!this.selected) {
				//points.push([e.layerX, e.layerY]);
				//draw();
			}

			this.splines[0].add(pos[0], pos[1])
		} else if(e.button == 2 && this.selected_line !== false) {
			this.down = false;
			//points.splice(selected_line+1, -1, pos);
			//draw();
		}
	},
	mousemove: function(e) {
		var pos = [e.layerX, e.layerY];
		if(this.down && this.selected) {
			canvas.style.cursor = 'grabbing';
			this.selected[0] = pos[0];
			this.selected[1] = pos[1];
			// draw();
		} else {
			// for(var i in points) {
			// 	var posi = points[i];
			// 	if(pos[0] > posi[0] - 6 && pos[0] < posi[0] + 6 && pos[1] > posi[1] - 6 && pos[1] < posi[1] + 6) {
			// 		selected = points[i];
			// 		canvas.style.cursor = 'grab';
			// 		if(selected_line) {
			// 			selected_line = false;
			// 			draw();
			// 		}
			// 		return;
			// 	}
			// 	canvas.style.cursor = 'default';
			// 	selected = false;
			// }
			// if(points.length > 2) {
			// 	for(var i = 0; i < points.length - 3; i++) {
			// 		if(crossSpline([points[i], points[i+1], points[i+2]], 0, 0.5, pos)) {
			// 			selected_line = i;
			// 			draw();
			// 			return;
			// 		}
			// 	}
			// 	if(crossSpline([points[i], points[i+1], points[i+2]], 0, 0.5, pos)) {
			// 		selected_line = i;
			// 		draw();
			// 		return;
			// 	}
			// 	if(crossSpline([points[i], points[i+1], points[i+2]], 0.5, 1, pos)) {
			// 		selected_line = i+1;
			// 		draw();
			// 		return;
			// 	}
			// 	if(selected_line !== false) {
			// 		selected_line = false;
			// 		draw();
			// 	}
			// }
		}
	},
	mouseup: function(e) {
		this.down = false;
		this.selected = false;
	},
	initEvents: function(canvas) {
		canvas.oncontextmenu = e => { e.preventDefault(); };
		canvas.addEventListener('mousedown', this.mousedown.bind(this), false);
		canvas.addEventListener('mousemove', this.mousemove.bind(this), false);
		canvas.addEventListener('mouseup',   this.mouseup.bind(this),   false);
	},

	Spline: function(controller) {
		this.points = [];
		this.ctx = null;
		this.draw = function() {
			this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
			this.ctx.lineWidth = 3;
			this.ctx.strokeStyle = "blue";
			var clear = 0;
			for(var i = 0; i < this.points.length - 3; i++) {
				this.ctx.beginPath();
				var sp = controller.build([
					this.points[i], 
					this.points[i+1], 
					this.points[i+2]
				], 0, 0.5);
				var pos = sp.next();
				this.ctx.moveTo(pos[0], pos[1]);
				while(pos = sp.next()) {
					this.ctx.lineTo(pos[0], pos[1]);
				}
				this.ctx.stroke();
			}
			for(var j = this.points.length; j < 3; j++) {
				if(j > 0) {
					this.points.push(this.points[j-1])
				}else{
					this.points.push([0,0])
				}
				clear++;
			}
			this.ctx.beginPath();
			var sp = controller.build([
				this.points[i], 
				this.points[i+1], 
				this.points[i+2]
			], 0, 0.5);
			var pos = sp.next();
			this.ctx.moveTo(pos[0], pos[1]);
			while(pos = sp.next()) {
				this.ctx.lineTo(pos[0], pos[1]);
			}
			this.ctx.stroke();
			this.ctx.beginPath();
			sp.start = 0.5;
			sp.end = 1;
			var pos = sp.next();
			this.ctx.moveTo(pos[0], pos[1]);
			while(pos = sp.next()) {
				this.ctx.lineTo(pos[0], pos[1]);
			}
			this.ctx.stroke();
			for(var i = 0; i < clear; i++) {
				this.points.splice(this.points.length - clear, 1);
			}

			for(var k in this.points) {
				this.ctx.beginPath();
				this.ctx.arc(this.points[k][0], this.points[k][1], 5, 0, Math.PI * 2);
				this.ctx.fill();
			}
		};
		this.add = function(x, y) {
			this.points.push([x, y]);
			this.draw();
		};

		// constructor
		(function() {
			var canvas = document.createElement('canvas');
			controller.initEvents(canvas);
			canvas.width = controller.canvas.width;
			canvas.height = controller.canvas.height;
			canvas.style.position = 'absolute';
			canvas.style.left = controller.canvas.clientLeft + 'px';
			canvas.style.top = controller.canvas.clientTop + 'px';
			controller.canvas.parentNode.style.position = 'relative';
			if(controller.canvas.nextSibling) {
				controller.canvas.parentNode.insertBefore(canvas, controller.canvas.nextSibling);
			} else {
				controller.canvas.parentNode.appendChild(canvas);
			}
			this.ctx = canvas.getContext('2d');
			this.draw();
		}).bind(this)()
	},

	create() {
		if(!this.canvas) {
			console.error('please init with context 2d');
			return;
		}

		return this.splines[this.splines.push(new this.Spline(this))];
	},

	init: function(ctx) {
		this.canvas = ctx.canvas;
		// this.initEvents();
	}
})
