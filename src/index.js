import Phaser from "phaser";
import {Main} from './main';
import {icons} from './icons';


var config = {
    type: Phaser.WEBGL,
    width: 1000,
    height: 750,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene: [Main, icons]
};

var game = new Phaser.Game(config);

