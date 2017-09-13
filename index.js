const fetchFavicon = require("./fetch")
const express = require("express")
const fileType = require("file-type")

const app = express()

const ROOT_URL = "https://favicon-src.now.sh"

const demoUrls = [
  "http://tesla.com",
  "http://apple.com",
  "http://twitter.com",
  "http://facebook.com",
  "http://zeit.co",
  "http://github.com",
  "http://cnn.com",
  "https://www.validator.pizza"
]

app.get("/", (req, res) => {
  res.set("Content-Type", "text/html")
  res.send(
    `
    <h3>Favicon as a service</h3>
    <p>Use <a href="">${ROOT_URL}/http://tesla.com</a></p>
    <p>See <a href="https://github.com/revolunet/favicon">https://github.com/revolunet/favicon</a></p>
    <p>&nbsp;</p>
    ${demoUrls
      .map(url => `<a href="/${url}"><img alt="${ROOT_URL}/${url}" src="/${url}" width="16"/></a>`)
      .join("\n")}
  `
  )
})

app.get("*", (req, res) => {
  const url = req.originalUrl.substring(1)
  if (url.match(/^https?:\/\//)) {
    fetchFavicon(url)
      .then(buffer => {
        if (buffer.length) {
          res.set("Content-Type", fileType(buffer).mime)
          res.send(buffer)
        } else {
          res.status(500).end()
        }
      })
      .catch(e => {
        res.status(500).end()
        console.error(e)
      })
  }
})

const PORT = process.env.PORT || 3300

app.listen(PORT, () => {
  console.log(`Running on http://127.0.0.1:${PORT}`)
})
