var Flood = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

    function Flood ()
    {
        Phaser.Scene.call(this, { key: 'flood' });

        this.allowClick = true;

        this.arrow;
        this.cursor;
        this.cursorTween;

        this.icon1 = { shadow: null, monster: null };
        this.icon2 = { shadow: null, monster: null };
        this.icon3 = { shadow: null, monster: null };
        this.icon4 = { shadow: null, monster: null };
        this.icon5 = { shadow: null, monster: null };
        this.icon6 = { shadow: null, monster: null };

        this.gridBG;

        this.text1;
        this.text2;

        this.currentColor = '';

        this.emitters = {};

        this.grid = [];
        this.matched = [];

        this.moves = 25;

        this.frames = [ 'blue', 'green', 'grey', 'purple', 'red', 'yellow' ];
    },

    preload: function ()
    {
        this.load.bitmapFont('atari', 'assets/fonts/bitmap/atari-smooth.png', 'assets/fonts/bitmap/atari-smooth.xml');
        this.load.atlas('flood', 'assets/games/flood/blobs.png', 'assets/games/flood/blobs.json');
    },

    create: function ()
    {
        this.add.image(400, 300, 'flood', 'background');
        this.gridBG = this.add.image(400, 600 + 300, 'flood', 'grid');

        this.createIcon(this.icon1, 'grey', 16, 156);
        this.createIcon(this.icon2, 'red', 16, 312);
        this.createIcon(this.icon3, 'green', 16, 458);
        this.createIcon(this.icon4, 'yellow', 688, 156);
        this.createIcon(this.icon5, 'blue', 688, 312);
        this.createIcon(this.icon6, 'purple', 688, 458);

        this.cursor = this.add.image(16, 156, 'flood', 'cursor-over').setOrigin(0).setVisible(false);

        //  The game is played in a 14x14 grid with 6 different colors

        this.grid = [];

        for (var x = 0; x < 14; x++)
        {
            this.grid[x] = [];

            for (var y = 0; y < 14; y++)
            {
                var sx = 166 + (x * 36);
                var sy = 66 + (y * 36);
                var color = Phaser.Math.Between(0, 5);

                var block = this.add.image(sx, -600 + sy, 'flood', this.frames[color]);

                block.setData('oldColor', color);
                block.setData('color', color);
                block.setData('x', sx);
                block.setData('y', sy);

                this.grid[x][y] = block;
            }

            window.scene = this;
        }

        this.currentColor = this.grid[0][0].getData('color');

        this.particles = this.add.particles('flood');

        for (var i = 0; i < this.frames.length; i++)
        {
            this.createEmitter(this.frames[i]);
        }

        this.createArrow();

        this.text1 = this.add.bitmapText(684, 30, 'atari', 'Moves', 20).setAlpha(0);
        this.text2 = this.add.bitmapText(694, 60, 'atari', '00', 40).setAlpha(0);

        this.input.events.on('GAME_OBJECT_OVER_EVENT', this.onIconOver.bind(this));
        this.input.events.on('GAME_OBJECT_OUT_EVENT', this.onIconOut.bind(this));
        this.input.events.on('GAME_OBJECT_DOWN_EVENT', this.onIconDown.bind(this));

        this.revealGrid();
    },

    createArrow: function ()
    {
        this.arrow = this.add.image(109 - 24, 48, 'flood', 'arrow-white').setOrigin(0);

        this.tweens.add({

            targets: this.arrow,
            x: '+=24',
            ease: 'Sine.easeInOut',
            duration: 900,
            yoyo: true,
            repeat: -1

        });
    },

    createIcon: function (icon, color, x, y)
    {
        var sx = (x < 400) ? -200 : 1000;

        var shadow = this.add.image(sx, y, 'flood', 'shadow');

        shadow.setData('color', this.frames.indexOf(color));

        shadow.setData('x', x);
        shadow.setOrigin(0);

        shadow.setInteractive();

        icon.shadow = shadow;

        icon.monster = this.add.image(sx, y, 'flood', 'icon-' + color).setOrigin(0);
    },

    revealGrid: function ()
    {
        this.tweens.add({
            targets: this.gridBG,
            y: 300,
            ease: 'Power3'
        });

        var i = 800;

        for (var y = 13; y >= 0; y--)
        {
            for (var x = 0; x < 14; x++)
            {
                var block = this.grid[x][y];

                this.tweens.add({

                    targets: block,

                    y: block.getData('y'),

                    ease: 'Power3',
                    duration: 800,
                    delay: i

                });

                i += 30;
            }
        }

        i -= 1000;

        //  Icons
        this.tweens.add({
            targets: [ this.icon1.shadow, this.icon1.monster ],
            x: this.icon1.shadow.getData('x'),
            ease: 'Power3',
            delay: i
        });

        this.tweens.add({
            targets: [ this.icon4.shadow, this.icon4.monster ],
            x: this.icon4.shadow.getData('x'),
            ease: 'Power3',
            delay: i
        });

        i += 200;

        this.tweens.add({
            targets: [ this.icon2.shadow, this.icon2.monster ],
            x: this.icon2.shadow.getData('x'),
            ease: 'Power3',
            delay: i
        });

        this.tweens.add({
            targets: [ this.icon5.shadow, this.icon5.monster ],
            x: this.icon5.shadow.getData('x'),
            ease: 'Power3',
            delay: i
        });

        i += 200;

        this.tweens.add({
            targets: [ this.icon3.shadow, this.icon3.monster ],
            x: this.icon3.shadow.getData('x'),
            ease: 'Power3',
            delay: i
        });

        this.tweens.add({
            targets: [ this.icon6.shadow, this.icon6.monster ],
            x: this.icon6.shadow.getData('x'),
            ease: 'Power3',
            delay: i
        });

        //  Text

        this.tweens.add({
            targets: [ this.text1, this.text2 ],
            alpha: 1,
            ease: 'Power3',
            delay: i
        });

        i += 500;

        var movesTween = this.tweens.addCounter({
            from: 0,
            to: 25,
            ease: 'Power1',
            onUpdate: function (tween, targets, text)
            {
                text.setText(Phaser.Utils.String.Pad(tween.getValue().toFixed(), 2, '0', 1));
            },
            onUpdateParams: [ this.text2 ],
            delay: i
        });

    },

    onIconOver: function (event)
    {
        var icon = event.gameObject;

        var newColor = icon.getData('color');

        //  Valid color?
        if (newColor !== this.currentColor)
        {
            this.cursor.setFrame('cursor-over');
        }
        else
        {
            this.cursor.setFrame('cursor-invalid');
        }

        this.cursor.setPosition(icon.x, icon.y);

        if (this.cursorTween)
        {
            this.cursorTween.stop();
        }

        this.cursor.setAlpha(1);
        this.cursor.setVisible(true);

        //  Change arrow color
        this.arrow.setFrame('arrow-' + this.frames[newColor]);
    },

    onIconOut: function (event)
    {
        this.cursorTween = this.tweens.add({
            targets: this.cursor,
            alpha: 0,
            duration: 300
        });

        this.arrow.setFrame('arrow-white');
    },

    onIconDown: function (event)
    {
        if (!this.allowClick)
        {
            return;
        }

        var icon = event.gameObject;

        var newColor = icon.getData('color');

        //  Valid color?
        if (newColor === this.currentColor)
        {
            return;
        }

        var oldColor = this.grid[0][0].getData('color');

        // console.log('starting flood from', oldColor, this.frames[oldColor], 'to', newColor, this.frames[newColor]);

        if (oldColor !== newColor)
        {
            this.currentColor = newColor;

            this.matched = [];

            this.cursor.setVisible(false);

            this.moves--;

            this.text2.setText(Phaser.Utils.String.Pad(this.moves, 2, '0', 1));

            this.floodFill(oldColor, newColor, 0, 0);

            if (this.matched.length > 0)
            {
                this.startFlow();
            }
        }
    },

    createEmitter: function (color)
    {
        this.emitters[color] = this.particles.createEmitter({
            frame: color,
            lifespan: 1000,
            speed: { min: 300, max: 400 },
            alpha: { start: 1, end: 0 },
            scale: { start: 0.5, end: 0 },
            rotate: { start: 0, end: 360, ease: 'Power2' },
            blendMode: 'ADD',
            on: false
        });
    },

    startFlow: function ()
    {
        this.matched.sort(function (a, b) {

            var aDistance = Phaser.Math.Distance.Between(a.x, a.y, 166, 66);
            var bDistance = Phaser.Math.Distance.Between(b.x, b.y, 166, 66);

            return aDistance - bDistance;

        });

        //  Swap the sprites

        var t = 0;

        this.allowClick = false;

        for (var i = 0; i < this.matched.length; i++)
        {
            var block = this.matched[i];

            var blockColor = this.frames[block.getData('color')];
            var oldBlockColor = this.frames[block.getData('oldColor')];

            var emitter = this.emitters[oldBlockColor];

            this.time.delayedCall(t, function (block, blockColor) {

                block.setFrame(blockColor);

                emitter.explode(4, block.x, block.y);
                
            }, [ block, blockColor, emitter ]);

            t += 10;
        }

        // console.log('spriteflow finishes in', t, 'ms');

        _this = this;

        this.time.delayedCall(t, function () {

            _this.allowClick = true;

            if (_this.checkWon())
            {
                _this.text1.setText("Won!!");
            }

        });
    },

    checkWon: function ()
    {
        var topLeft = this.grid[0][0].getData('color');

        for (var x = 0; x < 14; x++)
        {
            for (var y = 0; y < 14; y++)
            {
                if (this.grid[x][y].getData('color') !== topLeft)
                {
                    return false;
                }
            }
        }

        return true;
    },

    floodFill: function (oldColor, newColor, x, y)
    {
        if (oldColor === newColor || this.grid[x][y].getData('color') !== oldColor)
        {
            return;
        }

        this.grid[x][y].setData('oldColor', oldColor);
        this.grid[x][y].setData('color', newColor);

        if (this.matched.indexOf(this.grid[x][y]) === -1)
        {
            this.matched.push(this.grid[x][y]);
        }

        if (x > 0)
        {
            this.floodFill(oldColor, newColor, x - 1, y);
        }

        if (x < 13)
        {
            this.floodFill(oldColor, newColor, x + 1, y);
        }

        if (y > 0)
        {
            this.floodFill(oldColor, newColor, x, y - 1);
        }

        if (y < 13)
        {
            this.floodFill(oldColor, newColor, x, y + 1);
        }
    }

});

var config = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    parent: 'phaser-example',
    scene: [ Flood ]
};

var game = new Phaser.Game(config);
