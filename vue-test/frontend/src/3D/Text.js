import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import fragmentShader from '../shader/fragmentShader';

import vertexShader from '../shader/vertexShader';
import * as url from '../assets/fonts/Roboto Black_Regular.json';

// 3차원 깊이값 설정하기
export default class Text {
	constructor($target) {
		this._divEl = $target;

		const renderer = new THREE.WebGLRenderer({ antialias: true }); // 안티엘리어싱 true
		renderer.setPixelRatio(window.devicePixelRatio); // 픽셀비율 설정
		this._divEl.appendChild(renderer.domElement); // 위에서 세팅해서 생성한 domElement를 자식으로 추가

		this._renderer = renderer;

		const scene = new THREE.Scene();
		this._scene = scene;

		this._setupCamera();
		this._setupLight();
		this._setupModel();
		this._setupControls(); // 마우스로 컨트롤하는 메서드

		window.onresize = this.resize.bind(this); // 창크기가 변경되면 설정값을 재설정해야된다. this가 이벤트 객체가 아닌 App클래스를 가르키도록 bind메서드 사용
		this.resize();

		// // model생성이후 실행해줘야함
		// this.animate();

		requestAnimationFrame(this.render.bind(this));
	}

	_setupControls() {
		new OrbitControls(this._camera, this._divEl); // control객체는 camera객체와 dom요소를 인자로 받는다.
	}

	_setupCamera() {
		const width = this._divEl.clientWidth;
		const height = this._divEl.clientHeight;
		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100); // 카메라 객체 생성

		// camera.position.x = 15;
		camera.position.y = -9;
		camera.position.z = 30; // 카메라 시점 위치 멀리 보내기
		this._camera = camera;
	}

	_setupLight() {
		// 광원 생성
		const color = 0xffffff;
		const intensity = 1;
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(-1, 2, 4);
		this._scene.add(light);
	}

	_setupModel() {
		const fontLoader = new FontLoader();
		async function loadFont(_this) {
			const font = fontLoader.parse(url);

			const geometry = new TextGeometry('HELLO WORLD!!!', {
				font,
				size: 6,
				height: 3,
				curveSegments: 3,
			});

			geometry.center(); // 가운데 정렬
			// geometry.scale(0.7, 0.7, 0.7);

			const shaderMaterial = new THREE.ShaderMaterial({
				uniforms: {
					time: { value: 0 },
					color: {
						type: 'vec3',
						value: new THREE.Color(0x6868ac),
					},
				},
				vertexShader: vertexShader(),
				fragmentShader: fragmentShader(),
				side: THREE.DoubleSide,
				wireframe: true,
			});

			const cube = new THREE.Mesh(geometry, shaderMaterial);

			const vertices = [];

			for (let i = 0; i < 5000; i++) {
				const x = Math.random() * 200 - 100;
				const y = Math.random() * 200 - 100;
				const z = Math.random() * 200 - 100;

				vertices.push(x, y, z);
			}

			_this._scene.add(cube);
			_this._cube = cube;
			_this._geometry = geometry;
		}

		loadFont(this);
	}

	resize() {
		// 화면 크기 재정의
		const width = this._divEl.clientWidth;
		const height = this._divEl.clientHeight;

		this._camera.aspect = width / height; // 카메라 속성값 재설정
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(width, height);
	}

	render() {
		this._renderer.render(this._scene, this._camera); // scene을 camera의 시점을 이용해서 렌더링하라는 내용?
		requestAnimationFrame(this.render.bind(this));
	}
}
