import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import testVertexShader from './shaders/test/vertex.glsl'
import testFragmentShader from './shaders/test/fragment.glsl'
import testVertex1Shader from './shaders/test/vertex1.glsl'
import testFragment1Shader from './shaders/test/fragment1.glsl'

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
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const flagTextures = textureLoader.load('/textures/sininkologo1.png')
const sininkoTextures= textureLoader.load('textures/ecriture.png')
const matcapTextures = textureLoader.load('matcaps/1.png')

/**
 * Fonts
 */
const fontLoader = new THREE.FontLoader()

fontLoader.load(
    '/fonts/helvetiker_regular.typeface.json',
    (font) =>
    {
        const textGeometry = new THREE.TextBufferGeometry(
            'COMING SOON',
            {
                font: font,
                size: 0.5,
                height: 0.05,
                curveSegments: 15,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 4
            }
        )

           
        textGeometry.computeBoundingBox()
        textGeometry.center()
       

        const material2 = new THREE.MeshMatcapMaterial(
            {
               matcap : matcapTextures,
                color : '#FDF5A6'
            })
        const text = new THREE.Mesh(textGeometry, material2)
        text.position.y = - 0.9
        text.scale.y = 1 / 2
        text.scale.x = 1 / 2

        gui.add(text.position, 'y').min(-2).max(1).step(0.1).name('positiontextY')
        gui.add(text.scale, 'x').min(0).max(1).step(0.1).name('scaleX')
         gui.add(text.scale, 'y').min(0).max(1).step(0.1).name('scaleY')
       text.castShadow = true;
		text.receiveShadow = true;
        scene.add(text)

    }
)


/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.PlaneBufferGeometry(1, 1, 32, 32)
const ecriture = new THREE.PlaneBufferGeometry(2, 1, 32, 32)

const count = geometry.attributes.position.count
const randoms = new Float32Array(count)



for (let i = 0; i < count; i++)
{
    randoms[i] = Math.random()
}

geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))


// Material
const material = new THREE.ShaderMaterial({
    vertexShader: testVertexShader,
    fragmentShader: testFragmentShader,
    uniforms: 
    {
        uFrequency:  {value: new THREE.Vector2(3, 0)},
        uTime: { value: 0},
        uColor: {value : new THREE.Color('cyan')},
        uTexture: { value: flagTextures}
    }
})

gui.add(material.uniforms.uFrequency.value, 'x').min(0).max(20).step(0.01).name('frequencyX')
gui.add(material.uniforms.uFrequency.value, 'y').min(0).max(20).step(0.01).name('frequencyY')

const material1 = new THREE.ShaderMaterial({
    vertexShader: testVertex1Shader,
    fragmentShader : testFragment1Shader,
    uniforms: 
    {
        uTime: { value: 0},
        uColor: {value : new THREE.Color('cyan')},
        uTexture: { value: sininkoTextures}
    }
})



// Mesh
const mesh = new THREE.Mesh(geometry, material)
mesh.scale.y = 2 / 3
mesh.position.y = 1
scene.add(mesh)

gui.add(mesh.position, 'y').min(- 3).max(3).step(0.01).name('elevation')

// Ecriture Sininko
const mesh1 = new THREE.Mesh(ecriture, material1)
//mesh1.position.y =  0.5
scene.add(mesh1)


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
camera.position.set(0, 0, 2.25)

scene.add(camera)

gui.add(camera.position, 'x').min(-1).max(1).step(0.25).name('cameraX')
gui.add(camera.position, 'y').min(-1).max(1).step(0.25).name('cameraY')
gui.add(camera.position, 'z').min(0).max(3).step(0.25).name('cameraZ')

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

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    //Update material
    material.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()