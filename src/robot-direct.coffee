#
# robot.coffee に対する拡張部分
#
GOOGLE_SHORTENER_API_KEY="AIzaSyAUisTOqBoSigbgtdZDIH-2PYHpzSRYmoQ"

_map = (msg, callback) ->
  text = msg.match[1].replace(/[\n\r]/g, " ")
  m = text.match(/^(今ココ|I'm here)[:：] (.*) (https?:\/\/.*)$/)
  if m?
    place = m[2].replace(/\ ?\((近辺|Near)\)$/, "").replace(/^(緯度|LAT) [:：].*$/, "")
    url = m[3]

    cb = (url) ->
      loc = url.match(/[@=]([0-9.]+),([0-9.]+)/) or ["", "", ""]
      msg.json =
        place:place
        lat:loc[1]
        lng:loc[2]
      callback msg

    cbErr = (err) ->
      console.log err
      cb ''

    if url.indexOf("goo.gl") == -1
      cb url
    else
      msg.http("https://www.googleapis.com/urlshortener/v1/url?shortUrl=#{url}&key=#{GOOGLE_SHORTENER_API_KEY}")
        .get() (err, res, body) ->
          if err?
            cbErr err
          else
            try
              json = JSON.parse body
              if json.longUrl?
                cb json.longUrl
              else
                cbErr json
            catch ex
              cbErr ex

# public:
jsonMatcher = (prop, options, callback) ->
    if not callback?
      callback = options
      options = {}

    if prop == "map"
      regex = /((.|[\n\r])*)/
      cb = (msg) -> _map(msg, callback)
      return [regex, options, cb]

    checker = (obj) ->
      return false unless obj?
      switch prop
        when "stamp"  then obj.stamp_set? && obj.stamp_index?
        when "yesno"  then obj.question? && not obj.options?
        when "select" then obj.question? && obj.options?
        when "task"   then obj.title?
        when "file"   then obj.file_id?
        else obj[prop]?

    regex = /({.*})/
    cb = (msg) -> callback msg if checker(msg.json = try JSON.parse msg.match[1] catch e then null)
    return [regex, options, cb]

module.exports =
  jsonMatcher:jsonMatcher
