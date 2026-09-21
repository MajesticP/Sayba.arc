"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeParticlesBg() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    // Don't init if container has zero width
    if (container.clientWidth === 0) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.02);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Flowing lines
    const lineGroup = new THREE.Group();
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xea580c,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending
    });

    const lines: THREE.Line[] = [];
    const lineCount = 30;

    for (let i = 0; i < lineCount; i++) {
      const points: THREE.Vector3[] = [];
      const z = (Math.random() - 0.5) * 40;
      const yOffset = (Math.random() - 0.5) * 10;
      
      for (let x = -50; x <= 50; x += 2) {
        points.push(new THREE.Vector3(x, yOffset + Math.sin(x * 0.1 + i) * 2, z));
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, lineMaterial);
      lines.push(line);
      lineGroup.add(line);
    }
    scene.add(lineGroup);

    // Floating particles
    const particlesGeo = new THREE.BufferGeometry();
    const particlesCount = 200;
    const posArray = new Float32Array(particlesCount * 3);
    const speedArray = new Float32Array(particlesCount);

    for (let i = 0; i < particlesCount; i++) {
      posArray[i * 3] = (Math.random() - 0.5) * 100;
      posArray[i * 3 + 1] = (Math.random() - 0.5) * 30;
      posArray[i * 3 + 2] = (Math.random() - 0.5) * 40;
      
      speedArray[i] = Math.random() * 0.02 + 0.005;
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.arc(8, 8, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#ea580c";
      ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);

    const particlesMat = new THREE.PointsMaterial({
      size: 0.3,
      map: texture,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      color: 0xea580c,
      depthWrite: false,
    });

    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    camera.position.z = 20;

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Animate lines
      lines.forEach((line, i) => {
        const positions = line.geometry.attributes.position.array;
        for (let j = 0; j < positions.length; j += 3) {
          const x = positions[j];
          // Update Y based on sine wave moving over time
          positions[j + 1] = Math.sin(x * 0.05 + time * 0.5 + i) * 3 + (i % 5 - 2) * 2;
        }
        line.geometry.attributes.position.needsUpdate = true;
      });

      // Animate particles (floating up and drifting)
      const positions = particlesGeo.attributes.position.array;
      for (let i = 0; i < particlesCount; i++) {
        // Y position
        positions[i * 3 + 1] += speedArray[i];
        
        // X drift
        positions[i * 3] += Math.sin(time * 0.5 + i) * 0.01;
        
        // Reset if too high
        if (positions[i * 3 + 1] > 20) {
          positions[i * 3 + 1] = -20;
        }
      }
      particlesGeo.attributes.position.needsUpdate = true;
      
      // Gentle camera sway
      camera.position.x = Math.sin(time * 0.2) * 2;
      camera.position.y = Math.cos(time * 0.15) * 1;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      lines.forEach(line => line.geometry.dispose());
      lineMaterial.dispose();
      particlesGeo.dispose();
      particlesMat.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none mix-blend-screen"
      aria-hidden="true"
    />
  );
}