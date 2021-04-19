import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import { Sphere } from 'three'

// TEXTURES
const textureLoader = new THREE.TextureLoader()
const bakedShadow = textureLoader.load('/textures/bakedShadow.jpg')
const simpleShadow = textureLoader.load('textures/simpleShadow.jpg')
/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
scene.add(ambientLight)

// Directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
directionalLight.position.set(2, 2, - 1)
gui.add(directionalLight, 'intensity').min(0).max(1).step(0.001)
gui.add(directionalLight.position, 'x').min(- 5).max(5).step(0.001)
gui.add(directionalLight.position, 'y').min(- 5).max(5).step(0.001)
gui.add(directionalLight.position, 'z').min(- 5).max(5).step(0.001)
scene.add(directionalLight)

// Spot light
const spotLight = new THREE.SpotLight(0xFFFFFF, .6, 6, Math.PI / 10)
spotLight.position.set(0, 2, 3)

//scene.add(spotLight)

// Point light (shadow maps are created for every direction (like a cube map, so 6 directions))
const pointLight = new THREE.PointLight(0xFFFFFF, 0.5)
pointLight.position.set(2,1,2)

//scene.add(pointLight)

// SHADOWS
directionalLight.castShadow = true 
directionalLight.shadow.mapSize.width = 1024
directionalLight.shadow.mapSize.height = 1024
directionalLight.shadow.camera.far = 7 // you can also change the top, right, bottom, left of the cam bounds
directionalLight.shadow.camera.top = 2
directionalLight.shadow.camera.right = 2
directionalLight.shadow.camera.bottom = - 2
directionalLight.shadow.camera.left = - 2
directionalLight.shadow.radius = 4

spotLight.castShadow = true
spotLight.shadow.mapSize.width = 1024
spotLight.shadow.mapSize.height = 1024
spotLight.shadow.camera.far = 8
spotLight.shadow.camera.near = .1

pointLight.castShadow = true
pointLight.shadow.mapSize.width = 1024
pointLight.shadow.mapSize.height = 1024
pointLight.shadow.camera.far = 8

// const dirLightCamHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
// scene.add(dirLightCamHelper)

// const SpotLightHelper = new THREE.SpotLightHelper(spotLight)
// scene.add(SpotLightHelper)

// const SpotLightShadowHelper = new THREE.CameraHelper(spotLight.shadow.camera)
// scene.add(SpotLightShadowHelper)

// const pointLightCamHelper = new THREE.CameraHelper(pointLight.shadow.camera)
// scene.add(pointLightCamHelper)
/**
 * Materials
 */
const material = new THREE.MeshStandardMaterial()
material.roughness = 0.7
gui.add(material, 'metalness').min(0).max(1).step(0.001)
gui.add(material, 'roughness').min(0).max(1).step(0.001)

/**
 * Objects
 */
const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    material
)
sphere.castShadow = true // SHADOW

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 5),
    material
)
plane.rotation.x = - Math.PI * 0.5
plane.position.y = - 0.5

plane.receiveShadow = true // SHADOW

scene.add(sphere, plane)

const sphereShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.5,1.5),
    new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        alphaMap: simpleShadow
    })
)
scene.add(sphereShadow)
sphereShadow.rotation.x = - (Math.PI / 2)
sphereShadow.position.y = plane.position.y + 0.01 // offset to deal with Z fighting

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// SHADOWS -- above the objects have been modified to recieve shadows. (objects and lights)
renderer.shadowMap.enabled = false
//renderer.shadowMap.type = THREE.PCFShadowMap // edges look better but you lose the .radius prop


/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update sphere
    sphere.position.x = Math.sin(elapsedTime)
    sphere.position.z = Math.cos(elapsedTime)
    sphere.position.y = Math.abs(Math.sin(Math.sin(elapsedTime * 5)*2))
    sphereShadow.position.set(sphere.position.x, sphereShadow.position.y,sphere.position.z)
    sphereShadow.material.opacity = (1 - sphere.position.y) * 0.5

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()