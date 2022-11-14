// 动态背景效果
(function (window, document, undefined) {
    'use strict';

    function Bubble(ctx, winWidth, winHeight) {

        this.ctx = ctx;
        this.winWidth = winWidth;
        this.winHeight = winHeight;
        this.bubble = {x: 0, y: 0, color: '255, 255, 255'};

        this.init();
    }

    Bubble.prototype.init = function () {

        this.bubble.x = this.winWidth * window.Math.random();
        this.bubble.y = this.winHeight + window.Math.random() * 100;

        this.alpha = 0.1 + window.Math.random() * 0.3;
        this.scale = 1 + window.Math.random() * 5;
        this.speed = window.Math.random();
    };

    Bubble.prototype.draw = function () {

        if (this.alpha <= 0) {

            this.init();
        }

        this.bubble.y -= this.speed;
        this.alpha -= 0.0005;

        this.ctx.beginPath();
        this.ctx.arc(this.bubble.x, this.bubble.y, this.scale, 0, 2 * window.Math.PI, false);
        this.ctx.fillStyle = 'rgba(' + this.bubble.color + ', ' + this.alpha + ')';
        this.ctx.fill();
    };

    var winWidth = window.innerWidth,
        winHeight = window.innerHeight,
        canvas = document.getElementById('bg'),
        ctx = canvas.getContext('2d'),
        bubbles = [], n;

    canvas.width = winWidth;
    canvas.height = winHeight;

    for(n = 0; n < winWidth * 0.1; n++) {
        bubbles.push(new Bubble(ctx, winWidth, winHeight));
    }

    (function animate() {
        ctx.clearRect(0, 0, winWidth, winHeight);

        bubbles.forEach(function (bubble) {

            bubble.draw();
        });

        requestAnimationFrame(animate);
    }());
})(window, document);
