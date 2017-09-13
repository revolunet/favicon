const fs = require("fs")
const fetch = require("node-fetch")
const parse = require("node-html-parser").parse
const memoize = require("fast-memoize")

const isIcon = rel => rel === "shortcut icon" || rel === "icon" || rel === "Shortcut Icon"

const getIconsTag = html => parse(html).querySelectorAll("link").filter(l => isIcon(l.attributes.rel))

const getIconUrl = (icon, root) => fixUrl(icon.attributes.href, root)

const getFaviconUrl = url =>
  fetch(url).then(res => res.text()).then(html => {
    const icons = getIconsTag(html)
    if (icons.length) {
      const iconUrl = getIconUrl(icons[0], url)
      console.log(`${url}: detected ${iconUrl} :)`)
      return iconUrl
    }
    console.log(`${url}: no icon detected :/`)
    throw new Error(`${url}: no icon detected :/`)
  })

const fixUrl = (url, root) => {
  if (url.match(/^\/\//)) {
    return `https:${url}`
  } else if (url.match(/^\//)) {
    return `${root}${url}`
  }
  return url
}

const timeoutPromise = (delay = 1000) => new Promise((resolve, reject) => setTimeout(resolve, delay))

const fetchOrDie = url => Promise.race([timeoutPromise(2000), fetch(url)])

const fetchFavicon = url => getFaviconUrl(url).then(fetchOrDie).then(res => res && res.buffer())

module.exports = memoize(fetchFavicon)
