const createLayout = require('../')
const font = require('bmfont-lato/32')
const loadImage = require('img')
const uri = require('bmfont-lato/image-uri')
const mouse = require('touch-position')()
const distance = require('vectors/dist')(2)
const smoothstep = require('smoothstep')
const clamp = require('clamp')
const lerp = require('lerp')

let image 
let padding = 20
let layout
let dpr = 1 / window.devicePixelRatio
let time = 0

loadImage(uri, (err, img) => {
  if (err) throw err
  image = img
  require('canvas-testbed')(render, start)
})

function render(context, width, height, dt) {
  time += dt/1000
  context.clearRect(0, 0, width, height)
  context.fillStyle = 'gray'
  context.fillRect(0, 0, width, height)

  context.save()
  context.scale(dpr, dpr)

  // resize(width)
  renderLayout(context, image, layout)

  context.restore()
}

function start(context, width, height) {
  layout = createLayout({ font: font })
  resize(width)
}

function resize(width) {
  layout.update({
    font: font,
    width: width / dpr / 2,
    text: getCopy()
  })
}

function renderLayout(context, atlas, layout) {
  let tmp = [0, 0]

  layout.glyphs.forEach(glyph => {
    let bitmap = glyph.data
    let [ x, y ] = glyph.position

    //some characters like space/tab might be empty
    //FireFox will error out if we try clipping with 0x0 rects
    if (bitmap.width*bitmap.height === 0)
      return

    tmp[0] = x * dpr
    tmp[1] = (y + layout.height) * dpr

    //get dist from mouse
    var dist = distance(tmp, mouse)
    dist = clamp(dist / 250, 0, 1)
    dist = smoothstep(1.0, 0.0, dist)

    x += padding
    y += padding + layout.height

    let { width, height } = bitmap

    let anim = Math.sin(time) * dist / 2
    let scale = lerp(1, 0.5, Math.sin(anim*4))
    let glitch = lerp(1, 0.9, anim * (1-dist))
    width *= scale
    height *= scale
    context.globalAlpha = clamp(scale, 0, 1)

    //draw the sprite from texture atlas
    context.drawImage(atlas, 
        bitmap.x*glitch, bitmap.y*glitch, 
        bitmap.width, bitmap.height,
        x + bitmap.xoffset, y + bitmap.yoffset, 
        width, height)
  })
}

function getCopy() {
  return `Move your mouse over the text.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam sodales arcu felis, sed molestie ante faucibus a. Integer ligula est, cursus a nisl nec, tempus euismod lorem. Nullam risus felis, fringilla aliquam eros nec, condimentum pretium felis. Praesent rutrum ornare massa, ac rutrum nisl pharetra sit amet. Morbi scelerisque diam quis eleifend lacinia. Sed a porttitor leo. Aenean et vestibulum eros, id condimentum ligula. Quisque maximus, eros et bibendum tristique, enim nulla laoreet mi, molestie imperdiet felis dolor et turpis. Cras sed nunc nec tortor mollis auctor. Aenean cursus blandit metus, in viverra lacus fringilla nec. Nulla a consectetur urna. Sed scelerisque leo in arcu viverra, quis euismod leo maximus. Maecenas ultrices, ligula et malesuada volutpat, sapien nisi placerat ligula, quis dapibus eros diam vitae justo. Sed in elementum ante. Phasellus sed sollicitudin odio. Fusce iaculis tortor ut suscipit aliquam. Curabitur eu nunc id est commodo ornare eu nec arcu. Phasellus et placerat velit, ut tincidunt lorem. Sed at gravida urna. Vivamus id tristique lacus, nec laoreet dolor. Vivamus maximus quam nec consectetur aliquam. Integer condimentum nulla a elit porttitor molestie. Nullam nec dictum lacus. Curabitur rhoncus scelerisque magna ac semper. Curabitur porta est nec cursus tempus. Phasellus hendrerit ac dolor quis pellentesque. Aenean diam nisl, dapibus eget enim vitae, convallis tempor nibh. Proin sit amet ante suscipit, gravida odio ac, euismod neque. Sed sodales, leo eget congue ultricies, leo tellus euismod mauris, tempor finibus elit orci sit amet massa. Pellentesque aliquam magna a neque aliquet, ac dictum tortor dictum.

Praesent vestibulum ultricies aliquam. Morbi ut ex at nunc ultrices convallis vel et metus. Aliquam venenatis diam ut sodales tristique. Duis et facilisis ipsum. Sed sed ex dictum, mattis urna nec, dictum ex. Donec facilisis tincidunt aliquam. Sed pellentesque ullamcorper tellus nec eleifend. Mauris pulvinar mi diam, et pretium magna molestie eu. In volutpat euismod porta. Etiam a magna non dolor accumsan finibus. Suspendisse potenti. Phasellus blandit nibh vel tortor facilisis auctor.

Mauris vel iaculis libero. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Etiam et porttitor enim, eget semper ipsum. Vestibulum nec eros massa. Nullam ornare dui eget diam tincidunt tristique. Pellentesque molestie finibus pretium. Quisque in tempor elit. Fusce quis orci ut lacus cursus hendrerit. Curabitur iaculis eros et justo condimentum sodales. In massa sapien, mattis nec nibh id, sagittis semper ex. Nunc cursus sem sit amet leo maximus, vitae molestie lectus cursus.

Morbi viverra ipsum purus, eu fermentum urna tincidunt at. Maecenas feugiat, est quis feugiat interdum, est ante egestas sem, sed porttitor arcu dui quis nulla. Praesent sed auctor enim. Sed vel dolor et nunc bibendum placerat. Nunc venenatis luctus tortor, ut gravida nunc auctor semper. Suspendisse non orci ut justo iaculis pretium lobortis nec nunc. Donec non libero tellus. Mauris felis mauris, consequat sed tempus ut, tincidunt sit amet nibh. Nam pellentesque lacinia massa, quis rhoncus erat fringilla facilisis. Pellentesque nunc est, lobortis non libero vel, dapibus suscipit dui.
`.trim()
}