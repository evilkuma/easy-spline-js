
var canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 500;

document.body.appendChild(canvas);
document.body.style.background = '#000000';
canvas.style.background = 'gray';

var ctx = canvas.getContext('2d');
var layer1 = ctx.layer()

ctx.handle('mousedown', function(e) {
    var pos = [e.layerX, e.layerY];
    var i = layer1.crossSpline(points, pos);
    if(i === false) {
        points.push(pos);
    } else {
        points.splice(i+1, -1, pos)
    }
    draw();
})

var points = [];

function draw() {
    layer1.clearRect(0, 0, canvas.width, canvas.height);
    layer1.beginPath();
    layer1.spline(points);
    layer1.stroke();
}

