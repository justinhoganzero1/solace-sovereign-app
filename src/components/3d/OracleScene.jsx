import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';

export default function OracleScene({ onNavigate, currentPage }) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const oracleRef = useRef(null);
  const particlesRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffd700, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffaa00, 1, 100);
    pointLight.position.set(2, 3, 2);
    pointLight.castShadow = true;
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x00aaff, 0.5, 100);
    pointLight2.position.set(-2, 2, 3);
    scene.add(pointLight2);

    // Oracle sphere
    const geometry = new THREE.IcosahedronGeometry(1.5, 4);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffd700,
      emissive: 0xff8800,
      shininess: 100,
      wireframe: false,
    });
    const oracle = new THREE.Mesh(geometry, material);
    oracle.castShadow = true;
    oracle.receiveShadow = true;
    scene.add(oracle);
    oracleRef.current = oracle;

    // Particles around oracle
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 8;
      positions[i + 1] = (Math.random() - 0.5) * 8;
      positions[i + 2] = (Math.random() - 0.5) * 8;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffaa00,
      size: 0.1,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    particlesRef.current = particles;

    // Mouse tracking
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate oracle
      if (oracleRef.current) {
        oracleRef.current.rotation.x += 0.003;
        oracleRef.current.rotation.y += 0.005;
        oracleRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.3;
      }

      // Move oracle toward mouse
      if (oracleRef.current) {
        oracleRef.current.position.x += (mousePos.x * 2 - oracleRef.current.position.x) * 0.05;
        oracleRef.current.position.z += (mousePos.y * 2 - oracleRef.current.position.z) * 0.05;
      }

      // Rotate particles
      if (particlesRef.current) {
        particlesRef.current.rotation.x += 0.0002;
        particlesRef.current.rotation.y += 0.0003;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [mousePos]);

  return (
    <div ref={containerRef} className="w-full h-screen overflow-hidden relative bg-black">
      {/* 3D Canvas */}
      <div className="absolute inset-0" />

      {/* Floating UI Panels */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="pointer-events-auto"
        >
          <h1 className="text-6xl font-bold text-yellow-300 text-center drop-shadow-2xl">
            Friends Only
          </h1>
        </motion.div>

        {/* Navigation Widgets Floating Around Oracle */}
        {[
          { label: 'Chat', page: 'Chat', icon: '💬', top: '20%', left: '15%' },
          { label: 'Specialists', page: 'Dashboard', icon: '✨', top: '20%', right: '15%' },
          { label: 'Interpreter', page: 'Interpreter', icon: '🌐', bottom: '20%', left: '15%' },
          { label: 'Settings', page: 'Settings', icon: '⚙️', bottom: '20%', right: '15%' },
        ].map((item, idx) => (
          <motion.button
            key={item.page}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onNavigate(item.page)}
            className={`absolute px-3 py-2 rounded-lg backdrop-blur-md border-2 font-bold text-sm transition-all pointer-events-auto ${
              currentPage === item.page
                ? 'bg-yellow-500/80 border-yellow-300 text-black'
                : 'bg-amber-900/60 border-amber-400/50 text-yellow-200 hover:bg-amber-800/80'
            }`}
            style={{
              top: item.top,
              bottom: item.bottom,
              left: item.left,
              right: item.right,
            }}
          >
            <span className="mr-1">{item.icon}</span>
            <span className="hidden sm:inline">{item.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}