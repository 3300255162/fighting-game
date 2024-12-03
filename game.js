class Player {
    constructor() {
        this.x = 100;
        this.y = 340;
        this.width = 50;
        this.height = 50;
        this.speed = 5;
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

    update() {
        // 重力效果
        if (this.jumping) {
            this.yVelocity += 0.8;
            this.y += this.yVelocity;
            
            // 地面碰撞检测
            if (this.y > 340) {
                this.y = 340;
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

// 游戏主类
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.player = new Player();
        this.keys = {};
        
        // 事件监听
        window.addEventListener('keydown', (e) => this.keys[e.key] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
        
        // 添加画布边界属性
        this.boundaries = {
            left: 0,
            right: this.canvas.width - this.player.width
        };
        
        // 添加移动端控制属性
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.mobileControls = document.getElementById('mobileControls');
        
        if (this.isMobile) {
            this.mobileControls.style.display = 'block';
            this.setupMobileControls();
        }
        
        this.gameLoop();
    }

    setupMobileControls() {
        const joystick = document.getElementById('joystick');
        const knob = document.getElementById('joystickKnob');
        const attackBtn = document.getElementById('attackButton');
        const jumpBtn = document.getElementById('jumpButton');
        
        let isDragging = false;
        let startX, startY;
        
        // 摇杆控制
        joystick.addEventListener('touchstart', (e) => {
            isDragging = true;
            startX = e.touches[0].clientX - knob.offsetLeft;
            startY = e.touches[0].clientY - knob.offsetTop;
            e.preventDefault();
        });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            const x = e.touches[0].clientX - startX;
            const y = e.touches[0].clientY - startY;
            
            // 限制摇杆移动范围
            const radius = 30;
            const distance = Math.sqrt(x * x + y * y);
            const angle = Math.atan2(y, x);
            
            const limitedX = Math.min(radius, distance) * Math.cos(angle);
            const limitedY = Math.min(radius, distance) * Math.sin(angle);
            
            knob.style.left = (30 + limitedX) + 'px';
            knob.style.top = (30 + limitedY) + 'px';
            
            // 更新移动方向
            if (limitedX < -10) {
                this.keys['ArrowLeft'] = true;
                this.keys['ArrowRight'] = false;
            } else if (limitedX > 10) {
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
            knob.style.left = '30px';
            knob.style.top = '30px';
            this.keys['ArrowLeft'] = false;
            this.keys['ArrowRight'] = false;
        });

        // 攻击按钮
        attackBtn.addEventListener('touchstart', (e) => {
            this.keys[' '] = true;
            e.preventDefault();
        });
        
        attackBtn.addEventListener('touchend', (e) => {
            this.keys[' '] = false;
            e.preventDefault();
        });

        // 跳跃按钮
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
        // 移动控制
        if (this.keys['ArrowLeft']) {
            // 限左边界
            this.player.x = Math.max(this.boundaries.left, this.player.x - this.player.speed);
            this.player.facingRight = false;
        }
        if (this.keys['ArrowRight']) {
            // 限制右边界
            this.player.x = Math.min(this.boundaries.right, this.player.x + this.player.speed);
            this.player.facingRight = true;
        }
        // 跳跃控制
        if (this.keys['ArrowUp'] && !this.player.jumping) {
            this.player.jumping = true;
            this.player.yVelocity = -15;
        }
        // 攻击控制
        if (this.keys[' ']) {
            this.player.attacking = true;
        } else {
            this.player.attacking = false;
        }

        this.player.update();
    }

    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制地面
        this.ctx.fillStyle = 'green';
        this.ctx.fillRect(0, 390, this.canvas.width, 10);
        
        // 绘制玩家
        this.player.draw(this.ctx);
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 启动游戏
window.onload = () => {
    new Game();
};