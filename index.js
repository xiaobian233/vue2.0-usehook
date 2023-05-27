export let Vue
export const getInstall = () => {
    return Vue
}
export default {
    install(_Vue) {
        Vue = _Vue
    },
}