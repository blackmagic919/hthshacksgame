var healthBar;
var progressBox

class icons extends Phaser.Scene{
    constructor(){
        super({key: "icons"});
    }
    preload(){

    }
    create(){
        //healthBar
        healthBar = this.add.graphics();
        progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(50, 50, 300, 50);
        healthBar.fillStyle(0xFF0000, 1);
        healthBar.fillRect(55, 55, 290, 40);
    }
    update(){
        this.registry.events.on('changedata', function(parent, key, data){
            if(key = 'health'){
                healthBar.clear();
                healthBar.fillStyle(0xFF0000, 1);
                healthBar.fillRect(55, 55, 290* (data/10000), 40);
            }
        })
    }
}
export {icons};