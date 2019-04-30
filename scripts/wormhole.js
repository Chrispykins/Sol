function run_wormhole(global) {

    var canvas= global.canvas;
    var context= global.context;
    var viewport= global.viewport;

    var sprite= new global.SpriteSheet(global.images.portalSheet);
    sprite.createEvenFrames(200, 200);

    //wormhole class
    function Wormhole(options) {

        //make sure options exists
        options= options || {};

        this.entityType = 'wormhole';

        this.gridPos= options.gridPos || [0, 0];

        this.xy= options.xy || [0, 0];
        this.size= options.size || [0, 0];

        this.base = global.images.portalBase;

        this.sprite= options.sprite || sprite;
        
        this.animation= new global.SpriteAnimation(this.sprite, {
            //for now we are using the middle wormhole for position. Should probably do this for all objects
                X: this.xy[0] - this.size[0]/2,
                Y: this.xy[1] - this.size[1]/2,
                width: this.size[0],
                height: this.size[1],
                loop: true,
                canvas: canvas,
                context: context,
                viewport: viewport
            });

        this.animation.start();

        this.level= options.level || global.currentLevel;

        this.outlet= null;

        //in and out animation
        this.scale = 1;
        this.scaleDirection = 0;
    }

    Wormhole.prototype.draw= function(dt) {

        if  (this.scale < 0.25 && this.scaleDirection < 0) {
            this.scaleDirection = 1;
            this.animation.speed = -2;
        }
        else if  (this.scale > 1   && this.scaleDirection > 0) {
            this.scaleDirection = 0;
            this.scale =1;
            this.animation.speed = 1;
        }

        this.scale += this.scaleDirection * this.level.bps * dt / 2000;

        this.animation.width  = this.size[0] * this.scale;
        this.animation.height = this.size[1] * this.scale;

        this.animation.X = this.xy[0] - this.animation.width/2;
        this.animation.Y = this.xy[1] - this.animation.height/2

        viewport.drawImage(this.base, this.xy[0] - this.size[0]/2, this.xy[1] - this.size[1]/2, this.size[0], this.size[1]);

        this.animation.update(dt);
        this.animation.draw();
    }

    Wormhole.prototype.onClick= function() {

        this.activate()

        return false;
    }

    Wormhole.prototype.activate = function() {
        this.animation.speed = 7;
        this.scaleDirection = -1;
    }

    Wormhole.prototype.undo = function() {
        //empty function to prevent errors
    }

    Wormhole.prototype.save= function() {

        //empty function to prevent errors
    }

    Wormhole.prototype.revert= function() {
        //empty function to prevent errors
    }

    Wormhole.prototype.transfer= function(ball) {

        ball.xy[0]= this.outlet.xy[0];
        ball.xy[1]= this.outlet.xy[1];
    }


    global.Wormhole = Wormhole;

}