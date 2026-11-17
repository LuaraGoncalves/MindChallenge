import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { RotateCcw } from 'lucide-react';

class MemoryDemoScene extends Phaser.Scene {
  private pieces: Phaser.Physics.Arcade.Image[] = [];
  constructor() {
    super('MemoryDemoScene');
  }

  preload() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xcf9b58, 1);
    graphics.fillRect(0, 0, 60, 60);
    graphics.lineStyle(3, 0xf2d49e, 1);
    graphics.strokeRect(5, 5, 50, 50);
    graphics.generateTexture('box', 60, 60);
    graphics.destroy();

    const ghostGraphics = this.add.graphics();
    ghostGraphics.fillStyle(0x3b8a7d, 1);
    ghostGraphics.fillCircle(30, 30, 30);
    ghostGraphics.lineStyle(4, 0xa3c1a0, 1);
    ghostGraphics.strokeCircle(30, 30, 23);
    ghostGraphics.generateTexture('ghost', 60, 60);
    ghostGraphics.destroy();
  }

  create() {
    this.add.text(400, 40, 'MindChallenge · Phaser', {
      fontSize: '22px',
      color: '#ead5ac',
      fontFamily: 'Georgia, serif',
    }).setOrigin(0.5);

    const particles = this.add.particles(0, 0, 'box', {
      speed: 100,
      scale: { start: 1, end: 0 },
      blendMode: 'ADD',
      lifespan: 600,
      frequency: 140,
      maxParticles: 18,
    });

    const logo = this.physics.add.image(400, 100, 'ghost');
    logo.setVelocity(100, 200);
    logo.setBounce(1, 1);
    logo.setCollideWorldBounds(true);

    particles.startFollow(logo);

    const addPiece = (x: number, y: number) => {
      if (this.pieces.length >= 24) {
        const oldest = this.pieces.shift();
        if (oldest) {
          this.tweens.killTweensOf(oldest);
          oldest.destroy();
        }
      }
      const newBox = this.physics.add.image(x, y, 'box').setScale(.65);
      this.pieces.push(newBox);
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
    };

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      addPiece(pointer.x, pointer.y);
    });
    const addKeyboardPiece = () => {
      if (this.scene.isActive()) addPiece(400, 180);
    };
    this.game.events.on('add-piece', addKeyboardPiece);
    this.game.events.on('reset-pieces', this.clearPieces, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off('reset-pieces', this.clearPieces, this);
      this.game.events.off('add-piece', addKeyboardPiece);
    });
    this.game.events.emit('demo-ready');
  }

  private clearPieces() {
    this.pieces.forEach((piece) => {
      this.tweens.killTweensOf(piece);
      piece.destroy();
    });
    this.pieces = [];
  }
}

const MemoryGame = ({ motionEnabled = true }: { motionEnabled?: boolean }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<Phaser.Game | null>(null);
  const motionRef = useRef(motionEnabled);

  useEffect(() => {
    motionRef.current = motionEnabled;
    instanceRef.current?.events.emit('motion-change');
  }, [motionEnabled]);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 400,
      parent: gameRef.current,
      backgroundColor: '#233b35',
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      input: { keyboard: false },
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
    instanceRef.current = game;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let inView = false;
    function syncMotion() {
      const shouldRun = motionRef.current && inView && !document.hidden && !reducedMotion.matches;
      if (shouldRun && game.scene.isPaused('MemoryDemoScene')) game.scene.resume('MemoryDemoScene');
      if (!shouldRun && game.scene.isActive('MemoryDemoScene')) game.scene.pause('MemoryDemoScene');
    }
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; syncMotion(); });
    observer.observe(gameRef.current);
    document.addEventListener('visibilitychange', syncMotion);
    reducedMotion.addEventListener('change', syncMotion);
    game.events.on('demo-ready', syncMotion);
    game.events.on('motion-change', syncMotion);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', syncMotion);
      reducedMotion.removeEventListener('change', syncMotion);
      instanceRef.current = null;
      game.destroy(true);
    };
  }, []);

  return (
    <div className="demo-tool">
      <div ref={gameRef} className="phaser-frame" tabIndex={0} role="region"
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            instanceRef.current?.events.emit('add-piece');
          }
        }}
        aria-label="Demonstração Phaser: clique ou pressione Enter para soltar peças no tabuleiro" />
      <button className="icon-button reset-demo" aria-label="Limpar peças da demonstração" title="Limpar peças da demonstração"
        onClick={() => instanceRef.current?.events.emit('reset-pieces')}><RotateCcw size={18} /></button>
    </div>
  );
};

export default MemoryGame;
