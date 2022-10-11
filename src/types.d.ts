declare module '*.svg' {
    const content: any
    export default content
}

declare module '*.png' {
    const content: any
    export default content
}

declare module '*.module.scss' {
    const resource: { [key: string]: string }
    export default resource
}
