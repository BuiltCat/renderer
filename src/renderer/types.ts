export interface RendererNode {
    [key: string]: any
}

export interface RendererElement extends RendererNode {}

export const Text = Symbol()
export const Comment = Symbol()
export const Fragment = Symbol()

export type VNodeTypes = string | typeof Text | typeof Comment | typeof Fragment
export interface VNode {
    type: VNodeTypes
    children: string | VNode[]
    el?: RendererElement
    props: {
        [key: string]: any
    }
}

export interface Options {
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
