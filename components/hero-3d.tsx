"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface HeroData {
  title: string;
  subtitle: string;
  primaryButton: { text: string; href: string };
  secondaryButton: { text: string; href: string };
  badge?: string;
}

export default function Hero3D({ data }: { data: HeroData }) {
  const [mounted, setMounted] = useState(false);

  // Show content after mount to prevent SSR mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative flex items-center justify-center overflow-hidden bg-black text-center pt-32 pb-16 md:pt-44 md:pb-24 px-2 min-h-[90vh]">
      {/* 3D WebGL Background - Cityscape */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <ThreeCityscapeBackground />
      </div>

      {/* Subtle minimalist grid background */}
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      {/* Clean elegant glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#ea580c] opacity-[0.07] blur-[150px] rounded-[100%] pointer-events-none" />

      <div className="w-full relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Badge */}
          {data.badge && (
            <div className="animate-fade-in-up stagger-1 mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] uppercase tracking-widest font-bold text-white/70 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] animate-pulse shadow-[0_0_8px_#ea580c]" />
              {data.badge}
            </div>
          )}

          {/* Title */}
          <h1 className="animate-blur-in stagger-2 text-[32px] sm:text-5xl lg:text-[72px] font-extrabold text-white tracking-tighter leading-[1.05] mb-6 drop-shadow-2xl">
            {data.title.split('SAYBA ARC').map((part, i, arr) => 
              i === arr.length - 1 ? part : <span key={i}>{part}<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ea580c] to-[#fbbf24]">SAYBA ARC</span></span>
            )}
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in-up stagger-3 text-white/60 text-sm md:text-xl leading-relaxed max-w-3xl mx-auto mb-12 font-medium">
            {data.subtitle}
          </p>

          {/* Buttons */}
          <div className="animate-fade-in-up stagger-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={data.primaryButton.href} className="group w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold bg-[#ea580c] text-white hover:bg-[#c2410c] transition-all duration-200 hover:shadow-[0_0_30px_rgba(234,88,12,0.4)] hover:-translate-y-1 text-[13px] tracking-wide uppercase">
              {data.primaryButton.text}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href={data.secondaryButton.href} className="w-full sm:w-auto px-8 py-4 rounded-full font-bold bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 hover:-translate-y-1 text-[13px] tracking-wide uppercase backdrop-blur-sm">
              {data.secondaryButton.text}
            </Link>
          </div>

          {/* Minimalist Trust Badges */}
          <div className="animate-fade-in-up stagger-5 mt-16 md:mt-24 flex justify-center gap-8 sm:gap-16 pt-8 md:pt-10 border-t border-white/[0.08]">
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-lg">50+</span>
              <span className="text-[9px] sm:text-[11px] text-white/50 uppercase tracking-[0.2em] font-bold">Proyek Selesai</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-lg">100%</span>
              <span className="text-[9px] sm:text-[11px] text-white/50 uppercase tracking-[0.2em] font-bold">Keberhasilan</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-lg">4+</span>
              <span className="text-[9px] sm:text-[11px] text-white/50 uppercase tracking-[0.2em] font-bold">Keahlian Inti</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// Separate component for the 3D background to avoid SSR issues
function ThreeCityscapeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();

    // Add subtle fog for depth
    scene.fog = new THREE.FogExp2(0x0f172a, 0.02);

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
    const buildingCount = 20;

    for (let i = 0; i < buildingCount; i++) {
      const height = Math.random() * 6 + 1;
      const width = Math.random() * 2 + 0.5;
      const depth = Math.random() * 2 + 0.5;

      const geometry = new THREE.BoxGeometry(width, height, depth);
      
      const material = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        emissive: 0xea580c,
        emissiveIntensity: 0.3,
        roughness: 0.7,
        metalness: 0.1
      });

      const building = new THREE.Mesh(geometry, material);
      building.position.x = (Math.random() - 0.5) * 100;
      building.position.z = (Math.random() - 0.5) * 100;
      building.position.y = height / 2 - 10;
      building.rotation.y = Math.random() * Math.PI * 0.2;
      
      scene.add(building);
      buildings.push(building);
    }

    // Landmark towers
    const landmarkCount = 4;
    for (let i = 0; i < landmarkCount; i++) {
      const height = Math.random() * 8 + 5;
      const width = Math.random() * 1.5 + 0.5;
      const depth = Math.random() * 1.5 + 0.5;

      const geometry = new THREE.BoxGeometry(width, height, depth);
      const material = new THREE.MeshStandardMaterial({
        color: 0x334155,
        emissive: 0xea580c,
        emissiveIntensity: 0.5,
        roughness: 0.6,
        metalness: 0.2
      });

      const tower = new THREE.Mesh(geometry, material);
      tower.position.x = (Math.random() - 0.5) * 80;
      tower.position.z = (Math.random() - 0.5) * 80;
      tower.position.y = height / 2 - 10;
      scene.add(tower);
      buildings.push(tower);
    }

    // Floating particles
    const particlesGeo = new THREE.BufferGeometry();
    const particlesCount = 200;
    const posArray = new Float32Array(particlesCount * 3);
    const scaleArray = new Float32Array(particlesCount);

    for (let i = 0; i < particlesCount; i++) {
      posArray[i * 3] = (Math.random() - 0.5) * 120;
      posArray[i * 3 + 1] = Math.random() * 40 - 10;
      posArray[i * 3 + 2] = (Math.random() - 0.5) * 120;
      scaleArray[i] = Math.random() * 0.5 + 0.2;
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeo.setAttribute('scale', new THREE.BufferAttribute(scaleArray, 1));

    // Particle texture
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

    const fillLight = new THREE.PointLight(0xfbbf24, 30, 30);
    fillLight.position.set(-10, 5, 10);
    scene.add(fillLight);

    // Camera
    camera.position.z = 15;
    camera.position.y = 3;

    // Mouse interaction
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

    // Store original scales
    const originalScales = buildings.map(b => ({
      x: b.scale.x,
      y: b.scale.y,
      z: b.scale.z
    }));

    // Animation
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Animate buildings
      buildings.forEach((building, index) => {
        const pulse = Math.sin(time * 0.3 + index) * 0.05 + 1;
        building.scale.set(
          originalScales[index].x * pulse,
          originalScales[index].y * pulse,
          originalScales[index].z * pulse
        );
        
        building.position.x += Math.sin(time * 0.1 + index) * 0.002;
        building.position.z += Math.cos(time * 0.1 + index) * 0.002;
      });

      // Animate particles
      const positions = particlesGeo.attributes.position.array;
      const scales = particlesGeo.attributes.scale.array;
      for (let i = 0; i < particlesCount; i++) {
        positions[i * 3] += Math.sin(time * 0.2 + i) * 0.01;
        positions[i * 3 + 1] += Math.sin(time * 0.15 + i * 0.5) * 0.005;
        positions[i * 3 + 2] += Math.cos(time * 0.2 + i) * 0.01;
        scales[i] = 0.2 + Math.sin(time * 0.5 + i) * 0.1;
      }
      particlesGeo.attributes.position.needsUpdate = true;
      particlesGeo.attributes.scale.needsUpdate = true;

      // Mouse parallax
      targetX = mouseX * 10;
      targetY = mouseY * 10;
      
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (-targetY - camera.position.y) * 0.05 + 2;
      
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