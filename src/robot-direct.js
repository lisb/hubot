'use strict'

//
// robot.coffee に対する拡張部分
//

const _map = (msg, callback) => {
  const text = msg.match[1].replace(/[\n\r]/g, ' ')
  const m = text.match(/^(今ココ|I'm here)[:：] (.*) (https?:\/\/.*)$/)
  if (!m) return

  const place = m[2].replace(/ ?\((近辺|Near)\)$/, '').replace(/^(緯度|LAT) [:：].*$/, '')
  const url = m[3]

  const cb = (err, url) => {
    if (err) console.error(err)
    if (typeof url !== 'string') url = ''

    const loc = url.match(/[@=]([0-9.]+),([0-9.]+)/) || ['', '', '']
    msg.json = { place, lat: loc[1], lng: loc[2] }
    return callback(msg)
  }

  return cb(null, url)
}

// public:
const jsonMatcher = (prop, options, callback) => {
  if (!callback) {
    callback = options
    options = {}
  }

  if (prop === 'map') {
    const regex = /((.|[\n\r])*)/
    const cb = (msg) => _map(msg, callback)
    return [regex, options, cb]
  }

  const checker = (obj) => {
    if (!obj) return false
    switch (prop) {
      case 'stamp':
        return !!obj.stamp_set && !!obj.stamp_index
      case 'original_stamp':
        return !!obj.stampset_id && !!obj.stamp_id
      case 'yesno':
        return !!obj.question && !obj.options
      case 'select':
        return !!obj.question && !!obj.options
      case 'task':
        return !!obj.title && !obj.note_id
      case 'file':
        return !!obj.file_id
      case 'note_created':
        return !!obj.note_id && !!obj.revision && obj.revision === 1
      case 'note_updated':
        return !!obj.note_id && !!obj.revision && obj.revision > 1
      case 'note_deleted':
        return !!obj.note_id && obj.revision == null
      default:
        return !!obj[prop]
    }
  }

  const regex = /({.*})/
  const cb = (msg) => {
    try {
      const json = JSON.parse(msg.match[1])
      if (checker(json)) {
        msg.json = json
        callback(msg)
      }
    } catch (e) {
      return false
    }
  }
  return [regex, options, cb]
}

module.exports = {
  jsonMatcher
}
