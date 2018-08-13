
var canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 500;

document.body.appendChild(canvas);
document.body.style.background = '#000000';
canvas.style.background = 'gray';

var ctx = canvas.getContext('2d');
ctx.cub_spline.init(ctx)

var spline = ctx.cub_spline.create()