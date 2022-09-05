import { RendererElement, VNode } from './types'

export function simpleDiff(
    oldChildren: VNode[],
    newChildren: VNode[],
    patch: (n1: VNode | null, n2: VNode, container: RendererElement) => void,
    unmount: (vnode: VNode) => void,
    container: RendererElement
) {
    const oldLength = oldChildren.length
    const newLength = newChildren.length
    const minLength = Math.min(oldLength, newLength)
    for (let i = 0; i < minLength; i++) {
        patch(oldChildren[i], newChildren[i], container)
    }
    if (newLength > minLength) {
        for (let i = minLength; i < newLength; i++) {
            patch(null, newChildren[i], container)
        }
    } else if (oldLength > minLength) {
        for (let i = minLength; i < oldLength; i++) {
            console.log(oldChildren[i])
            unmount(oldChildren[i])
        }
    }
}
