import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  HostListener,
  ChangeDetectionStrategy,
  NgZone
} from '@angular/core';

import * as THREE from 'three';
// @ts-ignore – import dynamique pour garder le bundle léger


import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry, TextGeometryParameters } from 'three/examples/jsm/geometries/TextGeometry.js';


@Component({
  selector: 'app-hello-world',
  templateUrl: './hello-world.component.html',
  styleUrls: ['./hello-world.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelloWorldComponent implements AfterViewInit {
  @ViewChild('rendererCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private renderer!: THREE.WebGLRenderer;
  private scene   = new THREE.Scene();
  private camera  = new THREE.PerspectiveCamera(75, 1, 0.1, 2000);
  private controls!: OrbitControls;
  private starField!: THREE.Points;
  private textMesh!: THREE.Mesh;
  private clock = new THREE.Clock();

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    this.initRenderer();
    this.initCamera();
    this.initStars();
    this.initText();
    this.initControls();
    this.startAnimationLoop();
    window.addEventListener('resize', () => this.onResize());
  }

  /* ---------- initialisations ---------- */
  private initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.onResize();
  }

  private initCamera() {
    this.camera.position.set(0, 0, 30);
  }

  private initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.minDistance = 15;
    this.controls.maxDistance = 60;
  }

  /** nuage de particules */
  private initStars() {
    const starCount = 4000;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      positions[i] = THREE.MathUtils.randFloatSpread(600);
    }
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.8,
      color: 0xffffff,
    });

    this.starField = new THREE.Points(geom, mat);
    this.scene.add(this.starField);
  }

  /** texte 3D extrudé + matériau métal chromé */
  private async initText() {
      const font = await new Promise<Font>((resolve) => {
        new FontLoader().load('assets/fonts/helvetiker_regular.typeface.json', resolve);
      });

const params: TextGeometryParameters = {
  font,
  size: 5,
  curveSegments: 16,
  bevelEnabled: true,
  bevelThickness: 0.4,
  bevelSize: 0.2,
  bevelSegments: 4,
};

const textGeom = new TextGeometry('HELLO WORLD', params);
    textGeom.center();

    const envTexture = new THREE.CubeTextureLoader()
      .setPath('https://threejs.org/examples/textures/cube/Bridge2/')
      .load([
        'posx.jpg','negx.jpg','posy.jpg','negy.jpg','posz.jpg','negz.jpg'
      ]);
    this.scene.background = new THREE.Color(0x000000);
    this.scene.environment = envTexture;

    const mat = new THREE.MeshStandardMaterial({
      metalness: 1,
      roughness: 0,
      envMap: envTexture,
      emissive: new THREE.Color(0x00ffff),
      emissiveIntensity: 0.2,
    });

    this.textMesh = new THREE.Mesh(textGeom, mat);
    this.scene.add(this.textMesh);
  }

  /* ---------- animation ---------- */
  private startAnimationLoop() {
    this.zone.runOutsideAngular(() => {
      const animate = () => {
        const elapsed = this.clock.getElapsedTime();

        // légère pulsation / rotation du texte
        if (this.textMesh) {
          this.textMesh.rotation.y = elapsed * 0.2;
          this.textMesh.rotation.x = Math.sin(elapsed * 0.5) * 0.1;
        }

        // particules tournantes
        if (this.starField) {
          this.starField.rotation.y = elapsed * 0.02;
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(animate);
      };
      animate();
    });
  }

  /* ---------- interactions ---------- */
  @HostListener('window:resize')
  private onResize() {
    const { innerWidth: w, innerHeight: h } = window;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /** fait vibrer l’émission du texte selon la position du pointeur */
  onPointerMove(ev: MouseEvent) {
    if (!this.textMesh) return;
    const nx = (ev.clientX / window.innerWidth)  - 0.5; // -0.5 → +0.5
    const ny = (ev.clientY / window.innerHeight) - 0.5;
    const intensity = Math.sqrt(nx * nx + ny * ny) * 2;
    (this.textMesh.material as THREE.MeshStandardMaterial).emissiveIntensity =
      THREE.MathUtils.clamp(0.3 + intensity, 0.3, 1.2);
  }
}
