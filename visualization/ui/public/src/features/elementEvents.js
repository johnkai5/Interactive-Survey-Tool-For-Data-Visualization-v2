// Helpers for delegated event handling on the visualization.
//
// Features attach one listener to visualContainer and use these helpers to work out which SVG
// element the event was meant for, instead of adding listeners to every element. Large SVGs can
// have thousands of elements, and per-element listeners made loading and tool switching slow.
//
// This module must not import visualizer.js, which reads the DOM on import, so it can be unit tested.

/**
 * Returns the visual element an event target belongs to, or null if it is not part of the visualization.
 * A click on the <img> inside a foreignObject resolves to the foreignObject, which is the visual element.
 * @param {Element} target event target
 * @param {Element} svg root SVG element of the visualization
 * @returns {Element|null}
 */
export function findVisualElement(target, svg) {
    if (!target || !svg || typeof target.closest !== "function") return null
    const element = target.closest(".visual-element")
    if (!element || element === svg || !svg.contains(element)) return null
    return element
}

/**
 * Returns the element whose details should show while hovering target.
 * This is the innermost element under the pointer, skipping foreignObject wrappers, which never
 * had tooltip listeners. Returns null for the root SVG or anything outside it.
 * @param {Element} target event target
 * @param {Element} svg root SVG element of the visualization
 * @returns {Element|null}
 */
export function findHoverDetailTarget(target, svg) {
    if (!target || !svg || !svg.contains(target)) return null
    let element = target
    while (element && element !== svg) {
        if (!isForeignObject(element)) return element
        element = element.parentElement
    }
    return null
}

/**
 * Returns the element a click in the detail editor selects.
 * With per-element listeners, the outermost ancestor below the root SVG ran last and won, so
 * clicking a shape inside a group selects the group. Kept that way so existing labels still
 * land on the same elements.
 * @param {Element} target event target
 * @param {Element} svg root SVG element of the visualization
 * @returns {Element|null}
 */
export function findClickDetailTarget(target, svg) {
    if (!target || !svg || target === svg || !svg.contains(target)) return null
    let selected = null
    let element = target
    while (element && element !== svg) {
        if (!isForeignObject(element)) selected = element
        element = element.parentElement
    }
    return selected
}

/**
 * Wraps fn so it runs at most once per animation frame, with the most recent arguments.
 * Wheel and mousemove events can fire several times per frame, and each viewBox change makes the
 * browser repaint every element, so only the last update in a frame is worth applying.
 * @param {Function} fn
 * @param {Function} schedule frame scheduler, replaceable in tests
 * @returns {Function}
 */
export function rafThrottle(fn, schedule = (callback) => requestAnimationFrame(callback)) {
    let pending = false
    let lastArgs = []
    return (...args) => {
        lastArgs = args
        if (pending) return
        pending = true
        schedule(() => {
            pending = false
            fn(...lastArgs)
        })
    }
}

function isForeignObject(element) {
    return element.tagName === "foreignObject"
}
