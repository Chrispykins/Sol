function globalwormhole(global) {

    var canvas= global.canvas;
    var context= global.context;
    var viewport= global.viewport;

    var sprite= new global.SpriteSheet(global.images.portalSheet);
    sprite.createEvenFrames(200, 200);

    //wormhole class
    function Wormhole(options) {

        //make sure options exists
        options= options || {};

        this.gridPos= options.gridPos || [0, 0];

        this.xy= options.xy || [0, 0];
        this.size= options.size || [0, 0];

        this.sprite= options.sprite || sprite;
        
        this.animation= new global.SpriteAnimation(this.sprite, {
                X: this.xy[0] + 20,
                Y: this.xy[1] + 20,
                width: this.size[0] - 40,
                height: this.size[1] - 40,
                loop: true,
                canvas: canvas,
                context: context,
                viewport: viewport
            });

        this.animation.start();

        this.level= options.level || global.currentLevel;

        this.outlet= options.outlet || [0, 0];

        this.context= options.context || context || global.context;
        this.viewport= options.viewport || viewport || global.viewport;
    }

    Wormhole.prototype.draw= function(dt) {

        this.animation.update(dt);
        this.animation.draw();
    }

    Wormhole.prototype.onClick= function() {

        return false;
    }

    Wormhole.prototype.save= function() {

        //empty function to prevent errors
    }

    Wormhole.prototype.revert= function() {
        //empty function to prevent errors
    }

    Wormhole.prototype.transfer= function(ball) {

        var offsetX= (this.size[0] - ball.size[0]) / 2;
        var offsetY= (this.size[1] - ball.size[1]) / 2;

        ball.xy[0]= this.outlet[0] + offsetX;
        ball.xy[1]= this.outlet[1] + offsetY;

    }


    global.Wormhole = Wormhole;

}