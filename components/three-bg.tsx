"use client"
import { useEffect, useRef } from "react"
import * as THREE from "three"

export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    
    // Transparent background so we can layer it
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry()
    const particlesCount = 800
    
    const posArray = new Float32Array(particlesCount * 3)
    const colorArray = new Float32Array(particlesCount * 3)
    
    // Orange color #ff914d
    const color = new THREE.Color("#ff914d")
    
    for(let i = 0; i < particlesCount * 3; i++) {
      // Spread particles widely
      posArray[i] = (Math.random() - 0.5) * 20
      
      // Assign the orange color to each vertex
      colorArray[i * 3] = color.r
      colorArray[i * 3 + 1] = color.g
      colorArray[i * 3 + 2] = color.b
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3))

    // Create a circular texture programmatically
    const canvas = document.createElement('canvas')
    canvas.width = 16
    canvas.height = 16
    const context = canvas.getContext('2d')
    if (context) {
      context.beginPath()
      context.arc(8, 8, 8, 0, Math.PI * 2)
      context.fillStyle = "white"
      context.fill()
    }
    const texture = new THREE.CanvasTexture(canvas)

    // Minimalist particle material
    const material = new THREE.PointsMaterial({
      size: 0.05,
      map: texture,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      depthWrite: false
    })

    const particlesMesh = new THREE.Points(particlesGeometry, material)
    scene.add(particlesMesh)

    // Position camera
    camera.position.z = 5

    // Mouse interaction variables
    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0
    const windowHalfX = window.innerWidth / 2
    const windowHalfY = window.innerHeight / 2

    // Event listeners
    const onDocumentMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - windowHalfX) * 0.001
      mouseY = (event.clientY - windowHalfY) * 0.001
    }

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    document.addEventListener('mousemove', onDocumentMouseMove)
    window.addEventListener('resize', handleResize)

    // Animation Loop
    const clock = new THREE.Clock()

    const animate = () => {
      requestAnimationFrame(animate)
      
      const elapsedTime = clock.getElapsedTime()

      // Gentle rotation
      particlesMesh.rotation.y = elapsedTime * 0.05
      particlesMesh.rotation.x = elapsedTime * 0.02
      
      // Sine wave undulation
      const positions = particlesMesh.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3
        const x = positions[i3]
        positions[i3 + 1] += Math.sin(elapsedTime + x) * 0.001
      }
      particlesMesh.geometry.attributes.position.needsUpdate = true

      // Mouse parallax
      targetX = mouseX * 2
      targetY = mouseY * 2
      
      particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y)
      particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x)

      renderer.render(scene, camera)
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('mousemove', onDocumentMouseMove)
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
      particlesGeometry.dispose()
      material.dispose()
      texture.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      style={{ opacity: 0.6 }}
      aria-hidden="true"
    />
  )
}
