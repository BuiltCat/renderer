export interface RendererNode {
    [key: string]: any
}

export interface RendererElement extends RendererNode {}

const Text = Symbol()
const Comment = Symbol()
const Fragment = Symbol()

interface VNode {
    type: string | Text | Comment | Fragment
    children: string | VNode[]
    el?: RendererElement
    props: {
        [key: string]: any
    }
}

interface Options {
    createElement(tag: string): RendererElement
    setElement(el: RendererElement, text: string): void
    createText(text: string): RendererElement
    setText(el: RendererElement, text: string): void
    createComment(text: string): RendererElement
    insert(el: RendererElement, parent: RendererElement): void
    patchProps(
        el: RendererElement,
        key: string,
        prevValue: any,
        nextValue: any
    ): void
}

export function createRenderer(options: Options) {
    const {
        createElement,
        createComment,
        createText,
        setText,
        setElement,
        insert,
        patchProps,
    } = options

    function mountElement(vnode: VNode, container: RendererElement) {
        const el = (vnode.el = createElement(vnode.type))
        if (typeof vnode.children === 'string') {
            setElement(el, vnode.children)
        } else if (Array.isArray(vnode.children)) {
            vnode.children.forEach((c) => patch(null, c, el))
        }

        if (vnode.props) {
            for (const key in vnode.props) {
                patchProps(el, key, null, vnode.props[key])
            }
        }

        insert(el, container)
    }

    function patchChildren(n1: VNode, n2: VNode, container: RendererElement) {
        console.log(n1, n2)
        if (typeof n2.children === 'string') {
            if (Array.isArray(n1.children)) {
                n1.children.forEach((c) => unmount(c))
            }
            setElement(container, n2.children)
        } else if (Array.isArray(n2.children)) {
            if (Array.isArray(n1.children)) {
                n1.children.forEach((c) => unmount(c))
                n2.children.forEach((c) => patch(null, c, container))
            } else {
                setElement(container, '')
                n2.children.forEach((c) => patch(null, c, container))
            }
        }
    }

    function patchElement(n1: VNode, n2: VNode) {
        const el = (n2.el = n1.el)
        console.log(el)
        if (!el) return
        const newProps = n2.props
        const oldProps = n1.props
        for (const key in newProps) {
            if (newProps[key] !== oldProps[key]) {
                patchProps(el, key, oldProps[key], newProps[key])
            }
        }
        for (const key in oldProps) {
            if (key in newProps) {
                patchProps(el, key, oldProps[key], null)
            }
        }
        patchChildren(n1, n2, el)
    }

    function patch(n1: VNode | null, n2: VNode, container: RendererElement) {
        if (n1 && n1.type !== n2.type) {
            unmount(n1)
            n1 = null
        }
        const type = n2.type
        if (typeof type === 'string') {
            if (!n1) {
                mountElement(n2, container)
            } else {
                patchElement(n1, n2)
            }
        } else if (n2.type === Text) {
            if (!n1) {
                const el = (n2.el = createText(n2.children))
                insert(el, container)
            } else {
                const el = (n2.el = n1.el)
                if (el) {
                    setText(el, n2.children)
                }
            }
        } else if (n2.type === Comment) {
            if (!n1) {
                const el = (n2.el = createComment(n2.children))
                insert(el, container)
            } else {
                const el = (n2.el = n1.el)
                if (el) {
                    setText(el, n2.children)
                }
            }
        } else if (n2.type === Fragment) {
            if (!n1) {
                n2.children.forEach((c) => patch(null, c, container))
            } else {
                patchChildren(n1, n2, container)
            }
        }
    }

    function unmount(vnode: VNode) {
        const parent = vnode.el?.parentNode
        if (Array.isArray(vnode.children)) {
            vnode.children.forEach((c) => unmount(c))
            return
        }
        parent.removeChild(vnode.el)
    }

    function render(vnode: VNode | null, container: RendererElement) {
        if (vnode) {
            patch(container._vnode, vnode, container)
        } else {
            if (container._vnode) {
                unmount(container._vnode)
            }
        }
        container._vnode = vnode
    }

    return {
        render,
    }
}
