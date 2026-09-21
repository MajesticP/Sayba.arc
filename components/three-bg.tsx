"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();

    // Add subtle fog for depth
    scene.fog = new THREE.FogExp2(0x0f172a, 0.02); // Dark slate matching bg

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -10;
    scene.add(ground);

    // Cityscape buildings
    const buildings: THREE.Mesh[] = [];
    const buildingCount = 15;

    for (let i = 0; i < buildingCount; i++) {
      const height = Math.random() * 4 + 1; // 1-5 units
      const width = Math.random() * 2 + 0.5; // 0.5-2.5
      const depth = Math.random() * 2 + 0.5; // 0.5-2.5

      const geometry = new THREE.BoxGeometry(width, height, depth);
      
      // Building material with orange accents (emissive for windows)
      const material = new THREE.MeshStandardMaterial({
        color: 0x1e293b, // Dark slate gray
        emissive: 0xea580c, // Orange accent
        emissiveIntensity: 0.3,
        roughness: 0.7,
        metalness: 0.1
      });

      const building = new THREE.Mesh(geometry, material);
      
      // Position buildings in a loose grid
      building.position.x = (Math.random() - 0.5) * 80;
      building.position.z = (Math.random() - 0.5) * 80;
      building.position.y = height / 2 - 10; // Sit on ground
      
      // Random rotation for variety
      building.rotation.y = Math.random() * Math.PI * 0.2;
      
      scene.add(building);
      buildings.push(building);
    }

    // Add some landmark towers (taller, more prominent)
    const landmarkCount = 3;
    for (let i = 0; i < landmarkCount; i++) {
      const height = Math.random() * 6 + 4; // 4-10 units
      const width = Math.random() * 1.5 + 0.5; // 0.5-2
      const depth = Math.random() * 1.5 + 0.5; // 0.5-2

      const geometry = new THREE.BoxGeometry(width, height, depth);
      const material = new THREE.MeshStandardMaterial({
        color: 0x334155, // Slightly lighter slate
        emissive: 0xea580c,
        emissiveIntensity: 0.5,
        roughness: 0.6,
        metalness: 0.2
      });

      const tower = new THREE.Mesh(geometry, material);
      tower.position.x = (Math.random() - 0.5) * 60;
      tower.position.z = (Math.random() - 0.5) * 60;
      tower.position.y = height / 2 - 10;
      scene.add(tower);
      buildings.push(tower);
    }

    // Floating particles (orange)
    const particlesGeo = new THREE.BufferGeometry();
    const particlesCount = 150;
    const posArray = new Float32Array(particlesCount * 3);
    const scaleArray = new Float32Array(particlesCount);

    for (let i = 0; i < particlesCount; i++) {
      posArray[i * 3] = (Math.random() - 0.5) * 100;
      posArray[i * 3 + 1] = Math.random() * 30 - 10;
      posArray[i * 3 + 2] = (Math.random() - 0.5) * 100;
      
      // Random scale for depth effect
      scaleArray[i] = Math.random() * 0.5 + 0.2;
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeo.setAttribute('scale', new THREE.BufferAttribute(scaleArray, 1));

    // Create circular particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.arc(8, 8, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#ea580c"; // Orange accent
      ctx.fill();
    }
    const texture = new THREE.CanvasTexture(canvas);

    const particlesMat = new THREE.PointsMaterial({
      size: 0.2,
      map: texture,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      color: 0xea580c,
      depthWrite: false,
      sizeAttenuation: true
    });

    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xea580c, 100, 50);
    pointLight.position.set(0, 15, -10);
    scene.add(pointLight);

    // Additional fill light
    const fillLight = new THREE.PointLight(0xfbbf24, 30, 30); // Lighter orange
    fillLight.position.set(-10, 5, 10);
    scene.add(fillLight);

    // Position camera
    camera.position.z = 15;
    camera.position.y = 3;

    // Mouse interaction variables
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const onDocumentMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - windowHalfX) * 0.001;
      mouseY = (event.clientY - windowHalfY) * 0.001;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    document.addEventListener('mousemove', onDocumentMouseMove);
    window.addEventListener('resize', handleResize);

    // Store original scales for animation
    const originalScales = buildings.map(b => ({
      x: b.scale.x,
      y: b.scale.y,
      z: b.scale.z
    }));

    // Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Animate buildings with subtle pulsating scale
      buildings.forEach((building, index) => {
        const pulse = Math.sin(time * 0.3 + index) * 0.05 + 1;
        building.scale.set(
          originalScales[index].x * pulse,
          originalScales[index].y * pulse,
          originalScales[index].z * pulse
        );
        
        // Slow drift
        building.position.x += Math.sin(time * 0.1 + index) * 0.002;
        building.position.z += Math.cos(time * 0.1 + index) * 0.002;
      });

      // Animate particles - slow drift and scale pulse
      const positions = particlesGeo.attributes.position.array;
      const scales = particlesGeo.attributes.scale.array;
      for (let i = 0; i < particlesCount; i++) {
        positions[i * 3] += Math.sin(time * 0.2 + i) * 0.01;
        positions[i * 3 + 1] += Math.sin(time * 0.15 + i * 0.5) * 0.005;
        positions[i * 3 + 2] += Math.cos(time * 0.2 + i) * 0.01;
        
        // Pulse scale
        scales[i] = 0.2 + Math.sin(time * 0.5 + i) * 0.1;
      }
      particlesGeo.attributes.position.needsUpdate = true;
      particlesGeo.attributes.scale.needsUpdate = true;

      // Mouse parallax
      targetX = mouseX * 10;
      targetY = mouseY * 10;
      
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (-targetY - camera.position.y) * 0.05 + 2; // Keep base y at 2
      
      camera.lookAt(0, 0, -5);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', onDocumentMouseMove);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose geometries and materials
      groundGeometry.dispose();
      groundMaterial.dispose();
      buildings.forEach(b => {
        b.geometry.dispose();
        if (Array.isArray(b.material)) {
          b.material.forEach(m => m.dispose());
        } else {
          b.material.dispose();
        }
      });
      particlesGeo.dispose();
      particlesMat.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      style={{ opacity: 1 }}
      aria-hidden="true"
    />
  );
}