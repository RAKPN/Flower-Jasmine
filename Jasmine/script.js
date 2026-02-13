const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

class Firefly {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speed = Math.random() * 0.4 + 0.2;
        this.angle = Math.random() * Math.PI * 2;
    }

    update() {
        this.angle += 0.01;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
            this.reset();
        }
 }

    draw() {
        ctx.beginPath();
        ctx.fillStyle = "rgba(255, 230, 120, 0.8)";
        ctx.shadowColor = "#ffe87a";
        ctx.shadowBlur = 15;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

const fireflies = Array.from({ length: 40 }, () => new Firefly());

class Flower {
    constructor(x, isMain = false) {
        this.x = x;
        this.baseY = canvas.height + 120;
        this.y = this.baseY;
        this.targetY = canvas.height * 0.65 + (Math.random() * 80 - 40);
        this.growth = 0;
        this.life = 1;
        this.isMain = isMain;
        this.created = Date.now();
        this.scale = isMain ? 1.4 : 0.9 + Math.random() * 0.3;
    }

    update() {
        // Grow upward
        if (this.growth < 1) {
            this.growth += 0.02;
        }

        this.y = this.baseY - (this.baseY - this.targetY) * easeOutBack(this.growth);

        // Fade temporary flowers
        if (!this.isMain && Date.now() - this.created > 4000) {
            this.life -= 0.02;
        }
    }

    draw() {
        ctx.globalAlpha = this.life;

        this.drawStem();
        this.drawLeaves();
        this.drawPetals();

        ctx.globalAlpha = 1;
    }

    drawStem() {
        ctx.strokeStyle = "#6fe3c1";
        ctx.lineWidth = 4 * this.scale;

        ctx.beginPath();
        ctx.moveTo(this.x, canvas.height);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();
    }

    drawLeaves() {
        ctx.fillStyle = "#2fbf9f";

        for (let i = 0; i < 3; i++) {
            let offset = (i + 1) * 40 * this.scale;

            drawLeaf(this.x - 10, this.y + offset, -1, this.scale);
            drawLeaf(this.x + 10, this.y + offset, 1, this.scale);
        }
    }

    drawPetals() {
        ctx.save();
        ctx.translate(this.x, this.y);

        const bloom = Math.min(this.growth * 1.2, 1);

        for (let i = 0; i < 5; i++) {
            ctx.rotate(Math.PI * 2 / 5);

            ctx.beginPath();
            ctx.fillStyle = "#ecfffb";
            ctx.shadowColor = "#b6fff0";
            ctx.shadowBlur = 20;

            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(18 * this.scale, -30 * bloom * this.scale, 0, -55 * bloom * this.scale);
            ctx.quadraticCurveTo(-18 * this.scale, -30 * bloom * this.scale, 0, 0);
            ctx.fill();
        }

         ctx.shadowBlur = 0;

        // Flower center
        let gradient = ctx.createRadialGradient(0, -10, 2, 0, 0, 12 * this.scale);
        gradient.addColorStop(0, "#fff7c2");
        gradient.addColorStop(1, "#ffd86b");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, 10 * this.scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

function drawLeaf(x, y, dir, scale) {
    ctx.beginPath();
    ctx.moveTo(x, y);

    ctx.quadraticCurveTo(
        x + 30 * dir * scale,
        y - 20 * scale,
        x,
        y - 40 * scale
    );

    ctx.quadraticCurveTo(
        x - 20 * dir * scale,
        y - 20 * scale,
        x,
        y
    );

    ctx.fill();
}

function easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;

    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function drawGrass() {
    for (let i = 0; i < canvas.width; i += 12) {
        let height = 20 + Math.sin(i * 0.05 + Date.now() * 0.002) * 8;

        ctx.strokeStyle = "#1d7a63";
        ctx.beginPath();
        ctx.moveTo(i, canvas.height);
        ctx.quadraticCurveTo(i + 4, canvas.height - height, i + 8, canvas.height);
        ctx.stroke();
    }
}

const flowers = [];

// Main flower (never disappears)
flowers.push(new Flower(canvas.width / 2, true));

// Spawn flowers on click
canvas.addEventListener("pointerdown", (e) => {
    flowers.push(new Flower(e.clientX, false));
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Fireflies
    fireflies.forEach((f) => {
        f.update();
        f.draw();
    });
// Flowers
    for (let i = flowers.length - 1; i >= 0; i--) {
        let flower = flowers[i];

        flower.update();
        flower.draw();

        if (flower.life <= 0) {
            flowers.splice(i, 1);
        }
    }

    drawGrass();

    requestAnimationFrame(animate);
}

animate();