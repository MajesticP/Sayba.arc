"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface ThreeGlobeProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function ThreeGlobe({ className = "", width = 300, height = 300 }: ThreeGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Globe
    const globeGeometry = new THREE.SphereGeometry(1.5, 64, 64);
    const globeMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.3,
      roughness: 0.7
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);

    // Glowing atmosphere
    const atmGeometry = new THREE.SphereGeometry(1.65, 64, 64);
    const atmMaterial = new THREE.MeshBasicMaterial({
      color: 0xea580c,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmGeometry, atmMaterial);
    scene.add(atmosphere);

    // Grid lines on globe (lat/lon)
    const gridGroup = new THREE.Group();
    const gridMaterial = new THREE.LineBasicMaterial({
      color: 0xea580c,
      transparent: true,
      opacity: 0.3
    });

    // Latitude lines
    for (let i = -6; i <= 6; i++) {
      const phi = (i / 6) * Math.PI / 2;
      const radius = Math.cos(phi);
      const y = Math.sin(phi) * 1.5;
      const points: THREE.Vector3[] = [];
      for (let j = 0; j <= 64; j++) {
        const theta = (j / 64) * Math.PI * 2;
        points.push(new THREE.Vector3(
          radius * 1.5 * Math.cos(theta),
          y,
          radius * 1.5 * Math.sin(theta)
        ));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      gridGroup.add(new THREE.Line(geometry, gridMaterial));
    }

    // Longitude lines
    for (let i = 0; i < 12; i++) {
      const theta = (i / 12) * Math.PI * 2;
      const points: THREE.Vector3[] = [];
      for (let j = 0; j <= 64; j++) {
        const phi = (j / 64) * Math.PI;
        points.push(new THREE.Vector3(
          1.5 * Math.sin(phi) * Math.cos(theta),
          1.5 * Math.cos(phi),
          1.5 * Math.sin(phi) * Math.sin(theta)
        ));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      gridGroup.add(new THREE.Line(geometry, gridMaterial));
    }

    scene.add(gridGroup);

    // Pin markers on globe (representing project locations)
    const pins: THREE.Mesh[] = [];
    const pinCount = 8;

    for (let i = 0; i < pinCount; i++) {
      const phi = Math.acos(2 * Math.random() - 1) - Math.PI / 2;
      const theta = Math.random() * Math.PI * 2;
      
      const radius = 1.5;
      const x = radius * Math.cos(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi);
      const z = radius * Math.cos(phi) * Math.sin(theta);

      const pinGeometry = new THREE.ConeGeometry(0.08, 0.3, 8);
      const pinMaterial = new THREE.MeshStandardMaterial({
        color: 0xea580c,
        emissive: 0xea580c,
        emissiveIntensity: 0.5,
        metalness: 0.5,
        roughness: 0.3
      });
      const pin = new THREE.Mesh(pinGeometry, pinMaterial);
      
      pin.position.set(x, y, z);
      pin.lookAt(0, 0, 0);
      pin.rotateX(-Math.PI / 2);
      
      pins.push(pin);
      scene.add(pin);
    }

    // Connection arcs between pins (simplified)
    const arcMaterial = new THREE.LineBasicMaterial({
      color: 0xea580c,
      transparent: true,
      opacity: 0.4
    });

    const arcs: THREE.Line[] = [];
    for (let i = 0; i < pinCount - 1; i++) {
      const points: THREE.Vector3[] = [];
      const start = pins[i].position.clone();
      const end = pins[(i + 1) % pinCount].position.clone();
      
      for (let t = 0; t <= 1; t += 0.05) {
        const mid = new THREE.Vector3().lerpVectors(start, end, t);
        // Add height to arc
        const height = Math.sin(t * Math.PI) * 0.5;
        mid.normalize().multiplyScalar(1.5 + height);
        points.push(mid);
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const arc = new THREE.Line(geometry, arcMaterial);
      arcs.push(arc);
      scene.add(arc);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xea580c, 100, 20);
    pointLight.position.set(3, 3, 3);
    scene.add(pointLight);

    const fillLight = new THREE.PointLight(0xfbbf24, 30, 10);
    fillLight.position.set(-3, 2, -3);
    scene.add(fillLight);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // Animation
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Rotate globe slowly
      globe.rotation.y += 0.001;
      atmosphere.rotation.y += 0.001;
      gridGroup.rotation.y += 0.001;

      // Rotate pins and arcs with globe
      pins.forEach(pin => {
        pin.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.001);
      });
      arcs.forEach(arc => {
        arc.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.001);
      });

      // Atmosphere pulse
      const pulse = 1 + Math.sin(time * 2) * 0.02;
      atmosphere.scale.setScalar(pulse);

      // Mouse parallax
      globe.rotation.y += (mouseX * 0.3 - globe.rotation.y) * 0.02;
      globe.rotation.x += (-mouseY * 0.3 - globe.rotation.x) * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeChild(renderer.domElement);
      globeGeometry.dispose();
      globeMaterial.dispose();
      atmGeometry.dispose();
      atmMaterial.dispose();
      gridGroup.children.forEach(child => {
        if (child instanceof THREE.Line) {
          child.geometry.dispose();
        }
      });
      gridMaterial.dispose();
      pins.forEach(pin => {
        pin.geometry.dispose();
        const mat = pin.material;
        if (Array.isArray(mat)) mat.forEach(m => m.dispose());
        else mat.dispose();
      });
      arcs.forEach(arc => {
        arc.geometry.dispose();
      });
      arcMaterial.dispose();
      renderer.dispose();
    };
  }, [width, height]);

  return (
    <div 
      ref={containerRef} 
      className={`overflow-hidden rounded-full ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
}