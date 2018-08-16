
var canvas = document.createElement('canvas');
canvas.width = 800;
canvas.height = 500;

document.body.appendChild(canvas);
document.body.style.background = '#000000';
canvas.style.background = 'gray';

var ctx = canvas.getContext('2d');
var selected = false;
var selected_point = false;
var layers = [];
var points = [];

var table = document.createElement('table');
var tr    = document.createElement('tr');
table.appendChild(tr);
document.body.appendChild(table);

var addSpline = document.createElement('button');
addSpline.innerText = 'add';
tr.appendChild(addSpline);

addSpline.onclick = function(e) {
    var s = document.createElement('tr');
    s.innerText = 'Spline #' + table.children.length;
    table.appendChild(s);
    layers.push(ctx.layer());
    points.push([]);

    s.onclick = function(e1) {
        for(var i = 0; i < table.children.length; i++) {
            table.children[i].classList.remove('selected');
            if(table.children[i] === this) {
                selected = i-1;
            }
        }
        this.classList.add('selected');
    }
};

function crossPoints(point1, point2) {
    return point1[0] > point2[0] - 5 && point1[0] < point2[0] + 5 && 
            point1[1] > point2[1] - 5 && point1[1] < point2[1] + 5
}

ctx.handle('mousedown', function(e) {
    if(selected === false) {
        return;
    }
    var pos = [e.layerX, e.layerY];
    for(var i in points[selected]) {
        if(crossPoints(pos, points[selected][i])) {
            selected_point = points[selected][i];
            draw();
            return
        }
    }
    var i = layers[selected].crossSpline(points[selected], pos);
    if(i === false) {
        selected_point = points[selected][points[selected].push(pos)-1];
    } else {
        points[selected].splice(i+1, -1, pos);
        selected_point = points[selected][i+1];
    }
    draw();
});

ctx.handle('mouseup', function(e) {
    selected_point = false;
    draw();
});

ctx.handle('mousemove', function(e) {
    if(selected_point) {
        selected_point[0] = e.layerX;
        selected_point[1] = e.layerY;
        draw();
    }
});

function draw() {
    layers[selected].clearRect(0, 0, canvas.width, canvas.height);
    layers[selected].beginPath();
    layers[selected].spline(points[selected]);
    layers[selected].stroke();

    for(let i in points[selected]) {
        var point = points[selected][i];
        if(selected_point && selected_point === point) {
            layers[selected].fillStyle = 'lightgreen';
        } else {
            layers[selected].fillStyle = 'black';
        }
        layers[selected].beginPath();
        layers[selected].arc(point[0], point[1], 5, 0, Math.PI*2);
        layers[selected].fill();
    }
}
