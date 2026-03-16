// src/components/LavaLampBackground.jsx
import { useEffect, useRef, useState, useCallback } from "react";

const LavaLampBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const blobsRef = useRef([]);

  // Initialize blobs
  useEffect(() => {
    const colors = [
      { r: 99, g: 102, b: 241, a: 0.55 },
      { r: 217, g: 70, b: 239, a: 0.5 },
      { r: 168, g: 85, b: 247, a: 0.45 },
      { r: 236, g: 72, b: 153, a: 0.48 },
      { r: 59, g: 130, b: 246, a: 0.42 },
      { r: 14, g: 165, b: 233, a: 0.4 },
    ];

    // Create initial blobs
    blobsRef.current = Array.from({ length: 10 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: 110 + Math.random() * 170,
      targetRadius: 110 + Math.random() * 170,
      color: colors[i % colors.length],
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.003 + Math.random() * 0.004,
      wobbleX: Math.random() * Math.PI * 2,
      wobbleY: Math.random() * Math.PI * 2,
      wobbleSpeedX: 0.015 + Math.random() * 0.025,
      wobbleSpeedY: 0.015 + Math.random() * 0.025,
    }));
  }, []);

  // Handle mouse move
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;
      const blobs = blobsRef.current;

      blobs.forEach((blob, index) => {
        // Calculate distance from mouse
        const dx = mouse.x - blob.x;
        const dy = mouse.y - blob.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 360;

        // Mouse interaction - push blobs away and make them grow
        if (distance < maxDistance) {
          const force = (1 - distance / maxDistance) * 2.8;
          blob.vx -= (dx / distance) * force * 0.14;
          blob.vy -= (dy / distance) * force * 0.14;
          blob.targetRadius = (110 + Math.random() * 170) * (1 + force * 0.32);
        } else {
          blob.targetRadius = 110 + Math.random() * 170;
        }

        // Smooth radius transition
        blob.radius += (blob.targetRadius - blob.radius) * 0.03;

        // Update wobble
        blob.wobbleX += blob.wobbleSpeedX;
        blob.wobbleY += blob.wobbleSpeedY;

        // Apply velocity with wobble
        blob.x += blob.vx + Math.sin(blob.wobbleX) * 0.7;
        blob.y += blob.vy + Math.cos(blob.wobbleY) * 0.7;

        // Apply friction
        blob.vx *= 0.975;
        blob.vy *= 0.975;

        // Add slight random movement
        blob.vx += (Math.random() - 0.5) * 0.07;
        blob.vy += (Math.random() - 0.5) * 0.07;

        // Boundary bounce with soft edges
        const margin = blob.radius;
        if (blob.x < margin) {
          blob.x = margin;
          blob.vx *= -0.5;
        }
        if (blob.x > canvas.width - margin) {
          blob.x = canvas.width - margin;
          blob.vx *= -0.5;
        }
        if (blob.y < margin) {
          blob.y = margin;
          blob.vy *= -0.5;
        }
        if (blob.y > canvas.height - margin) {
          blob.y = canvas.height - margin;
          blob.vy *= -0.5;
        }

        // Pulse effect
        blob.phase += blob.pulseSpeed;
        const pulseScale = 1 + Math.sin(blob.phase) * 0.14;
        const drawRadius = blob.radius * pulseScale;

        // Draw blob with radial gradient
        const gradient = ctx.createRadialGradient(
          blob.x, blob.y, 0,
          blob.x, blob.y, drawRadius
        );
        
        const { r, g, b, a } = blob.color;
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a * 0.95})`);
        gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${a * 0.65})`);
        gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${a * 0.32})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.beginPath();
        ctx.arc(blob.x, blob.y, drawRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw inner glow
        const innerGradient = ctx.createRadialGradient(
          blob.x - drawRadius * 0.2, blob.y - drawRadius * 0.2, 0,
          blob.x, blob.y, drawRadius * 0.6
        );
        innerGradient.addColorStop(0, `rgba(255, 255, 255, ${a * 0.45})`);
        innerGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

        ctx.beginPath();
        ctx.arc(blob.x, blob.y, drawRadius * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = innerGradient;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ 
        filter: "blur(28px) saturate(1.15)",
        opacity: 0.9,
      }}
    />
  );
};

export default LavaLampBackground;
