var test = require('tape')
var createLayout = require('./')
var font = require('bmfont-lato')
var indexOf = require('indexof-property')('id')

test('should export API', function(t) {
  t.throws(createLayout.bind(null, { font: null }), 'should throw error')
  
  var xIdx = indexOf(font.chars, 'x'.charCodeAt(0))
  if (!xIdx)
    t.fail('no x character in font')
  var xGlyph = font.chars[xIdx]
  var xHeight = 20
  var baseline = 32
  var lineHeight = 38
  var descender = lineHeight - baseline
  xGlyph.height = xHeight
  xGlyph.width = 17
  xGlyph.xoffset = 2
  font.common.lineHeight = lineHeight
  font.common.base = baseline

  var layout = createLayout({
    text: 'x',
    font: font
  })

  t.equal(layout.height, lineHeight - descender, 'line height matches')
  t.equal(layout.width, xGlyph.width + xGlyph.xoffset, 'width matches')
  t.equal(layout.descender, lineHeight - baseline, 'descender matches')
  t.equal(layout.ascender, lineHeight - descender - xHeight, 'ascender matches')
  t.equal(layout.xHeight, xHeight, 'x-height matches')
  t.equal(layout.baseline, baseline, 'baseline matches')
  
  layout = createLayout({
    text: 'xx',
    font: font
  })
  var lineWidth = xGlyph.xadvance + xGlyph.width + xGlyph.xoffset
  t.equal(layout.width, lineWidth, 'calculates whole width')

  layout = createLayout({
    text: 'xx\nx',
    font: font
  })
  t.equal(layout.width, lineWidth, 'multi line width matches')

  var spacing = 4
  layout = createLayout({
    text: 'xx',
    letterSpacing: spacing,
    font: font
  })
  t.equal(layout.width, lineWidth + spacing, 'letter spacing matches')
  
  layout = createLayout({
    text: 'hx\nab',
    font: font
  })
  
  t.deepEqual(layout.glyphs.map(function (x) {
    return String.fromCharCode(x.data.id) 
  }).join(''), 'hxab', 'provides glyphs')
  
  t.deepEqual(layout.glyphs.map(function (x) {
    return x.line
  }), [ 0, 0, 1, 1 ], 'provides lines')
  
  t.deepEqual(layout.glyphs.map(function (x) {
    return x.index
  }), [ 0, 1, 3, 4 ], 'provides indices')
  t.end()
})