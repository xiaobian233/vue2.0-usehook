import { getInstall } from '.'
const Vue = getInstall()
const vUseData = 'useData'
const mergeKey = '$useData'
const optionKey = '_useData'
const useReavtiveData = 'useReavtiveData'
Vue.mixin({
    beforeCreate() {
        if (this.$options[useReavtiveData]) {
            this[mergeKey] = this.$options[mergeKey]
            forEach(this.$options[optionKey], (key, val) => {
                defineProperty(this, key, this.$options[mergeKey])
            })
        }
    }
})
export const forEach = (obj, callback) => {
    Object.keys(obj).forEach(key => {
        callback(key, obj[key])
    })
}
export const _extend = Object.assign
export const hasOwn = (obj, key) => obj && (key in obj)
export const isObject = obj => typeof obj === 'object' && obj !== null
export const isString = val => typeof val === 'string'
const setter = function (key, target) {
    return function (val) {
        target._vm[vUseData][key] = val
        return target._vm[vUseData][key]
    }
}
const getter = function (key, target) {
    return function () {
        return target._vm[vUseData][key]
    }
}
const defineProperty = function (proxiTarget, key, target) {
    Object.defineProperty(proxiTarget, key, {
        get: getter(key, target),
        set: setter(key, target)
    })
}
export class VModel {
    constructor(options) {
        this._options = options
        this._vm = new Vue({ data: { [vUseData]: { ...options } } })
    }
    add(key, value) {
        this._vm.$set(this._vm[vUseData], key, value)
        this._options[key] = value
    }
}
export const useData = function (opt, vueOptions = {}, hasCreateTarget = null) {
    let o = null;
    if (!isObject(hasCreateTarget)) {
        o = {
            [useReavtiveData]: true,
            [mergeKey]: new VModel(opt),
            [optionKey]: opt,
            ...vueOptions,
            __isUse: true
        }
    } else {
        forEach(opt, (key, value) => {
            hasCreateTarget[mergeKey].add(key, value)
            _extend(hasCreateTarget[optionKey], opt)
        })
    }
    return o
}
export const mergeUseData = function (optArrs) {
    let hooks = Object.create(null)
    hooks.mergeUseData = true
    forEach(optArrs, (k, val) => {
        if (val.__isUse) _extend(hooks, val)
        else {
            let { data } = val
            delete val.data
            if (hooks[useReavtiveData]) useData(data, val, hooks)
            else {
                _extend(hooks, useData(data, val))
            }
        }

    })
    return hooks
}