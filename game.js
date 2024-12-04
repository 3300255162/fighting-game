class Player {
    constructor(gameWidth, gameHeight) {
        this.width = gameWidth * 0.06;
        this.height = this.width;
        this.x = gameWidth * 0.1;
        this.y = gameHeight * 0.85;
        this.baseY = this.y;
        this.speed = gameWidth * 0.006;
        this.jumping = false;
        this.yVelocity = 0;
        this.attacking = false;
        
        this.jumpSprite = new Image();
        this.jumpSprite.src = 'jump.png';
        
        this.idleSprite = new Image();
        this.idleSprite.src = 'player.png';
        
        this.attackSprite = new Image();
        this.attackSprite.src = 'attack.png';
        
        this.facingRight = true;
    }

    update(gravity) {
        if (this.jumping) {
            this.yVelocity += gravity;
            this.y += this.yVelocity;
            
            if (this.y > this.baseY) {
                this.y = this.baseY;
                this.jumping = false;
                this.yVelocity = 0;
            }
        }
    }

    draw(ctx) {
        let currentSprite;
        if (this.jumping) {
            currentSprite = this.jumpSprite;
        } else if (this.attacking) {
            currentSprite = this.attackSprite;
        } else {
            currentSprite = this.idleSprite;
        }
        
        if (this.facingRight) {
            ctx.drawImage(currentSprite, this.x, this.y, this.width, this.height);
        } else {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(currentSprite, -this.x - this.width, this.y, this.width, this.height);
            ctx.restore();
        }
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        
        this.gravity = this.canvas.height * 0.002;
        this.groundHeight = this.canvas.height * 0.97;
        
        this.player = new Player(this.canvas.width, this.canvas.height);
        this.keys = {};
        
        window.addEventListener('keydown', (e) => this.keys[e.key] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
        window.addEventListener('resize', () => this.handleResize());
        
        this.boundaries = {
            left: 0,
            right: this.canvas.width - this.player.width
        };
        
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.mobileControls = document.getElementById('mobileControls');
        
        if (this.isMobile) {
            this.setupMobileControls();
        }
        
        this.gameLoop();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    handleResize() {
        this.setupCanvas();
        this.gravity = this.canvas.height * 0.002;
        this.groundHeight = this.canvas.height * 0.97;
        this.boundaries.right = this.canvas.width - this.player.width;
        this.player.width = this.canvas.width * 0.06;
        this.player.height = this.player.width;
        this.player.baseY = this.canvas.height * 0.85;
        this.player.y = this.player.jumping ? this.player.y : this.player.baseY;
        this.player.speed = this.canvas.width * 0.006;
    }

    setupMobileControls() {
        const joystick = document.getElementById('joystick');
        const knob = document.getElementById('joystickKnob');
        const attackBtn = document.getElementById('attackButton');
        const jumpBtn = document.getElementById('jumpButton');
        
        let isDragging = false;
        let startX, startY;
        
        const joystickRadius = Math.min(window.innerWidth, window.innerHeight) * 0.1;
        
        joystick.addEventListener('touchstart', (e) => {
            isDragging = true;
            const touch = e.touches[0];
            const rect = knob.getBoundingClientRect();
            startX = touch.clientX - rect.left;
            startY = touch.clientY - rect.top;
            e.preventDefault();
        });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            const touch = e.touches[0];
            const x = touch.clientX - startX;
            const y = touch.clientY - startY;
            
            const distance = Math.sqrt(x * x + y * y);
            const angle = Math.atan2(y, x);
            
            const limitedDistance = Math.min(joystickRadius, distance);
            const limitedX = limitedDistance * Math.cos(angle);
            const limitedY = limitedDistance * Math.sin(angle);
            
            knob.style.transform = `translate(${limitedX}px, ${limitedY}px)`;
            
            if (limitedX < -joystickRadius * 0.3) {
                this.keys['ArrowLeft'] = true;
                this.keys['ArrowRight'] = false;
            } else if (limitedX > joystickRadius * 0.3) {
                this.keys['ArrowRight'] = true;
                this.keys['ArrowLeft'] = false;
            } else {
                this.keys['ArrowLeft'] = false;
                this.keys['ArrowRight'] = false;
            }
            
            e.preventDefault();
        });

        document.addEventListener('touchend', () => {
            isDragging = false;
            knob.style.transform = 'translate(0, 0)';
            this.keys['ArrowLeft'] = false;
            this.keys['ArrowRight'] = false;
        });

        attackBtn.addEventListener('touchstart', (e) => {
            this.keys[' '] = true;
            e.preventDefault();
        });
        
        attackBtn.addEventListener('touchend', (e) => {
            this.keys[' '] = false;
            e.preventDefault();
        });

        jumpBtn.addEventListener('touchstart', (e) => {
            this.keys['ArrowUp'] = true;
            e.preventDefault();
        });
        
        jumpBtn.addEventListener('touchend', (e) => {
            this.keys['ArrowUp'] = false;
            e.preventDefault();
        });
    }

    update() {
        if (this.keys['ArrowLeft']) {
            this.player.x = Math.max(this.boundaries.left, this.player.x - this.player.speed);
            this.player.facingRight = false;
        }
        if (this.keys['ArrowRight']) {
            this.player.x = Math.min(this.boundaries.right, this.player.x + this.player.speed);
            this.player.facingRight = true;
        }
        if (this.keys['ArrowUp'] && !this.player.jumping) {
            this.player.jumping = true;
            this.player.yVelocity = -this.canvas.height * 0.04;
        }
        if (this.keys[' ']) {
            this.player.attacking = true;
        } else {
            this.player.attacking = false;
        }

        this.player.update(this.gravity);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'green';
        this.ctx.fillRect(0, this.groundHeight, this.canvas.width, this.canvas.height - this.groundHeight);
        
        this.player.draw(this.ctx);
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

window.addEventListener('load', () => {
    new Game();
});