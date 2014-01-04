/*globals lmaze, alert */
/*jslint browser: true */
(function () {
    "use strict"; 

    var POS = [
            [1 / 3, 0], [2 / 3, 0], [1, 1 / 3], [1, 2 / 3], [2 / 3, 1], [1 / 3, 1], [0, 2 / 3], [0, 1 / 3]
        ],
        BOX_SIZE = 50;
		
    lmaze.MazeTile.prototype.draw = function (ctx) {
        var x = this.pos[0],
            y = this.pos[1],
            i;
        ctx.save();
        ctx.translate(x * BOX_SIZE + BOX_SIZE / 2, y * BOX_SIZE + BOX_SIZE / 2);
        ctx.rotate(this.mRotation / 180 * Math.PI);
        ctx.translate(-BOX_SIZE / 2, -BOX_SIZE / 2);
        for (i = 0; i < this.mPaths.length; i += 1) {
            if (!this.mPaths[i][2]) {
                ctx.strokeStyle = '#aaa';
            } else {
                ctx.strokeStyle = '#333';
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#222';
            }
            ctx.beginPath();
            ctx.moveTo(POS[this.mPaths[i][0]][0] * BOX_SIZE, POS[this.mPaths[i][0]][1] * BOX_SIZE);
            ctx.lineTo(POS[this.mPaths[i][1]][0] * BOX_SIZE, POS[this.mPaths[i][1]][1] * BOX_SIZE);
            ctx.closePath();
            ctx.stroke();
        }
        ctx.restore();
    };

    lmaze.StartTile.prototype.draw = function (ctx) {
        var x = this.pos[0],
            y = this.pos[1],
            i;
        ctx.save();
        ctx.translate(x * BOX_SIZE, y * BOX_SIZE);
        //        ctx.shadowBlur = 10;
        //        ctx.shadowColor = '#999';
        //        ctx.fillRect(0, 0, BOX_SIZE, BOX_SIZE);
        for (i = 0; i < POS.length; i += 1) {
            if (this.exit === i) {
                ctx.strokeStyle = '#222';
            } else {
                ctx.strokeStyle = '#ccc';
            }
            ctx.beginPath();
            ctx.moveTo(BOX_SIZE / 2, BOX_SIZE / 2);
            ctx.lineTo(POS[i][0] * BOX_SIZE, POS[i][1] * BOX_SIZE);
            ctx.stroke();
        }

        ctx.fillStyle = '#efefef';
        ctx.strokeStyle = '#555';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ccc';
        ctx.beginPath();
        ctx.arc(BOX_SIZE / 2, BOX_SIZE / 2, BOX_SIZE * 0.4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fill();

        ctx.strokeStyle = '#555';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'orange';
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.moveTo(BOX_SIZE * 0.65, BOX_SIZE * 0.25);
        ctx.lineTo(BOX_SIZE * 0.65, BOX_SIZE * 0.75);
        ctx.lineTo(BOX_SIZE * 0.3, BOX_SIZE * 0.5);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    };

    lmaze.BlockTile.prototype.draw = function (ctx) {
        var x = this.pos[0],
            y = this.pos[1];
        ctx.save();
        ctx.translate(x * BOX_SIZE, y * BOX_SIZE);
        ctx.strokeStyle = 'rgb(0,0,0)';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#222';
        ctx.beginPath();
        if (x === 0) {
            ctx.moveTo(BOX_SIZE, 0);
            ctx.lineTo(BOX_SIZE, BOX_SIZE);
        } else if (x === 9) {
            ctx.moveTo(0, 0);
            ctx.lineTo(0, BOX_SIZE);
        } else if (y === 0) {
            ctx.moveTo(0, BOX_SIZE);
            ctx.lineTo(BOX_SIZE, BOX_SIZE);
        } else if (y === 9) {
            ctx.moveTo(0, 0);
            ctx.lineTo(BOX_SIZE, 0);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    };

    window.onload = function () {
        var doc, body, model, canvas, nextBtn, rotateBtn;
		
        doc = document;
		body = doc.body;

        canvas = doc.getElementById('canvas');
        canvas.width = BOX_SIZE * 10;
        canvas.height = BOX_SIZE * 10;

        model = new lmaze.MazeModel(function (event) {
            switch (event.type) {
            case 'rotate':
                break;
            case 'step':
                break;
            case 'over':
                break;
            }
            this.refresh();
			//if (window.external && window.external.notify) {
				//window.external.notify("aaaa");
			//}
			window.external.notify(event.type);
        });
		
        model.refresh = function () {
            var ctx = canvas.getContext('2d'),
                cx = this.mTile.pos[0] * BOX_SIZE,
                cy = this.mTile.pos[1] * BOX_SIZE,
                i;

            ctx.save();
            ctx.fillStyle = '#efefef';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            for (i = 0; i < this.mTiles.length; i += 1) {
                this.mTiles[i].draw(ctx);
            }
            ctx.restore();

			if (this.state == 1) {
				ctx.save();
				ctx.strokeStyle = '#f00';
				ctx.strokeRect(cx, cy, BOX_SIZE, BOX_SIZE);
				ctx.restore();
			}

			window.center();
        };

		window.center = function () {
			var x = model.mTile.pos[0] * BOX_SIZE + BOX_SIZE / 2,
				y = model.mTile.pos[1] * BOX_SIZE + BOX_SIZE / 2,
				rx = x - body.clientWidth / 2,
				ry = y - body.clientHeight / 2;
			window.scroll(rx, ry);
		};

		window.getCanvasURL = function () {
			model.refresh();
			return canvas.toDataURL();
		};
		
		window.next = function () {
            model.step(1);
        };

		window.rotate = function () {
            model.rotate();
        };

		nextBtn = doc.getElementById('next');
		if (nextBtn) {
			nextBtn.addEventListener('click', function (event) {
				window.next();
				event.preventDefault();
			});
		}

		rotateBtn = doc.getElementById('rotate');
		if (rotateBtn) {
			rotateBtn.addEventListener('click', function (event) {
				window.rotate();
				event.preventDefault();
			});
		}

        model.init();
        model.refresh();

        window.model = model;
    };
}());