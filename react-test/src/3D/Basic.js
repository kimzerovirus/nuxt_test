import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import * as AMMO from 'ammo.js';

class Basic {
	constructor(target) {
		this.target = target;
		const renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setPixelRatio(window.devicePixelRatio);
		this.target.appendChild(renderer.domElement);

		renderer.shadowMap.enabled = true;
		this._renderer = renderer;

		const scene = new THREE.Scene();
		this._scene = scene;
		this._clock = new THREE.Clock();

		this._setupCamera();
		this._setupLight();
		this._setupAmmo();
		// this._setupModel();
		this._setupControls();
		this._setupShot();

		window.onresize = this.resize.bind(this);
		this.resize();

		requestAnimationFrame(this.render.bind(this));
	}

	_setupAmmo() {
		AMMO().then(Ammo => {
			const overlappingPairCache = new Ammo.btDbvtBroadphase(); // AABB 트리를 기반으로 빠르게 동적 경계 볼륨 계층 구조를 사용
			const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
			const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
			const solver = new Ammo.btSequentialImpulseConstraintSolver();

			const physicsWorld = new Ammo.btDiscreteDynamicsWorld(
				dispatcher,
				overlappingPairCache,
				solver,
				collisionConfiguration,
			);
			physicsWorld.setGravity(new Ammo.btVector3(0, -9.807, 0)); // x,y,z y축에 중력의 가속도 값인 -9.807

			this.Ammo = Ammo;
			this._physicsWorld = physicsWorld;
			this._setupModel();
		});
	}

	_setupControls() {
		new OrbitControls(this._camera, this.target);
	}

	_setupShot() {
		const raycaster = new THREE.Raycaster();
		window.addEventListener('click', e => {
			if (e.ctrlKey) {
				const width = this.target.clientWidth;
				const height = this.target.clientHeight;
				const pt = {
					x: (e.clientX / width) * 2 - 1,
					y: -(e.clientY / height) * 2 + 1,
				};

				/* 
					webgl에서 좌상단 좌표값이 -1,-1이 시작점 (화면 정중앙이 (0,0))
					브라우저는 좌상단이 0,0으로 우하단으로 갈수록 화면의 길이 만큼 커진다
					
					https://ekgoddldi.tistory.com/249
				 */
				console.log(
					pt,
					{ x: e.clientX },
					{ w: width },
					{ y: e.clientY },
					{ h: height },
					(e.clientY / height) * 2 - 1,
				);

				raycaster.setFromCamera(pt, this._camera);

				const tmpPos = new THREE.Vector3();
				tmpPos.copy(raycaster.ray.origin); // tempPosition 카메라의 위치 좌표를 담는다

				// 발사될 공의 정보
				const pos = { x: tmpPos.x, y: tmpPos.y, z: tmpPos.z }; // 공의 위치
				const radius = 0.25; // 공의 반지름
				const quat = { x: 0, y: 0, z: 0, w: 1 }; // 공의 회전값
				const mass = 1; // 공의 질량

				// 공 mesh만들기
				const ball = new THREE.Mesh(
					new THREE.SphereBufferGeometry(radius),
					new THREE.MeshStandardMaterial({
						color: 0xff0000,
						metalness: 0.7,
						roughness: 0.4,
					}),
				);

				// Scene에 공 추가
				ball.position.set(pos.x, pos.y, pos.z); // 공 위치 설정
				this._scene.add(ball);

				// 공의 물리 속성 부여
				const transform = new this.Ammo.btTransform();
				transform.setIdentity();
				transform.setOrigin(new this.Ammo.btVector3(pos.x, pos.y, pos.z));
				transform.setRotation(
					new this.Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w),
				);
				const motionState = new this.Ammo.btDefaultMotionState(transform);
				const colShape = new this.Ammo.btSphereShape(radius);
				colShape.calculateLocalInertia(mass);

				const rbInfo = new this.Ammo.btRigidBodyConstructionInfo(
					mass,
					motionState,
					colShape,
				);
				const body = new this.Ammo.btRigidBody(rbInfo);

				this._physicsWorld.addRigidBody(body);

				tmpPos.copy(raycaster.ray.direction); // 날아갈 방향을 설정
				tmpPos.multiplyScalar(20); // 속도 설정

				// 날아갈 방향과 속도를 정한다.
				body.setLinearVelocity(
					new this.Ammo.btVector3(tmpPos.x, tmpPos.y, tmpPos.z),
				);

				ball.physicsBody = body;
			}
		});
	}

	_createTable() {
		const position = { x: 0, y: -0.525, z: 0 };
		const scale = { x: 30, y: 0.5, z: 30 };

		const tableGeometry = new THREE.BoxGeometry();
		const tableMaterial = new THREE.MeshPhongMaterial({ color: 0x878787 });
		const table = new THREE.Mesh(tableGeometry, tableMaterial);

		table.position.set(position.x, position.y, position.z);
		table.scale.set(scale.x, scale.y, scale.z);

		// 그림자를 받아 표현하기
		table.receiveShadow = true;
		this._scene.add(table);

		const transform = new this.Ammo.btTransform();
		const quaternion = { x: 0, y: 0, z: 0, w: 1 }; // 회전 x
		transform.setIdentity();
		transform.setOrigin(
			new this.Ammo.btVector3(position.x, position.y, position.z), // 위치 설정
		);
		transform.setRotation(
			new this.Ammo.btQuaternion( // 회전 설정
				quaternion.x,
				quaternion.y,
				quaternion.z,
				quaternion.w,
			),
		);
		const motionState = new this.Ammo.btDefaultMotionState(transform);
		const colShape = new this.Ammo.btBoxShape( // 테이블이 박스모양이므로
			new this.Ammo.btVector3(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5), // 크기 설정
		);

		const mass = 0; // 질량 0 설정
		colShape.calculateLocalInertia(mass); // 질량이 0이면 물리적인 영향을 전혀 받지 않아 어떠한 변형도 없이 지정된 자리에 가만히 자리 잡게 된다.

		const rbInfo = new this.Ammo.btRigidBodyConstructionInfo(
			mass,
			motionState,
			colShape,
		);

		// 바디 객체 생성해서 월드에 추가
		const body = new this.Ammo.btRigidBody(rbInfo);
		this._physicsWorld.addRigidBody(body);
	}

	_createDomino() {
		// 도미노의 나선형 경로 포인트
		const controlPoints = [
			[-10, 0, -10],
			[10, 0, -10],
			[10, 0, 10],
			[-10, 0, 10],
			[-10, 0, -8],
			[8, 0, -8],
			[8, 0, 8],
			[-8, 0, 8],
			[-8, 0, -6],
			[6, 0, -6],
			[6, 0, 6],
			[-6, 0, 6],
			[-6, 0, -4],
			[4, 0, -4],
			[4, 0, 4],
			[-4, 0, 4],
			[-4, 0, -2],
			[2, 0, -2],
			[2, 0, 2],
			[-2, 0, 2],
			[-2, 0, 0],
			[0, 0, 0],
		];

		const p0 = new THREE.Vector3();
		const p1 = new THREE.Vector3();
		const curve = new THREE.CatmullRomCurve3(
			controlPoints
				.map((p, ndx) => {
					if (ndx === controlPoints.length - 1) return p0.set(...p);
					p0.set(...p);
					p1.set(...controlPoints[(ndx + 1) % controlPoints.length]);
					return [
						new THREE.Vector3().copy(p0),
						new THREE.Vector3().lerpVectors(p0, p1, 0.3),
						new THREE.Vector3().lerpVectors(p0, p1, 0.7),
					];
				})
				.flat(),
			false, // true로 하면 선이 이어진다
		);

		const points = curve.getPoints(1000);
		const geometry = new THREE.BufferGeometry().setFromPoints(points);
		const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
		const curveObject = new THREE.Line(geometry, material);

		this._scene.add(curveObject);

		// 도미노 한개의 크기
		const scale = { x: 0.75, y: 1, z: 0.1 };

		const dominoGeometry = new THREE.BoxGeometry();
		const dominoMaterial = new THREE.MeshNormalMaterial();

		const mass = 1; // 질량 설정

		const step = 0.0001;
		let length = 0.0;
		for (let t = 0; t < 1.0; t += step) {
			// 커브 상의 위치는 getPoint메서드를 통해 얻어오며,
			// 인자는 0 ~ 1의 값을 가진다
			// 0은 커브의 시작점
			// 0.5는 커브의 중간
			// 1은 커브의 마지막점
			const pt1 = curve.getPoint(t); // 커브의 t에 대한 위치
			const pt2 = curve.getPoint(t + step); // pt1 다음 위치

			length += pt1.distanceTo(pt2); // pt1과 pt2 사이의 누적거리

			// 누적거리가 0.4 이상일 때 장면에 추가한다.
			if (length > 0.4) {
				const domino = new THREE.Mesh(dominoGeometry, dominoMaterial);
				domino.position.copy(pt1);
				domino.scale.set(scale.x, scale.y, scale.z);
				domino.lookAt(pt2);

				const quaternion = new THREE.Quaternion();
				quaternion.setFromEuler(domino.rotation);

				domino.castShadow = true;
				domino.receiveShadow = true;
				this._scene.add(domino);

				// THREE.js객체와 동일하게 세팅
				const transform = new this.Ammo.btTransform();
				transform.setIdentity();
				transform.setOrigin(new this.Ammo.btVector3(pt1.x, pt1.y, pt1.z));
				transform.setRotation(
					new this.Ammo.btQuaternion(
						quaternion.x,
						quaternion.y,
						quaternion.z,
						quaternion.w,
					),
				);
				const motionState = new this.Ammo.btDefaultMotionState(transform);
				const colShape = new this.Ammo.btBoxShape(
					new this.Ammo.btVector3(scale.x * 0.5, scale.y * 0.5, scale.z * 0.5),
				);

				// 사실적인 물리효과를 위해 - 관성에 대한 속성 설정
				const localInertia = new this.Ammo.btVector3(0, 0, 0);
				colShape.calculateLocalInertia(mass, localInertia);

				// ammojs 객체 생성해서 월드에 추가
				const rbInfo = new this.Ammo.btRigidBodyConstructionInfo(
					mass,
					motionState,
					colShape,
					localInertia,
				);
				const body = new this.Ammo.btRigidBody(rbInfo);
				this._physicsWorld.addRigidBody(body);

				// body객체를 domino메쉬에 연결하여 물리객체를 참조할 수 있게 추가해준다.
				domino.physicsBody = body;

				length = 0.0;
			}
		}
	}

	_setupModel() {
		this._createTable();
		this._createDomino();
	}

	_setupCamera() {
		const camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			100,
		);

		camera.position.set(0, 20, 20);
		this._camera = camera;
	}

	_setupLight() {
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
		this._scene.add(ambientLight);

		const color = 0xffffff;
		const intensity = 0.9;
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(-10, 15, 10);
		this._scene.add(light);

		light.castShadow = true;
		light.shadow.mapSize.width = 2048;
		light.shadow.mapSize.height = 2048;

		const d = 15;
		light.shadow.camera.left = -d;
		light.shadow.camera.right = d;
		light.shadow.camera.top = d;
		light.shadow.camera.bottom = -d;
	}

	update() {
		const deltaTime = this._clock.getDelta();

		if (this._physicsWorld) {
			this._physicsWorld.stepSimulation(deltaTime);

			// traverse()함수는 scene의 child항목들을 반복적으로 검사하는 기능을 수행한다
			this._scene.traverse(obj3d => {
				if (obj3d instanceof THREE.Mesh) {
					const objThree = obj3d;
					const objAmmo = objThree.physicsBody;
					if (objAmmo) {
						// 물리객체가 물리적 특성에 의하여 변경되는 값을 받아서
						// THREE.js에 반영한다.
						const motionState = objAmmo.getMotionState();

						if (motionState) {
							let tmpTrans = this._tmpTrans;
							if (tmpTrans === undefined) {
								tmpTrans = new this.Ammo.btTransform();
								this._tmpTrans = tmpTrans;
							}
							motionState.getWorldTransform(tmpTrans);

							const pos = tmpTrans.getOrigin();
							const quat = tmpTrans.getRotation();

							objThree.position.set(pos.x(), pos.y(), pos.z());
							objThree.quaternion.set(quat.x(), quat.y(), quat.z(), quat.w());
						}
					}
				}
			});
		}
	}

	render() {
		this._renderer.render(this._scene, this._camera);
		this.update();

		requestAnimationFrame(this.render.bind(this));
	}

	resize() {
		const width = this.target.clientWidth;
		const height = this.target.clientHeight;

		this._camera.aspect = width / height;
		this._camera.updateProjectionMatrix();

		this._renderer.setSize(width, height);
	}
}

export default Basic;
