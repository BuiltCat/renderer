import { createRenderer, RendererElement } from './renderer'

const container = document.querySelector('#root')

function shouldSetAsprops(el: RendererElement, key: string) {
    if (el.tagName === 'INPUT' && key === 'from') return false
    return key in el
}

const renderer = createRenderer({
    createElement(tag) {
        return document.createElement(tag)
    },
    createText(text) {
        return document.createTextNode(text)
    },
    createComment(text) {
        return document.createComment(text)
    },
    setText(el, text) {
        el.nodeValue = text
    },
    setElement(el, text) {
        el.textContent = text
    },
    insert(el, parent) {
        parent.insertBefore(el, null)
    },
    patchProps(el, key, prevValue, nextValue) {
        if (/^on/.test(key)) {
            let invokers = el._vei || (el._vei = {})
            const name = key.slice(2).toLowerCase()
            let invoker = invokers[name]
            if (nextValue) {
                if (!invoker) {
                    invoker = (e: any) => {
                        if (e.timeStamp < invoker.attached) return
                        if (Array.isArray(invoker.value)) {
                            invoker.value.forEach((fn: any) => fn(e))
                        } else {
                            invoker.value(e)
                        }
                    }
                    invoker.value = nextValue
                    invoker.attached = performance.now()
                    el.addEventListener(name, invoker)
                } else if (invoker) {
                    invoker.value = nextValue
                }
            } else {
                el.removeEventListener(name, invoker)
            }
        } else if (key === 'class') {
            el.className = nextValue || ''
        } else if (shouldSetAsprops(el, key)) {
            const type = typeof el[key]
            if (type === 'boolean' && nextValue === '') {
                el[key] = true
            } else {
                el[key] = nextValue
            }
        } else {
            el.setAttribute(key, nextValue)
        }
    },
})

window.reRender = function () {
    container &&
        renderer.render(
            {
                type: 'ul',
                children: [
                    {
                        type: 'li',
                        children: '123',
                        props: {
                            class: 'text',
                            onclick(e) {
                                console.log(e)
                            },
                        },
                    },
                    {
                        type: 'li',
                        children: '123',
                        props: {},
                    },
                ],
                props: {},
            },
            container
        )
}
window.unmount = function () {
    container && renderer.render(null, container)
}
