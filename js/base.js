var m_images = {
    46:{image: 'coin', class:'coin', scale: 0.5, init_pos: pos(64*15, 200)},
    47:{image: 'coin', class:'coin', scale: 0.75, init_pos: pos(64*15, 120)},
    52:{image: 'buttle', class:'rum', scale: 0.5, init_pos: pos(64*15+50, 200)},
    45:{image: 'ship', class:'ship', scale: 1, init_pos: pos(null, null)},
    53:{image: 'boat', class:'boat', scale: 1, init_pos: pos(64*15+50, 580)},
    54:{image: 'cart', class:'cart', scale: 1, init_pos: pos(64*15+70, 620)},
    48:{image: 'cannonball', class:'cannonball', scale: 0.5, init_pos: pos(64*15+70, 700)},
    55:{sprite: 'pirate-1', class:'pirate', speed: 16, scale: 0.75, init_pos: pos(null, null)},
    56:{sprite: 'pirate-2', class:'pirate', speed: 16, scale: 0.75, init_pos: pos(null, null)},
    57:{sprite: 'pirate-3', class:'pirate', speed: 16, scale: 0.75, init_pos: pos(null, null)},
    58:{sprite: 'pirate-4', class:'pirate', speed: 16, scale: 0.75, init_pos: pos(null, null)},
    49:{sprite: 'pirate-1', class:'pirate', speed: 16, scale: 0.75, init_pos: pos(64*15+50, 320), text: "Пятница"},
    50:{sprite: 'pirate-2', class:'pirate', speed: 16, scale: 0.75, init_pos: pos(64*15+50, 400), text: "Бен Ганн"},
    51:{sprite: 'pirate-3', class:'pirate', speed: 16, scale: 0.75, init_pos: pos(64*15+50, 480), text: "Миссионер"}
}

var m_objects = [];

function getMapObject(id, type_id) {
    var i;
    for (i = 0; i < m_objects.length; i++) {
        if (m_objects[i].obj_id === id && m_objects[i].type_id === type_id) {
            return m_objects[i];
        }
    }
    return null;
}

var mapObject = function(obj_id, type_id, f_init_pos) {
    this.obj_id = null;
    this.type_id = null;
    this.image = null;
    this.image_type = null;
    this.scale = null;
    this.object = null;
    this.object_class = null;
    this.visible = 1;
    this.inputEnabled = true;

    if (f_init_pos==null) {
        f_init_pos = {};
        f_init_pos.x = function(x, ctx) {
            return x;
        }
        f_init_pos.y = function(y, ctx) {
            return y + 10 * m_objects.filter(x=>x.type_id==ctx.type_id).length;
        }
    }

    if (type_id!=undefined) {
        this.obj_id=obj_id;
        this.type_id=type_id;
        var img = m_images[type_id];
        this.image = img[Object.keys(img)[0]];
        this.scale = img.scale;
        this.object_class = img.class;
        var x = img.init_pos[0];
        var y = img.init_pos[1];
        this.image_type = Object.keys(img)[0];
        var o = game.add[this.image_type](f_init_pos.x(x, this), f_init_pos.y(y, this), this.image, objectLayer);
        o.scale.setTo(this.scale,this.scale);
        if (this.inputEnabled) {
            o.inputEnabled = true;
            o.input.enableDrag(true);
            o.events.onDragStop.add(function (sprite, pointer, dragX, dragY) {
                socket.send(JSON.stringify(
                    {
                        object_type: this.object_class,
                        object_id: this.obj_id,
                        move_to_x: Math.floor(sprite.world.x),
                        move_to_y: Math.floor(sprite.world.y)
                    }
                ));
            }, this);
        }
        if (this.object_class=="coin") {
            game.add.tween(o.scale).to( { x: this.scale*1.1, y: this.scale*1.1 }, 2000, Phaser.Easing.Exponential.InOut, true, 0, Number.MAX_VALUE, true);
        }
        o.alpha = 1;
        this.object = o;
        m_objects.push(this);
    }

    this.get_pos = function() {
        return pos(this.object.position.x, this.object.position.y);
    };
    this.set_pos = function(x, y) {
        game.add.tween(this.object.position).to({x: x, y: y}, 200, Phaser.Easing.Linear.None).start();
    }
}

var mapObjectShip = function(obj_id, type_id) {
    var l = m_objects.filter(x=>x.type_id==type_id).length;
    var places = [[64*7, 64*13],[0, 64*7],[64*7, 0],[64*13, 64*7]];
    var f_init_pos = {
        x: function(x) {
            return places[l][0];
        }, 
        y: function(y) {
            return places[l][1];
        }
    }
    mapObject.call(this, obj_id, type_id, f_init_pos);
}

var mapObjectPirate = function(obj_id, type_id) {
    var l = m_objects.filter(x=>x.type_id==type_id).length;
    var places = [[64*7, 64*13],[0, 64*7],[64*7, 0],[64*13, 64*7]];
    var m = [55,56,57,58];
    var f_init_pos = {
        x: function(x) {
            if (x!=null) return x;
            return places[m.indexOf(type_id)][0]+(l-1)*20;
        }, 
        y: function(y) {
            if (y!=null) return y;
            return places[m.indexOf(type_id)][1];
        }
    }
    mapObject.call(this, obj_id, type_id, f_init_pos);

    var offset = new Phaser.Point(38, 50);
    var shadow = game.add.graphics(0, 0);
    //shadow.anchor.set(0.2);
    shadow.tint = 0x000000;
    shadow.beginFill(0xFFFF0B, 0.5);
    shadow.drawEllipse(0, 0, 15,5);
    shadow.endFill();
    shadow.x = this.object.x + offset.x;
    shadow.y = this.object.y + offset.y;
    //shadow.rotation=-0.55;
    this.object.bringToTop();

    game.input.addMoveCallback(function move(pointer, x, y) {
        //this.object.x = x;
        //this.object.y = y;
        shadow.x = this.object.x + offset.x;
        shadow.y = this.object.y + offset.y;
    }, this);
    
    this.text = null;
    var img = m_images[type_id];
    var style = { font: "10px Arial", height:"10px", fill: "#000000", align: "center",backgroundColor: "#ffffff" };
    if (img.text!=undefined) {
        var txt = game.add.text(0, 0, img.text, style, objectLayer);
        txt.anchor.set(0.5);
        this.text = txt;
    }
    if (this.image_type=="sprite") {
        this.object.animations.add('walk');
        this.object.animations.play('walk', img.speed, true);
    }
}

function pos(x,y) {
    return [x, y];
}

function readData(data) {

    if (gameID==null) { 
        gameID = data.id; 
    } else {
        if (gameID != data.id) {
            location.reload();
        }
    }
    setMapObjects(data.ships, mapObjectShip);
    setMapObjects(data.coins, mapObject);
    setMapObjects(data.cannonballs, mapObject);
    setMapObjects(data.boat, mapObject);
    setMapObjects(data.cart, mapObject);
    setMapObjects(data.rums, mapObject);
    setMapObjects(data.pirates, mapObjectPirate);
    updateMapTiles(data.map.tiles);

    function updateMapTiles(arr) {
        arr.forEach(function(e,i){ 
            if (e.flipped) {
                var obj = {};
                obj.x = e.id - 12 * Math.floor(e.id / 12) + 1;
                obj.y = Math.ceil((e.id + 1) / 12);
                var currentTile = map.getTile(obj.x, obj.y);
                
                if (currentTile.index==tile_ground) {
                    var idx_Tile = tile_sprite_id_map.indexOf(e.sprite_id) + tileset.firstgid;
                    if (e.rot!=0) {
                        var tile = game.add.sprite(currentTile.worldX + currentTile.width / 2, currentTile.worldY + currentTile.height / 2, 'tiles', tile_sprite_id_map.indexOf(e.sprite_id), groundLayer);
                        tile.anchor.setTo(0.5, 0.5);
                        tile.angle = e.rot;
                    }

                    var ground = game.add.image(currentTile.worldX, currentTile.worldY, 'ground', groundLayer);
                    ground.alpha = 1;
    
                    var bounce = game.add.tween(ground)
                        .to({ alpha: 0.5 }, 100, Phaser.Easing.Bounce.Out)
                        .to({ alpha: 1.0 }, 100, Phaser.Easing.Bounce.Out)
                        .to({ alpha: 0.5 }, 100, Phaser.Easing.Bounce.Out)
                        .to({ alpha: 1.0 }, 100, Phaser.Easing.Bounce.Out)
                        .to({ alpha: 0 }, 250, Phaser.Easing.Cubic.In)
                        .start();
                    bounce.onComplete.add( function() {ground.destroy();});

                    map.putTile(idx_Tile, obj.x, obj.y, currentLayer);
                }
            }
        });
    }


    function setMapObjects(arr, cls) {
        if (!Array.isArray(arr)) {
            arr = [arr];
        }
        arr.forEach(function(e,i){ 
            var obj = getMapObject(e.id,e.sprite_id);
            if(obj==null) {
                    new cls(e.id,e.sprite_id);      
            } else {
                if (e.xy_px[0]!=-1 && e.xy_px[1]!=-1 && obj.object.input.isDragged==false) {
                    if (obj.get_pos()!=e.xy_px) {
                        obj.set_pos(e.xy_px[0],e.xy_px[1]);
                    }
                }
            }
        });
        
    }


        
}