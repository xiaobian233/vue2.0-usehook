import { getInstall } from '.'
const Vue = getInstall()
export const forEach = (obj, callback) => {
    Object.keys(obj).forEach(key => {
        callback(key, obj[key])
    })
}
let setKeys = new Set()
let activeMap = new Map()
let activeThis = null
let updatedCheck = null
let extendParents = null
let symbolKey = 'useData'
const vModelKeyState = "vModelKeyState"
export const _extend = Object.assign
export const hasOwn = (obj, key) => key in obj
export const isObject = obj => typeof obj === 'object' && obj !== null
export const isString = val => typeof val === 'string'
export const tryCatch = function (callback, bol) {
    try { callback() } catch (e) {
        bol && console.error(e)
    }
}
const setter = function (key, mergeSymbolKey) {
    return function (val) {
        if (!mergeSymbolKey) this._vm[vModelKeyState][key] = val
        else this[mergeSymbolKey]._vm[vModelKeyState] && (this[mergeSymbolKey]._vm[vModelKeyState][key] = val)
    }
}
const getter = function (key, mergeSymbolKey) {
    return function () {
        if (!mergeSymbolKey) return this._vm[vModelKeyState][key]
        else return this[mergeSymbolKey]._vm && this[mergeSymbolKey]._vm[vModelKeyState] && this[mergeSymbolKey]._vm[vModelKeyState][key]
    }
}
const defineProperty = function (target, key, mergeSymbolKey) {
    Object.defineProperty(target, key, {
        get: getter(key, mergeSymbolKey),
        set: setter(key, mergeSymbolKey)
    })
}
export class VModel {
    constructor(options) {
        this._options = options
        this._vm = new Vue({ data: { [vModelKeyState]: { ...options } } })
        forEach(options, (key) => {
            defineProperty(this, key)
        })
    }
    add(key, value) {
        this._vm.$set(this._vm[vModelKeyState], key, value)
        this._options[key] = value
    }
    destroy() {
        this._vm && this._vm.destroy && this._vm.destroy()
        this._vm = null
    }
}
const hasSymbolKeyHandler = function (key) {
    if (key === symbolKey) {
        key = `$${symbolKey}`
        if (activeThis[key]) {
            forEach(activeThis[key]._options, k => {
                defineProperty(activeThis, k, key)
            })
        }
    }
}
const created = function (key, opt) {
    activeThis = this
    let $k = `$${key}`
    let k = key
    if (this.$options && this.$options[k]) this[$k] = this.$options[k]
    else if (extendParents) this[$k] = this.$parent && this.$parent[$k]
    hasSymbolKeyHandler(key)
}
const destroy = function (bol) {
    if (bol) {
        [...setKeys].forEach(k => {
            if (hasOwn(activeThis, k) && activeMap.has(k)) {
                activeMap.get(k).destroy()
                activeMap.delete(k)
            }
        })
        updatedCheck = null
    }
}
const hasKey = function (keyOrOpt, opt) {
    if (isObject(keyOrOpt)) {
        if (setKeys.has(symbolKey)) return
        else {
            _extend(opt, keyOrOpt)
            setKeys.add(symbolKey)
            return symbolKey
        }
    } else if (setKeys.has(keyOrOpt)) {
        return
    } else {
        setKeys.add(keyOrOpt)
        return keyOrOpt
    }
}
const mergeUpdeteDep = function (key, opt) {
    if (!opt || isObject(key)) {
        opt = key
        key = symbolKey
    }
    updatedCheck = activeMap.get(key)
    forEach(opt, (k, value) => {
        updatedCheck.add(k, value)
    })
}
export const useData = (keyOrOpt, opt, vueOption = {}, extendParents, beforeDestroy = true) => {
    extendParents = extendParents
    if (isObject(keyOrOpt) && opt === null || !opt) opt = {}
    let key = hasKey(keyOrOpt, opt)
    if (!key) return mergeUpdeteDep(keyOrOpt)
    updatedCheck = new VModel(opt)
    activeMap.set(key, updatedCheck)
    Vue.mixin({
        beforeCreate() {
            created.call(this, key, opt)
        },
        beforeDestroy() {
            destroy(beforeDestroy)
        }
    })
    return {
        [key]: updatedCheck,
        ...vueOption
    }
}
