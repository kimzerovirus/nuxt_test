import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import * as AMMO from 'ammo.js';

class Domino {
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
			const overlappingPairCache = new Ammo.btDbvtBroadphase();
			const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
			const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
			const solver = new Ammo.btSequentialImpulseConstraintSolver();

			const physicsWorld = new Ammo.btDiscreteDynamicsWorld(
				dispatcher,
				overlappingPairCache,
				solver,
				collisionConfiguration,
			);
			physicsWorld.setGravity(new Ammo.btVector3(0, -9.807, 0));

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
			// shift 누르고 클릭하면 총알이 발사됨!!!
			if (e.shiftKey) { // ctrlKey는 맥북에서 안되는 이슈가 있음!!! 
				const width = this.target.clientWidth;
				const height = this.target.clientHeight;
				const pt = {
					x: (e.clientX / width) * 2 - 1,
					y: -(e.clientY / height) * 2 + 1,
				};

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
				tmpPos.copy(raycaster.ray.origin);

				const pos = { x: tmpPos.x, y: tmpPos.y, z: tmpPos.z };
				const radius = 0.25;
				const quat = { x: 0, y: 0, z: 0, w: 1 };
				const mass = 1;

				const ball = new THREE.Mesh(
					new THREE.SphereBufferGeometry(radius),
					new THREE.MeshStandardMaterial({
						color: 0xff0000,
						metalness: 0.7,
						roughness: 0.4,
					}),
				);

				ball.position.set(pos.x, pos.y, pos.z);
				this._scene.add(ball);

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

				tmpPos.copy(raycaster.ray.direction);
				tmpPos.multiplyScalar(20);

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

		table.receiveShadow = true;
		this._scene.add(table);

		const transform = new this.Ammo.btTransform();
		const quaternion = { x: 0, y: 0, z: 0, w: 1 };
		transform.setIdentity();
		transform.setOrigin(
			new this.Ammo.btVector3(position.x, position.y, position.z),
		);
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

		const mass = 0;
		colShape.calculateLocalInertia(mass);

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
			false,
		);

		const points = curve.getPoints(1000);
		const geometry = new THREE.BufferGeometry().setFromPoints(points);
		const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
		const curveObject = new THREE.Line(geometry, material);

		this._scene.add(curveObject);

		const scale = { x: 0.75, y: 1, z: 0.1 };

		const dominoGeometry = new THREE.BoxGeometry();
		const dominoMaterial = new THREE.MeshNormalMaterial();

		const mass = 1;

		const step = 0.0001;
		let length = 0.0;
		for (let t = 0; t < 1.0; t += step) {
			const pt1 = curve.getPoint(t);
			const pt2 = curve.getPoint(t + step);

			length += pt1.distanceTo(pt2);
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

			this._scene.traverse(obj3d => {
				if (obj3d instanceof THREE.Mesh) {
					const objThree = obj3d;
					const objAmmo = objThree.physicsBody;
					if (objAmmo) {
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

export default Domino;
