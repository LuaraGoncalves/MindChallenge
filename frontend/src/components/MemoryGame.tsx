import { useEffect, useRef } from 'react';
import Phaser from 'phaser';

class MemoryDemoScene extends Phaser.Scene {
  constructor() {
    super('MemoryDemoScene');
  }

  preload() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xeab308, 1);
    graphics.fillRect(0, 0, 60, 60);
    graphics.generateTexture('box', 60, 60);
    graphics.destroy();

    const ghostGraphics = this.add.graphics();
    ghostGraphics.fillStyle(0x3b82f6, 1);
    ghostGraphics.fillCircle(30, 30, 30);
    ghostGraphics.generateTexture('ghost', 60, 60);
    ghostGraphics.destroy();
  }

  create() {
    this.add.text(400, 50, 'Mini Phaser Demo (Clique na Tela!)', {
      fontSize: '24px',
      color: '#eeecd0',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    const particles = this.add.particles(0, 0, 'box', {
      speed: 100,
      scale: { start: 1, end: 0 },
      blendMode: 'ADD',
    });

    const logo = this.physics.add.image(400, 100, 'ghost');
    logo.setVelocity(100, 200);
    logo.setBounce(1, 1);
    logo.setCollideWorldBounds(true);

    particles.startFollow(logo);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const newBox = this.physics.add.image(pointer.x, pointer.y, 'box');
      newBox.setVelocity(Phaser.Math.Between(-200, 200), -300);
      newBox.setBounce(0.8, 0.8);
      newBox.setCollideWorldBounds(true);

      this.tweens.add({
        targets: newBox,
        angle: 360,
        duration: 2000,
        repeat: -1,
        ease: 'Linear',
      });
    });
  }
}

const MemoryGame = () => {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 400,
      parent: gameRef.current,
      backgroundColor: '#151715',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 300 },
          debug: false,
        },
      },
      scene: MemoryDemoScene,
    };

    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true);
    };
  }, []);

  return (
    <div
      ref={gameRef}
      className="arcade-frame overflow-hidden rounded-sm bg-[#151715] transition-transform duration-300 hover:scale-[1.02] cursor-pointer"
    />
  );
};

export default MemoryGame;
