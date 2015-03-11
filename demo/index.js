const font = require('bmfont-lato/32')
const uri = require('bmfont-lato/image-uri')
const loadImage = require('img')

let padding = 20
let text = `a quick brown fox
jumped over the lazy dogs and sphinx.

kg\tyA - y. - y/ AW` //test kerning / tabs

var layout = require('../')({
  font: font,
  text: text,
  width: 300,
  letterSpacing: 0,
  align: 'left',
  lineHeight: font.common.lineHeight * 1.2,
})

let image
loadImage(uri, (err, img) => {
  if (err) throw err
  image = img
  require('canvas-testbed')(render, { once: true })
})

function render(context, width, height) {
  if (!image || !image.width)
    return

  context.clearRect(0, 0, width, height)
  context.fillStyle = 'hsl(0, 0%, 60%)'
  context.strokeStyle = 'hsl(0, 0%, 30%)'
  context.fillRect(0, 0, width, height)
  context.save()

  legend(context, padding + layout.width)
  context.translate(padding, padding+layout.height)

  context.globalAlpha = 0.5
  metrics(context)

  //now draw glyphs
  context.globalAlpha = 1
  layout.glyphs.forEach(glyph => {
    let bitmap = glyph.data
    let [ x, y ] = glyph.position

    //some characters like space/tab might be empty
    //FireFox will error out if we try clipping with 0x0 rects
    if (bitmap.width*bitmap.height === 0)
      return

    //draw the sprite from texture atlas
    context.drawImage(image, 
        bitmap.x, bitmap.y, 
        bitmap.width, bitmap.height,
        x + bitmap.xoffset, y + bitmap.yoffset, 
        bitmap.width, bitmap.height)
  })
  context.restore()
}

//draw our metrics squares
function metrics(context) {
  //x-height
  context.fillStyle = 'blue'
  context.fillRect(0, -layout.height + layout.baseline, 15, -layout.xHeight)

  //ascender
  context.fillStyle = 'pink'
  context.fillRect(27, -layout.height, 36, layout.ascender)

  //baseline
  context.fillStyle = 'orange'
  context.fillRect(120, -layout.height, 36, layout.baseline)

  //descender
  context.fillStyle = 'green'
  context.fillRect(0, 0, 30, layout.descender)

  //bounds
  context.strokeRect(0, 0, layout.width, -layout.height)
}

function legend(context, x) {
  context.save()
  context.translate(x, 0)

  ;[ 
    ['pink', 'ascender'],
    ['orange', 'baseline'],
    ['blue', 'x-height'],
    ['green', 'descender']
  ].forEach((opt, i) => {
    var [ color, name ] = opt
    context.globalAlpha = 0.5
    context.font = '16px "Georgia", sans-serif'
    context.fillStyle = color
    var y = i * 40
    context.fillRect(70, 22 + y, 20, 20)

    context.fillStyle = 'white'
    context.globalAlpha = 0.9
    context.fillText(name, 100, 40 + y)
  })
  context.restore()
}