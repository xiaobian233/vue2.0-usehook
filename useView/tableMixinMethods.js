const removeDOM = new Map();
const removeDomClear = (_) => {
  for (let [k, v] of removeDOM) if (v.__isDom) document.body.removeChild(v);
  removeDOM.clear();
};
// 匹配默认的列表对应数据
const resposeKeyArr = ["facDrawMoneyInfoDTOIPage"];
let setLength = 0;
const createMap = (arr) => {
  const px = 150;
  const map = new Map();
  for (let i of arr) {
    if (!Array.isArray(i)) map.set(i, px);
    else if (i.length == 1) map.set(i[0], px);
    else if (i.length == 2) {
      if (!Array.isArray(i[0])) map.set(i[0], i[1]);
      else {
        i[0].map((k) => map.set(k, i[1]));
      }
    } else if (i.length == 3) {
      if (!Array.isArray(i[0]) && !isNaN(i[1]))
        map.set(i[0], i[2] ? `${i[1]}` : Number(i[1]));
      else {
        i[0].map((k) => map.set(k, i[2] ? `${i[1]}` : Number(i[1])));
      }
    } else map.set(i, px);
  }
  return map;
};
// 永久存在 - 长链接map
// [index1 = 字符 or 数组: 默认长度150, index2 = number:模糊查询, string:精准匹配, index3 = 是否开启精准匹配]
const viewMap = createMap([
  "时间",
  "到期日",
  ["编号", 180],
  ["核心企业", "120"],
  [["资金方", "当前处理人"], 120],
  ["日期", 110],
  ["操作", 200],
]);
export default {
  components: {
    Totalbubble: (_) => import("@/components/totalbubble.vue"),
    TableTitle: (_) => import("@/components/tableTitle.vue"),
  },
  data: () => ({
    isHeight: true,
    tableCheckeds: [],
    tableHeight: "400px",
    options: {
      total: 0,
      pageNum: 1,
      pageSize: 15,
    },
    isTableTitle: true,
    layerLoading: false,
    tableColumnsList: [],
    totalData: [
      // {
      // moneyTitle: "合计应还金额:", // 已设置默认值
      // money: 999999,      // 已设置默认值
      // remark: "合计应还金额:汇总您施选出来的融资申请金额" // 已设置默认值 ,
      // strokeCount: 199,   // 已设置默认值
      // moneyWan: "万",     // 已设置默认值
      // icon: true,         // 已设置默认值
      // moneyBi: "笔",      // 已设置默认值
      // },
    ],
    titleData: [
      // { label: '产品数量', num: 123 }, { label: '产品数量', num: 456 }
    ],
  }),
  methods: {
    handleSelectionChange(val) {},
    async requerHttp(url, params, resposeCallback) {
      this.layerLoading = true;
      const res = await this.$http
        .post(url, params)
        .finally((_) => (this.layerLoading = false));
      resposeCallback && resposeCallback(res);
      if (res.code == 200) {
        let r = JSON.parse(JSON.stringify(res));
        resposeKeyArr.some((x) => {
          if (x in r.data) {
            r.data = r.data[x];
            return true;
          }
        });
        this.tableColumnsList = r.data.records || [];
        Object.assign(this.options, {
          pageSize: params.size,
          pageNum: params.current,
          total: Number(r.data.total),
        });
      }
      return Promise.resolve(res);
    },
    pageChange(obj) {
      if (!this.tableChange) throw new Error("分页需要触发函数 tableChange  ");
      this.tableChange && this.tableChange(obj.cur, obj.size);
    },
    defaultRender(h, { row }, key, isN) {
      let value = row[key];
      if (value && !isNaN(value) && isN)
        value = this.formatMoney(null, null, value);
      if (typeof value == "string" && isNaN(value)) {
        try {
          let valueItem = JSON.parse(value);
          value = (valueItem.displayName && valueItem.displayName) || valueItem;
        } catch (error) {
          return value || "--";
        }
      }
      return value || "--";
    },
    getHeight() {
      if (!this.isHeight) return;
      setTimeout((_) => {
        let domsArr = [
          $(".content-wrapper"),
          $(".lls-title-box"),
          $(".sear-box-201"),
          $(".Totalbubble"),
          $(".tableTitle"),
        ];
        let heights = [];
        domsArr.forEach((dom) => {
          let [d] = dom;
          heights.push(d);
        });
        heights = heights.filter((x) => x);
        let a = [];
        let h = heights.shift()?.offsetHeight || 0;
        heights.map((x) => {
          h -= x.offsetHeight;
          a.push(x.offsetHeight);
        });
        h -= 25;
        if (h < this.tableHeight) return;
        this.$refs.llsTable.height = h + "px";
      }, 30);
    },
  },
  beforeDestroy() {
    setLength = null;
    removeDomClear();
    window.removeEventListener("resize", this.getHeight);
  },
  mounted() {
    window.addEventListener("resize", this.getHeight);
  },
};
// 样式改写 - 默认值添加
export const settableColumnsFn = function (_this) {
  const fontSize =
    removeDOM.get("fontSize") ||
    $(".content-wrapper")?.css("font-size")?.replace("px", "") ||
    16;
  const tableW = removeDOM.get("tableW") || $(".content-wrapper").width();
  const colW =
    removeDOM.get("colW") || tableW / _this.tableColumns.length + 16 || 0;
  const [item] = _this.tableColumns;
  const getLength = (arr) => {
    if (setLength > 0) return;
    arr.map((x) => {
      setLength++;
      x.children && getLength(x.children);
    });
  };
  getLength(_this.tableColumns);
  const viewWidth = (x) => {
    if (removeDOM.has(x.label))
      return (x.width = removeDOM.get(x.label).tableWidth);
    let dv = document.createElement("span");
    dv.style["z-index"] = -1;
    dv.style["opacity"] = 0;
    dv.innerHTML = x.label;
    document.body.appendChild(dv);
    x.width = dv.offsetWidth + Number(fontSize);
    dv.tableWidth = x.width;
    dv.__isDom = true;
    removeDOM.set(x.label, dv);
    dv.style["display"] = "none";
    return x;
  };
  const setWidth = (x, bol) => {
    // 默认添加宽度 !!!精准度 暂未验证!!!
    // 强制使用标签值
    if (x.viewWidth == true) return viewWidth(x);
    // % 宽度计算
    if (item && item.iswidth === true && x.label.indexOf("%") != -1 && !x.width)
      return viewWidth(x);
    // 数字 宽度计算
    if (item && item.iswidth === true && x.isN && !x.width)
      return (x.width = 150);
    // 设置 默认计算
    if (item && item.iswidth === true && !x.width && x.label && setLength > 8) {
      for (let [k, v] of viewMap) {
        if (x.label.indexOf(k) != -1) {
          if (typeof v === "string" && x.label === k) x.width = v;
          else if (typeof v !== "string") x.width = v;
          break;
        }
      }
      if (x.width) return x;
      x.width = fontSize * 1 * x.label.length + 40;
      x.width = x.width > colW ? x.width : colW + 20;
    }
    // 判断children
    if (item && item.iswidth === true && x.children && x.children.length > 0) {
      x.children.forEach((v) => setWidth(v, true));
      x.width = x.children.reduce((t, v) => (t += v.width), 0);
    }
  };
  _this.tableColumns?.forEach((x) => {
    if (!x.label) return (x.width = 55);
    if (x.minWidth) {
      x.width = x.minWidth;
      delete x.minWidth;
    }
    setWidth(x);
    if (x.width) {
      x.minWidth = x.width;
      delete x.width;
    }
  });
  removeDOM.set("fontSize", fontSize);
  removeDOM.set("tableW", tableW);
  removeDOM.set("colW", colW);
  // console.error(_this.tableColumns, 'colW', colW, 'tableW', tableW);
  return { tableW, fontSize, colW, tableColumns: _this.tableColumns };
};
export const TableHTML = function (h, childObj = {}) {
  const _this = this;
  const { TotalHTML } = childObj;
  // const [item] = _this.tableColumns
  // item.tableTitleShow = true
  // if (!TotalHTML && _this.totalData && _this.totalData.length == 0) console.warn('拥有: agm.TotalHTML 模板, 此条为自定义笔数or金额');
  // if (!TotalHTML && _this.totalData && _this.totalData.length == 0) console.warn(`提供默认展示汇总金额模板, 详情配置： this.totalData = [{
  //     moneyTitle: "合计应还金额:", // 已设置默认值
  //     money: 999999,      // 已设置默认值
  //     remark: "合计应还金额:汇总您施选出来的融资申请金额" // 已设置默认值 ,
  //     strokeCount: 199,   // 已设置默认值
  //     moneyWan: "万",     // 已设置默认值
  //     icon: true,         // 已设置默认值
  //     moneyBi: "笔",      // 已设置默认值
  // }]`);
  const columns = settableColumnsFn(_this);
  const columnFn = (arr) => {
    return arr.map((x, i) => {
      let prop = { props: x };
      !x.type &&
        (prop.scopedSlots = {
          default: (...agr) =>
            x.render
              ? x.render.call(_this, h, ...agr, x)
              : _this.defaultRender.call(_this, h, ...agr, x.prop, x.isN),
        });
      let child = (
        <lls-table-column {...prop}>
          {" "}
          {(x.children && x.children.length > 0 && columnFn(x.children)) ||
            ""}{" "}
        </lls-table-column>
      );
      let val = <lls-table-column {...prop}></lls-table-column>;
      return x.children ? child : val;
    });
  };
  return (
    <div style="padding: 0 15px">
      {this.isTableTitle && (
        <TableTitle
          data={this.titleData}
          v-on:hide={(val) => (this.hides = val)}
        />
      )}
      <lls-table
        key={this.hides["all"]}
        ref="llsTable"
        height={_this.tableHeight}
        data={_this.tableColumnsList}
        style={{ width: columns.tableW }}
        v-on:selection-change={(val) =>
          (this.tableCheckeds = val , this.handleSelectionChange(val))
        }
      >
        {_this.tableColumns && columnFn(_this.tableColumns)}
      </lls-table>
      {TotalHTML ? TotalHTML.call(_this, h) : null}
      <Totalbubble data={_this.totalData}>
        <llsPagination
          total={_this.options.total}
          pageSize={_this.options.pageSize}
          pageIndex={_this.options.pageNum}
          onchange={_this.pageChange}
        />
      </Totalbubble>
      {this.getHeight()}
    </div>
  );
};
