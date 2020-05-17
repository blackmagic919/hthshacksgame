import Phaser from "phaser";
import theBestMap from "./assets/map/hackHTHS_tilemap.png"
import tileSet0 from "./assets/map/tileset0.png"
import tileSet1 from "./assets/map/tileset1.png"
import MC_spritesheet from "./assets/sprites/MC_spritesheet.png"
import gun_MC_spritesheet from "./assets/sprites/gun_spritesheet.png"
import zombie_spritesheet from "./assets/sprites/zombie_spritesheet.png"
import arm_zombie_spritesheet from "./assets/sprites/zombieArmor_spritesheet.png"
import villager_spritesheet from "./assets/sprites/villager_spritesheet.png"

var map;
var player;
var zombie_group;
var villager_group;

//Camera
function cameraFollow(that){
  that.minimap = that.cameras.add(740, 10, 200, 200).setZoom(0.1);
  that.minimap.setBackgroundColor(0x002244);
  that.minimap.scrollX = 400;
  that.minimap.scrollY = 200;
  that.cameras.main.setBounds(0, 0, 25600, 19200).setZoom(2);
  that.cameras.main.startFollow(player);
  that.minimap.startFollow(player);
}

//NPC Sprites
function InitializeSprites(that){
  //InitializetheNPCgroup
  zombie_group = that.physics.add.group()
  villager_group = that.physics.add.group()

  //Zombie
  for (var i = 0; i < 10; i++)
    {
      //Determine X and Y coords
      let x = Phaser.Math.Between(0, 10000);
      let y = Phaser.Math.Between(0, 10000);
      //Deploy zombie
      let currentZombie = zombie_group.create(x, y, 'zombie').play('zombie_left');
      //Set zombie information
      currentZombie.setData("health", 100);
      currentZombie.setData("npc_type", 'zombie');
    };
   //Armored Zombie
   for (var i = 0; i < 5; i++)
   {
     //Determine X and Y coords
     let x = Phaser.Math.Between(0, 10000);
     let y = Phaser.Math.Between(0, 10000);
     //Deploy zombie
     let currentZombie = zombie_group.create(x, y, 'armored_zombie').play('arm_zom_right');
     //Set zombie information
     currentZombie.setData("health", 100);
     currentZombie.setData("npc_type", 'armored_zombie');
   };

    //Villager
    for (var i = 0; i < 50  ; i++)
    {
      //Determine X and Y coords
      let x = Phaser.Math.Between(0, 10000);
      let y = Phaser.Math.Between(0, 10000);
      //Deploy zombie
      let currentVillager = villager_group.create(x, y, 'villager').play('villager_right');
      //Set zombie information
      currentVillager.setData("health", 100);
      currentVillager.setData("npc_type", 'villager');
    };
}

//dealDamage
function dealDamageKnockback(sprite, attacker){
  //Randomize
  let realized = (Phaser.Math.Between(0, 10) == 10)
  if(realized){
    //Deal Knockback
    let kbx = attacker.body.velocity.x*10
    let kby = attacker.body.velocity.y*10
    sprite.setVelocity(kbx, kby)
    //Deal Dmg
    let dmg = 1
    sprite.setData('health', sprite.getData('health')-1)

  
  }
}

//Check for Health
function amIDead(sprite){

  if(sprite.health <= 0){
    if(sprite in monster_group){
      monster_group.remove(sprite,true);
    }
    else{
      villager_group.remove(sprite,true);
    }
    sprite.destroy();
  }
}

function updateSprites(that){

  //update zombies
  let zombies = zombie_group.getChildren()

  for (let i = 0; i < zombies.length; i++){
    //allow for collision between zombies
    that.physics.collide(zombies[i], zombie_group);


    //decide if to turn
    let turn = (Phaser.Math.Between(0,20)==20)
    //get the type of npc
    let type = zombies[i].getData('npc_type')
    if(turn){
      //Check if near person
      if((Math.sqrt((player.x-zombies[i].x)**2+(player.y-zombies[i].y)**2)) <= 500){
        //check if closer x 
        if ( Math.abs(player.x-zombies[i].x) > Math.abs(player.y-zombies[i].y) ){
          //if player right
          if (player.x > zombies[i].x){
            playRightAnim(zombies[i], type)
            zombies[i].setVelocity(100, 0);
          }
          //if player left
          else{
            playLeftAnim(zombies[i], type)
            zombies[i].setVelocity(-100, 0);
          }
        }
        //closer y
        else{
          //if player above
          if (player.y > zombies[i].y){
            playUpAnim(zombies[i], type)
            zombies[i].setVelocity(0, 100);
          }
          //if player below
          else{
            playDownAnim(zombies[i], type)
            zombies[i].setVelocity(0, -100)
          }
        }
      }
      //AMBIENT MOVEMENT
      else{ 
      //Initialize locally global variables for later use
      let xvel;
      let yvel;


      //X or Y direction?
      let xOrY = (Phaser.Math.Between(1, 2)==1)
      if(xOrY){
        xvel = Phaser.Math.Between(-100, 100)
        yvel = 0

        //Play the animation 
        if(xvel > 0){
          playRightAnim(zombies[i], type)
        }
        else{
          playLeftAnim(zombies[i], type)
        }
      }
      else{
        xvel = 0
        yvel =Phaser.Math.Between(-100 , 100)
        if(yvel > 0){
          playUpAnim(zombies[i], type)
        }
        else{
          playDownAnim(zombies[i], type)
        }
      }
      //go that direction
      zombies[i].setVelocity(xvel, yvel);
      }
    }
  }


  //updateVillagers
  let villagers = villager_group.getChildren()
  for (let i = 0; i < villagers.length; i++){
    //Decide the type of villager
    let type = villagers[i].getData('npc_type')
    //decide if to turn
    let turn = (Phaser.Math.Between(0,20)==20)
    if(turn){
      //get the closest zombie
      let closestZombie = that.physics.closest(villagers[i], zombie_group)
      //check if zombie is close
      if ((Math.sqrt((closestZombie.x-villagers[i].x)**2+(closestZombie.y-villagers[i].y)**2)) <= 200){
        //check if closer x 
        if ( Math.abs(closestZombie.x-villagers[i].x) > Math.abs(closestZombie.y-villagers[i].y) ){
          //if zombie right
          if (closestZombie.x > villagers[i].x){
            playLeftAnim(villagers[i], type)
            villagers[i].setVelocity(-150, 0);
          }
          //if zombie left
          else{
            playRightAnim(villagers[i], type)
            villagers[i].setVelocity(150, 0);
          }
        }
        //closer y
        else{
          //if zombie above
          if (closestZombie.y > villagers[i].y){
            playDownAnim(villagers[i], type)
            villagers[i].setVelocity(0, -150);
          }
          //if zombie below
          else{
            playUpAnim(villagers[i], type)
            villagers[i].setVelocity(0, 150)
          }
        }
      }
      //Ambient movement
      else{ 
        //Initialize locally global variables for later use
        let xvel;
        let yvel;


        //X or Y direction?
        let xOrY = (Phaser.Math.Between(1, 2)==1)
        if(xOrY){
          xvel = Phaser.Math.Between(-100, 100)
          yvel = 0

          //Play the animation 
          if(xvel > 0){
            playRightAnim(villagers[i], type)
          }
          else{
            playLeftAnim(villagers[i], type)
          }
        }
        else{
          xvel = 0
          yvel =Phaser.Math.Between(-100 , 100)
          if(yvel > 0){
            playUpAnim(villagers[i], type)
          }
          else{
            playDownAnim(villagers[i], type)
          }
        }
      }
    }
    //deal damage if zombie
    that.physics.add.overlap(zombie_group, villagers[i], dealDamageKnockback)

    amIDead(villagers[i])
  }
}

function playRightAnim(sprite, type){
  if(type == "zombie"){
    sprite.anims.play("zombie_right")
  }
  if(type == "armored_zombie"){
    sprite.anims.play("arm_zom_right")
  }
  if(type == "villager"){
    sprite.anims.play("villager_right")
  }
}

function playLeftAnim(sprite, type){
  if(type == "zombie"){
    sprite.anims.play("zombie_left")
  }
  if(type == "armored_zombie"){
    sprite.anims.play("arm_zom_left")
  }
  if(type == "villager"){
    sprite.anims.play("villager_left")
  }
}

function playUpAnim(sprite, type){
  if(type == "zombie"){
    sprite.anims.play("zombie_up")
  }
  if(type == "armored_zombie"){
    sprite.anims.play("arm_zom_up")
  }
  if(type == "villager"){
    sprite.anims.play("villager_up")
  }
}

function playDownAnim(sprite, type){
  if(type == "zombie"){
    sprite.anims.play("zombie_down")
  }
  if(type == "armored_zombie"){
    sprite.anims.play("arm_zom_down")
  }
  if(type == "villager"){
    sprite.anims.play("villager_down")
  }
}

//Animations
function generateAnimations(that){
  let animationData = [
  //player
  ['down', 'player', 0, 3, 5, false], ['up', 'player', 4, 7, 5, false], 
  ['right', 'player', 8, 11, 5, false], ['left', 'player', 12, 15, 5, false],
  //zombie
  ['zombie_left', 'zombie', 0, 3, 5, false],['zombie_right', 'zombie', 4, 7, 5, false],
  ['zombie_down', 'zombie', 8, 11, 5, false], ['zombie_up', 'zombie', 12, 15, 5, false],
  //armored zombie
  ['arm_zom_left', 'armored_zombie', 0, 3, 5, false],['arm_zom_right', 'armored_zombie', 4, 7, 5, false],
  ['arm_zom_down', 'armored_zombie', 8, 11, 5, false], ['arm_zom_up', 'armored_zombie', 12, 15, 5, false],
  //villager
  ['villager_up', 'villager', 0, 3, 5, false],['villager_right', 'villager', 4, 7, 5, false],
  ['villager_left', 'villager', 8, 11, 5, false], ['villager_down', 'villager', 12, 15, 5, false],

]

  //meanings: [['anim_name', 'sprite', start, end, frameRate, Repeat?]]

  animationData.forEach((data) => {
    that.anims.create({
        key: data[0],
        frames: that.anims.generateFrameNumbers(data[1], {start: data[2], end: data[3]}),
        frameRate: data[4],
        repeat: data[5]
    })
});
}


//Main Function
class Main extends Phaser.Scene {
  constructor(){
      super({key: "Main"});
  }

  preload() {
    //map
    this.load.tilemapTiledJSON('tmap', theBestMap);//'src/assets/map/theBestMap.json', );
    this.load.image('tiles0', tileSet0);//'src/assets/map/tile_map.png');
    this.load.image('tiles1', tileSet1);//'src/assets/map/tile_map.png');

    //Character
    this.load.spritesheet('player', MC_spritesheet,{ frameWidth: 64 , frameHeight: 100 });
    this.load.spritesheet('player_gun', gun_MC_spritesheet,{ frameWidth: 64 , frameHeight: 100 });

    //Zombie
    this.load.spritesheet('zombie', zombie_spritesheet, { frameWidth: 64, frameHeight: 56});
    this.load.spritesheet('armored_zombie', arm_zombie_spritesheet, { frameWidth: 64, frameHeight: 56})

    //Villager
    this.load.spritesheet('villager', villager_spritesheet, { frameWidth: 64, frameHeight: 64})
  }

create() {
    //Add Keys
    this.Key_W = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
    this.Key_A = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
    this.Key_S = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
    this.Key_D = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)


    //CreateTileMap
    map = this.make.tilemap({key: "tmap"});
    const tileset0 = map.addTilesetImage("tileset0", "tiles0")
    const tileset1 = map.addTilesetImage("tileset1", "tiles1")
    let background = map.createStaticLayer("Tile Layer 1", tileset0, 0, 0)
    let foreground = map.createStaticLayer("Tile Layer 2", tileset1, 0, 0)
    foreground.setCollisionByProperty({collides : true});

    //Create Player data
    player = this.physics.add.sprite(Phaser.Math.Between(0, 10000), Phaser.Math.Between(0, 10000), "player")
    player.setData("health", 10000);
    this.physics.add.collider(player, foreground);

    //Make Camera Follow Player
    cameraFollow(this)

    //generateAnimations
    generateAnimations(this)

    //zombies
    InitializeSprites(this)

    //Load Icons
    this.scene.launch("icons")
  }

  update() {
  //Player Movement
    if (this.Key_W.isDown){
      player.setVelocity(0, -200);
      player.anims.play('up', true);
    }
    else if (this.Key_S.isDown){
      player.setVelocity(0, 200);
      player.anims.play('down', true);
    }
    else if(this.Key_A.isDown){
      player.setVelocity(-200,0);
      player.anims.play('left', true);
    }
    else if(this.Key_D.isDown){
      player.setVelocity(200,0);
      player.anims.play('right', true);
    }
    else{
      player.setVelocity(player.body.velocity.x*0.9,player.body.velocity.y*0.9)
    }
    //Update npcs
    updateSprites(this)

    //Add check for damage
    this.physics.add.overlap(zombie_group, player, dealDamageKnockback)

    //Update health to registry
    this.registry.set('health', player.getData('health'))

    //isPlayerDead?
    if(player.getData('health')<= 0){
      //reset character
      player.setVelocity(0,0)
      player.x = Phaser.Math.Between(0, 10000);
      player.y = Phaser.Math.Between(0, 10000);
      player.setData('health', 10000)
    }
  }

}

export {Main};