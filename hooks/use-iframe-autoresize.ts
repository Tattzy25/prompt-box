"use client"

import { useEffect } from "react"

/**
 * When the app is embedded in an iframe, posts the document's full height to the
 * parent window whenever the content changes, so the parent can resize the iframe.
 * Parent must listen for { type: "promptbox:resize", height } and set the iframe height.
 */
export function useIframeAutoResize() {
  useEffect(() => {
    if (window.parent === window) return // not embedded

    const post = () => {
      window.parent.postMessage(
        { type: "promptbox:resize", height: document.documentElement.scrollHeight },
        "*"
      )
    }

    post()
    const ro = new ResizeObserver(post)
    ro.observe(document.documentElement)
    window.addEventListener("load", post)

    return () => {
      ro.disconnect()
      window.removeEventListener("load", post)
    }
  }, [])
}
