import React, { useEffect, useRef } from 'react';
import { useLifeOSStore } from '../store/useLifeOSStore';

export default function BrutalistConfetti() {
    const canvasRef = useRef(null);
    const { triggerConfetti, setConfetti } = useLifeOSStore();

    useEffect(() => {
        if (!triggerConfetti) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Resize canvas to full screen
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        // Particle configuration
        const colors = ['#000000', '#FFE566', '#FFFFFF'];
        const particles = [];
        const particleCount = 120;

        class ConfettiParticle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = -20 - Math.random() * 100;
                this.size = Math.random() * 12 + 8; // square size (10px to 20px)
                this.color = colors[Math.floor(Math.random() * colors.length)];
                
                // Physics parameters
                this.vx = (Math.random() - 0.5) * 6;
                this.vy = Math.random() * 6 + 4;
                this.rotation = Math.random() * 360;
                this.rotationSpeed = (Math.random() - 0.5) * 4;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.rotation += this.rotationSpeed;

                // Simple wall bouncing
                if (this.x < 0 || this.x > canvas.width) {
                    this.vx *= -1;
                }
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate((this.rotation * Math.PI) / 180);
                
                // Draw rigid brutalist square confetti (no border radius!)
                ctx.fillStyle = this.color;
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2.5;
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
                ctx.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);
                
                ctx.restore();
            }
        }

        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new ConfettiParticle());
        }

        let elapsed = 0;
        const duration = 150; // frames (~2.5 seconds)

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let allBelowScreen = true;
            particles.forEach(p => {
                p.update();
                p.draw();
                if (p.y < canvas.height + 20) {
                    allBelowScreen = false;
                }
            });

            elapsed++;

            if (elapsed < duration && !allBelowScreen) {
                animationFrameId = requestAnimationFrame(render);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                setConfetti(false);
            }
        };

        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [triggerConfetti, setConfetti]);

    if (!triggerConfetti) return null;

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9999]"
            style={{ borderRadius: '0px' }}
        />
    );
}
