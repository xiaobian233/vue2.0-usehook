import SMixin from './searchBarMixin';
import methods, { TableHTML } from "./tableMixinMethods";
import { useData } from './useData'
export const useView = function (seachBar, tableColumns, vueOptions = {}) {
    let S = SMixin(seachBar)
    return useData({
        seachBar: S.seachBar,
        tableColumns,
        queryData: {},
        S,
        __isUse: true,
        __isRef: true,
        useView(h, ctx) {
            return <div>
                {this.S.SearchHTML.call(this, h)}
                {TableHTML.call(this, h)}
            </div>
        }
    }, {
        ...vueOptions,
        provide() {
            return {
                getInstall: this,
            }
        },
        mixins: [methods, ...(vueOptions.mixins ? vueOptions.mixins : [])]
    })
}