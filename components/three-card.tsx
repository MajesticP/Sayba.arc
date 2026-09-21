"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface ThreeCardProps {
  color?: string;
  height?: number;
  className?: string;
}

export default function ThreeCard({ color = "#ea580c", height = 200, className = "" }: ThreeCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const aspect = width / height;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Card geometry
    const cardGeometry = new THREE.BoxGeometry(4, 3, 0.1, 1, 1, 1);
    const cardMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.2,
      roughness: 0.8,
      transparent: true,
      opacity: 0.95
    });
    const card = new THREE.Mesh(cardGeometry, cardMaterial);
    scene.add(card);

    // Accent border
    const borderGeometry = new THREE.BoxGeometry(4.1, 3.1, 0.05, 1, 1, 1);
    const borderMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      emissive: new THREE.Color(color),
      emissiveIntensity: 0.3,
      metalness: 0.4,
      roughness: 0.5,
      transparent: true,
      opacity: 0.8
    });
    const border = new THREE.Mesh(borderGeometry, borderMaterial);
    border.position.z = -0.05;
    scene.add(border);

    // Floating orb
    const orbGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const orbMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      emissive: new THREE.Color(color),
      emissiveIntensity: 0.5,
      metalness: 0.6,
      roughness: 0.3
    });
    const orb = new THREE.Mesh(orbGeometry, orbMaterial);
    orb.position.set(1.5, 1.2, 0.5);
    scene.add(orb);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(new THREE.Color(color), 50, 20);
    pointLight.position.set(3, 3, 3);
    scene.add(pointLight);

    camera.position.z = 6;

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    container.addEventListener('mousemove', handleMouseMove);

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Subtle rotation based on mouse
      card.rotation.y = mouseX * 0.1;
      card.rotation.x = -mouseY * 0.1;
      border.rotation.y = mouseX * 0.1;
      border.rotation.x = -mouseY * 0.1;

      // Orb float
      orb.position.y = 1.2 + Math.sin(time * 2) * 0.1;
      orb.position.x = 1.5 + Math.cos(time * 1.5) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeChild(renderer.domElement);
      cardGeometry.dispose();
      cardMaterial.dispose();
      borderGeometry.dispose();
      borderMaterial.dispose();
      orbGeometry.dispose();
      orbMaterial.dispose();
      renderer.dispose();
    };
  }, [color, height]);

  return (
    <div 
      ref={containerRef} 
      className={`overflow-hidden rounded-xl ${className}`}
      style={{ height: `${height}px` }}
    />
  );
}