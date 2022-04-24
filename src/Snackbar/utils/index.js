export const reflow = (node) => node.scrollTop

const ownerDocument = (node) => {
  return (node && node.ownerDocument) || document
}

export const ownerWindow = (node) => {
  const doc = ownerDocument(node)
  return doc.defaultView || window
}

// Corresponds to 10 frames at 60 Hz.
// A few bytes payload overhead when lodash/debounce is ~3 kB and debounce ~300 B.
export const debounce = (func, wait = 166) => {
  let timeout
  function debounced(...args) {
    const later = () => {
      func.apply(this, args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }

  debounced.clear = () => {
    clearTimeout(timeout)
  }

  return debounced
}
