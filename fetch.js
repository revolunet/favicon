const fs = require("fs")
const fetch = require("node-fetch")
const parse = require("node-html-parser").parse
const memoize = require("fast-memoize")

const isIcon = rel => (rel === "shortcut icon" || rel === "icon" || rel === "Shortcut Icon")

const getIconsTag = html =>
  parse(html)
    .querySelectorAll("link")
    .filter(
      l => isIcon(l.attributes.rel)
    )

const getIconUrl = (icon, root) => fixUrl(icon.attributes.href, root)

const getFaviconUrl = url =>
  fetch(url).then(res => res.text()).then(html => {
    const icons = getIconsTag(html)
    if (icons.length) {
      const iconUrl = getIconUrl(icons[0], url)
      console.log("iconUrl", iconUrl)
      return iconUrl
    } else {
      console.log("html", html)
      console.log("no icon detected :/")
    }
    throw "no icon detected :/"
  })

const fixUrl = (url, root) => {
  if (url.match(/^\/\//)) {
    return `https:${url}`
  } else if (url.match(/^\//)) {
    return `${root}${url}`
  }
  return url
}

const FALLBACK_ICON = fs.readFileSync("./default.png")

const fetchFavicon = url =>
  getFaviconUrl(url).then(iconUrl => fetch(iconUrl)).then(res => res.buffer()).catch(e => {
    console.log("e", e)
    return FALLBACK_ICON
  })

module.exports = memoize(fetchFavicon)
