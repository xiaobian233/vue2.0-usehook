import { useData } from './useData'
import { getInstall } from '.'
const Vue = getInstall()
let isOff = false
let activeThat = window.vm
// 审批流判断hook
export const useBarForm = function () {
    let bol = true
    if (!window._llsWkflTaskBarForm) {
        this.$llsAlert({ text: "请先选择审批结果后再提交" });
        bol = false
        return bol
    }
    if ('approveResult' in window._llsWkflTaskBarForm && !window._llsWkflTaskBarForm.approveResult) {
        this.$llsAlert({ text: "请选择审批结果" });
        bol = false
        return bol
    }
    let { approveResult, approveOpinions } = window._llsWkflTaskBarForm || {}
    if (approveResult != "pass") {
        if (!approveOpinions) {
            this.$llsAlert({ text: "请填写审批意见" });
            bol = false
            return bol
        }
        if ('approveOpinions' in window._llsWkflTaskBarForm && window._llsWkflTaskBarForm.approveOpinions.length > 255) {
            this.$llsAlert({
                type: "error",
                text: "审批意见最多255个字符",
            });
            bol = false
            return bol
        }
    }
    return bol
}.bind(window.vm)
export const useApprove = async function () {
    return await this.$workflowApi.workbench.commonPost(window._llsWkflTaskBarCurrent.btnUri, window._llsWkflTaskBarForm)
}.bind(window.vm)
export const useRes = function () {
    this.$llsMessage({ text: '提交成功' })
    this.$router.go(-1)
}.bind(window.vm)


// 影橡树优化hook方案
export const useSetMTree = function () {
    activeThat.$EventBus.$emit("uploadMediaFile")
    activeThat.$EventBus.$emit("deleteFileByFileId")
}

export const useGetMTree = function (callback) {
    isOff = true
    activeThat.$EventBus.$on("uploadMediaFile", activeThat.readerMedia);
    activeThat.$EventBus.$on("deleteFileByFileId", activeThat.readerMedia);
}

export const useOffMTree = function () {
    if (isOff) {
        activeThat.$EventBus.$off("uploadMediaFile", activeThat.readerMedia);
        activeThat.$EventBus.$off("deleteFileByFileId", activeThat.readerMedia);
        isOff = false
    }
}

export const useMtreeRender = function () {
    return useData({
        reflush: true,
        readerMedia: function () {
            activeThat.reflush = false;
            setTimeout(() => activeThat.reflush = true, 266);
        },
        useMtreeRender() {
            activeThat && useOffMTree()
            activeThat = this
            useGetMTree()
            return (h, { attrs, slots, emit }) => {
                return <div>{activeThat.reflush && <llsMedia ref="comp"  {...{ props: attrs }} />}</div>
            }
        },
    }, {
        provide() {
            return {
                getInstall: this,
                parentChildThis: true,
            }
        }
    })
}

import JSX from './jsx.vue'
export default JSX

