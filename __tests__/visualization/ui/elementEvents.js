/**
 * @jest-environment jsdom
 */
const {
    findVisualElement,
    findHoverDetailTarget,
    findClickDetailTarget,
    rafThrottle
} = require('../../../visualization/ui/public/src/features/elementEvents.js')

let svg, group, rect, path, foreignObject, img, outside

beforeEach(() => {
    document.body.innerHTML = `
        <div id="visual-container">
            <svg id="root">
                <g id="group">
                    <rect id="rect" class="visual-element"></rect>
                    <path id="path"></path>
                </g>
                <foreignObject id="fo" class="visual-element"><img id="img"></foreignObject>
            </svg>
        </div>
        <div id="outside" class="visual-element"></div>
    `
    svg = document.getElementById('root')
    group = document.getElementById('group')
    rect = document.getElementById('rect')
    path = document.getElementById('path')
    foreignObject = document.getElementById('fo')
    img = document.getElementById('img')
    outside = document.getElementById('outside')
})

describe('findVisualElement', () => {
    test('returns the clicked visual element', () => {
        expect(findVisualElement(rect, svg)).toBe(rect)
    })

    test('resolves an image inside a foreignObject to the foreignObject', () => {
        expect(findVisualElement(img, svg)).toBe(foreignObject)
    })

    test('returns null for elements that are not visual elements', () => {
        expect(findVisualElement(path, svg)).toBeNull()
        expect(findVisualElement(group, svg)).toBeNull()
    })

    test('returns null for the root svg and for elements outside it', () => {
        svg.classList.add('visual-element')
        expect(findVisualElement(svg, svg)).toBeNull()
        expect(findVisualElement(outside, svg)).toBeNull()
    })

    test('returns null for missing arguments or non-element targets', () => {
        expect(findVisualElement(null, svg)).toBeNull()
        expect(findVisualElement(rect, null)).toBeNull()
        expect(findVisualElement(document.createTextNode('x'), svg)).toBeNull()
    })
})

describe('findHoverDetailTarget', () => {
    test('returns the innermost hovered element', () => {
        expect(findHoverDetailTarget(rect, svg)).toBe(rect)
        expect(findHoverDetailTarget(group, svg)).toBe(group)
    })

    test('keeps the image inside a foreignObject but skips the foreignObject itself', () => {
        expect(findHoverDetailTarget(img, svg)).toBe(img)
        expect(findHoverDetailTarget(foreignObject, svg)).toBeNull()
    })

    test('returns null for the root svg and for elements outside it', () => {
        expect(findHoverDetailTarget(svg, svg)).toBeNull()
        expect(findHoverDetailTarget(outside, svg)).toBeNull()
        expect(findHoverDetailTarget(null, svg)).toBeNull()
    })
})

describe('findClickDetailTarget', () => {
    test('selects the outermost ancestor below the svg, as the old per-element listeners did', () => {
        expect(findClickDetailTarget(rect, svg)).toBe(group)
        expect(findClickDetailTarget(group, svg)).toBe(group)
    })

    test('skips the foreignObject when walking up from its image', () => {
        expect(findClickDetailTarget(img, svg)).toBe(img)
        expect(findClickDetailTarget(foreignObject, svg)).toBeNull()
    })

    test('returns null for the root svg and for elements outside it', () => {
        expect(findClickDetailTarget(svg, svg)).toBeNull()
        expect(findClickDetailTarget(outside, svg)).toBeNull()
        expect(findClickDetailTarget(null, svg)).toBeNull()
    })
})

describe('rafThrottle', () => {
    let queued
    const schedule = (callback) => queued.push(callback)
    const runFrame = () => queued.splice(0).forEach(callback => callback())

    beforeEach(() => {
        queued = []
    })

    test('runs once per frame with the latest arguments', () => {
        const fn = jest.fn()
        const throttled = rafThrottle(fn, schedule)

        throttled(1, 2)
        throttled(3, 4)
        throttled(5, 6)
        expect(fn).not.toHaveBeenCalled()
        expect(queued).toHaveLength(1)

        runFrame()
        expect(fn).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenCalledWith(5, 6)
    })

    test('schedules again after a frame has run', () => {
        const fn = jest.fn()
        const throttled = rafThrottle(fn, schedule)

        throttled('a')
        runFrame()
        throttled('b')
        runFrame()

        expect(fn.mock.calls).toEqual([['a'], ['b']])
    })

    test('uses requestAnimationFrame by default', () => {
        const fn = jest.fn()
        const raf = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
            callback(0)
            return 1
        })

        rafThrottle(fn)('x')

        expect(raf).toHaveBeenCalledTimes(1)
        expect(fn).toHaveBeenCalledWith('x')
        raf.mockRestore()
    })
})
