export default function (barlist, htmlFn) {
  const seachBar = barlist;
  const searchBarkey = seachBar.map((x) => x.key);
  let that = null;
  const varName = (_) => [that, that?.queryData || undefined];
  const constKey = "%AE86%";
  /** animate start **/
  const defailtStyle = {
    color: "#0887FF",
    cursor: "pointer",
    transition: "all 0.2s",
  };
  const cupStyle = {
    transform: "rotate(-90deg)",
  };
  const upStyle = {
    transform: "rotate(90deg)",
  };
  const downUpTransitionClick = function (e) {
    const _t = $(e.target);
    let key = _t.attr("attr");
    _t.attr("attr", key == "down" ? "up" : "down");
    _t.css(key == "down" ? upStyle : cupStyle);
    setTimeout(rotateDeg, 200);
  };
  const rotateDeg = function () {
    vm.$nextTick((_) => {
      if (!$("#downUpTransition")) return;
      const val = $("#downUpTransition").attr("attr");
      if (!val) return false;
      const [_this] = varName();
      const amiteTime = 188;
      const cHtml = $("#createHTML");
      const down = (_) => {
        if (cHtml.children().length == _this.seachBar.length) {
          const childrenW = [];
          let num = 0;
          let cHtmlW = cHtml.outerWidth(true);
          cHtml.children().map((i, x) => {
            childrenW.push({
              x: $(x),
              w: $(x).outerWidth(true),
            });
            num += $(x).outerWidth(true);
          });
          $("#downUpTransition").show();
          if (num <= cHtmlW) $("#downUpTransition").hide();
          childrenW.forEach((x) => {
            cHtmlW = cHtmlW - x.w;
            if (cHtmlW <= 0) x.x.slideUp(amiteTime);
            else x.x.show();
          });
        }
      };
      const up = (_) => {
        if (cHtml.children().length == _this.seachBar.length) {
          cHtml.children().each((i, x) => {
            $(x).slideDown(amiteTime);
          });
        }
      };
      const r = { down, up };
      r[val]();
      $("#downUpTransition").css({
        ...defailtStyle,
        ...(val == "down" ? cupStyle : upStyle),
      });
    });
    return "";
  };
  $(window).on("resize", rotateDeg);
  /** animate end **/
  /** seatchJs start **/
  const searchBarUrl = function (data, obj = {}, type) {
    if (obj != "[object Object]") {
      type = obj;
      obj = {};
    }
    let str = "";
    let o = {};
    Object.keys(data).forEach((k) => {
      let v = data[k] || "";
      let vv = "";
      if (obj[k]) {
        let v2 = obj[k];
        o = {
          ...o,
          ...v2,
        };
        Object.keys(v2).forEach((x) => {
          str += `${x}=${v2[x] || ""}&`;
        });
        return false;
      }
      o[k] = v;
      if (toString.call(v) == "[object Object]") {
        let s = "";
        Object.keys(v).map((x) => (s += `${x}${constKey}${v[x]}${constKey}`));
        vv = s;
      }
      str += `${k}=${vv || v}&`;
    });
    str = str.slice(0, str.length - 1);
    // console.error('searchBarUrl:转换成功', o, str
    return type === true ? o : type && type.obj ? o : str;
  };
  const searchBarQueryValue = function (data, obj = {}) {
    if (!data) return {};
    let o = {};
    searchBarkey.map((key) => {
      if (obj[key]) {
        o = {
          ...o,
          ...obj[key],
        };
        return false;
      }
      o[key] = Array.isArray(data[key])
        ? data[key].length > 0
          ? data[key]
          : null
        : data[key] || null;
    });
    // console.error('searchBarQueryValue:转换成功', o);
    return o;
  };
  const ComponentHtml = function (h) {
    const [_, queryData] = varName();
    const propsFn = (x) => ({
      props: {
        ...x,
        type: "search",
        value: queryData[x.key],
      },
      attr: {
        value: queryData[x.key],
      },
      on: {
        change: (val) => (queryData[x.key] = val),
      },
    });
    const llsInputFn = (x, props = {}) => (
      <llsInput {...props} {...propsFn(x)}>
        {" "}
        {x.title}
      </llsInput>
    );
    const nCascaderFn = (x, props = {}) => {
      let f = () => <nCascader {...props} {...propsFn(x)} />;
      if (x.data && x.data.then)
        x.data.then((r) => {
          x.data = r?.data || Array.isArray(r) ? r : [];
          return f();
        });
      return f();
    };
    const llsDatePickerFn = (x, props = {}) => (
      <llsDatePicker {...props} {...propsFn(x)} />
    );
    const llsSelectFn = (x, props = {}) => {
      let rFn = (_) => (
        <llsSelect {...props} {...propsFn(x)}>
          {x.option.map((l) => (
            <llsOption
              label={
                l[x.labelKey] ||
                l.dispalyName ||
                l.displayName ||
                l.name ||
                l.value ||
                l.currentUserName
              }
              value={
                l[x.valueKey] | l.dictParam ||
                l.dictParam ||
                l.id ||
                l.value ||
                l.currentUserId
              }
              key={
                l[x.valueKey] ||
                l.dictParam ||
                l.dictParam ||
                l.id ||
                l.key ||
                l.currentUserId
              }
            ></llsOption>
          ))}
        </llsSelect>
      );
      if (x.option.then) {
        return x.option.then((r) => {
          x.option = "data" in r ? r.data : Array.isArray(r) ? r : [];
          return rFn();
        });
      } else return rFn();
    };
    let selectTreeFn = (x, props = {}) => (
      <selectTree {...props} {...propsFn(x)} />
    );
    let llsDateRangePickerFn = (x, props = {}) => {
      const p = propsFn(x);
      p.props.value = p.attr.value && p.attr.value.start ? p.attr.value : {};
      return <llsDateRangePicker {...props} {...p} />;
    };
    let llsCityCascaderFn = (x, props = {}) => (
      <llsCityCascader {...props} {...propsFn(x)} />
    );
    return {
      llsInputFn,
      nCascaderFn,
      llsDatePickerFn,
      llsSelectFn,
      selectTreeFn,
      llsDateRangePickerFn,
      llsCityCascaderFn,
    };
  };
  const SearchHTML = function (h) {
    that = this;
    const [_this, queryData] = varName();
    if (typeof _this == undefined) throw new Error(`this请先注入到data后使用`);
    if (queryData == undefined)
      throw new Error(
        "请配置添加queryData字段,SearchBarJS需与this.queryData绑定"
      );
    try {
      const components = ComponentHtml(h);
      const [item] = _this.seachBar;
      const handlerResize = () => {
        _this.queryData = {};
        _this.tableChange(1);
      };
      const createHTML = (prop = {}) => {
        try {
          return _this.seachBar.map((x, i) =>
            components[`${x.type}Fn`](x, prop)
          );
        } catch (e) {
          console.error(`ComponentHtml请先查看是否维护:${e}`);
        }
      };
      const defailtHTML = (
        <div
          class="sear-box-201 searchBar"
          ref="searchBar"
          style="justify-content: space-between; flex-flow: nowrap;"
        >
          <div
            id="createHTML"
            style="display: flex;justify-content: flex-start;align-items: flex-start;flex-flow: wrap;width:100%;"
          >
            {createHTML()}
          </div>
          <div style="display: flex;justify-content: space-evenly;align-items: center;">
            {item.cupShow != false && (
              <i
                onclick={downUpTransitionClick}
                id="downUpTransition"
                attr="down"
                class="lls-icon-d-arrow-left"
              >
                {rotateDeg()}
              </i>
            )}
            <div>
              <llsButton
                style="margin-left:16px;"
                type="text"
                onclick={() => _this.tableChange(1)}
              >
                {" "}
                查询
              </llsButton>
              <llsButton
                style="margin-left:16px;"
                type="text"
                onclick={handlerResize}
              >
                {" "}
                重置
              </llsButton>
            </div>
          </div>
        </div>
      );
      return htmlFn
        ? htmlFn.call(_this, h, {
            components,
            callback: _this.tableChange,
            seachBar: _this.seachBar,
            createHTML,
          })
        : defailtHTML;
    } catch (e) {
      console.error(`搜索栏jsx报错, 请确认seatchBar参数:${e}`);
    }
  };
  const _timeStartEnd = function (
    data = {},
    keys,
    startKey = "Start",
    endKey = "End"
  ) {
    const fn = (key) => {
      const item = data[key];
      data[`${key}${startKey}`] = item?.start || null;
      data[`${key}${endKey}`] = item?.end || null;
      delete data[key];
    };
    if (Array.isArray(keys)) keys.forEach(fn);
    else fn(keys);
    return { ...data };
  };
  const _city = function (key = "", value) {
    return { [key]: value || null };
  };
  const _citys = function (keys = [], value = []) {
    let o = {};
    keys.map((x, index) => (o = { ...o, ..._city(x, value[index]) }));
    return o;
  };
  const _extend = Object.assign;
  /** seatchJs end **/
  return {
    seachBar,
    searchBarkey,
    searchBarUrl,
    searchBarQueryValue,
    searchCreatedValue,
    SearchHTML,
    _timeStartEnd,
    _city,
    _citys,
    _extend,
  };
}
