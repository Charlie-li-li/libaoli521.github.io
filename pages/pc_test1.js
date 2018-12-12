import React from "react";

const taskPendList = [
  {
    total: 4752,
    id: "1cb758224ee84dc494906cd4b3b5794b",
    daiqr: 0,
    jinxz: 73,
    proName: "导出测试",
    daizp: 4679,
    dzpyq: 2051,
    dqryq: 0,
    jxzyq: 23
  },
  {
    total: 2241,
    id: "5386970d6da94144807399c270db5adb",
    daiqr: 0,
    jinxz: 2240,
    proName: "导入任务测试项目",
    daizp: 1,
    dzpyq: 0,
    dqryq: 0,
    jxzyq: 5
  },
  {
    total: 997,
    id: "f0c976341fd24144bfe9e3222283db68",
    daiqr: 0,
    jinxz: 2,
    proName: "露露",
    daizp: 995,
    dzpyq: 647,
    dqryq: 0,
    jxzyq: 2
  },
  {
    total: 894,
    id: "3c53c044173246b4aa1841889a565650",
    daiqr: 0,
    jinxz: 17,
    proName: "顶顶顶顶156",
    daizp: 877,
    dzpyq: 812,
    dqryq: 0,
    jxzyq: 12
  },
  {
    total: 718,
    id: "6eae9b509e6c44079d481e9b2430d171",
    daiqr: 0,
    jinxz: 2,
    proName: "应用",
    daizp: 716,
    dzpyq: 468,
    dqryq: 0,
    jxzyq: 0
  },
  {
    total: 718,
    id: "6eae9s509e6c44079d481e9b2430d171",
    daiqr: 0,
    jinxz: 0,
    proName: "应用",
    daizp: 0,
    dzpyq: 0,
    dqryq: 0,
    jxzyq: 0
  }
];

export default class Task extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      measureKeys: ["daiqr", "jinxz", "daizp"],
      originalData: [
        {
          total: 4752,
          id: "1cb758224ee84dc494906cd4b3b5794b",
          daiqr: 0,
          jinxz: 73,
          proName: "导出测试",
          daizp: 4679,
          dzpyq: 2051,
          dqryq: 0,
          jxzyq: 23
        },
        {
          total: 2241,
          id: "5386970d6da94144807399c270db5adb",
          daiqr: 0,
          jinxz: 2240,
          proName: "导入任务测试项目",
          daizp: 1,
          dzpyq: 0,
          dqryq: 0,
          jxzyq: 5
        },
        {
          total: 997,
          id: "f0c976341fd24144bfe9e3222283db68",
          daiqr: 0,
          jinxz: 2,
          proName: "露露",
          daizp: 995,
          dzpyq: 647,
          dqryq: 0,
          jxzyq: 2
        },
        {
          total: 894,
          id: "3c53c044173246b4aa1841889a565650",
          daiqr: 0,
          jinxz: 17,
          proName: "顶顶顶顶156",
          daizp: 877,
          dzpyq: 812,
          dqryq: 0,
          jxzyq: 12
        },
        {
          total: 718,
          id: "6eae9b509e6c44079d481e9b2430d171",
          daiqr: 0,
          jinxz: 2,
          proName: "应用",
          daizp: 716,
          dzpyq: 468,
          dqryq: 0,
          jxzyq: 0
        },
        {
          total: 718,
          id: "6eae9s509e6c44079d481e9b2430d171",
          daiqr: 0,
          jinxz: 0,
          proName: "应用",
          daizp: 0,
          dzpyq: 0,
          dqryq: 0,
          jxzyq: 0
        }
      ],
      colorSet: {
        daiqr: "#4FAAEB",
        jinxz: "#9AD681",
        daizp: "#FED46B"
      },
      transposeCoord: false
    };
  }
  componentDidMount() {
    this.chartDraw();
  }

  chartDraw() {
    // 计算每个柱子的占比

    //     daiqr: 0,
    //     jinxz: 73,
    //     proName: "导出测试",
    //     daizp: 4679,
    //     dzpyq: 2051,
    //     dqryq: 0,
    //     jxzyq: 23
    let _this = this;
    const titleSet = {
      jinxz: "进行中",
      daiqr: "待确认",
      yiwc: "待确认",
      daizp: "待指派",
      dzpyq: "逾期",
      dqryq: "逾期",
      jxzyq: "逾期"
    };
    var ds = new DataSet();
    var dv = ds
      .createView()
      .source(_this.state.originalData)
      .transform({
        type: "fold",
        fields: _this.state.measureKeys,
        key: "key",
        value: "value"
      })
      .transform({
        type: "percent",
        field: "value",
        dimension: "key",
        groupBy: ["id"],
        as: "percent"
      });

    // 初始化图表实例
    var chart = new G2.Chart({
      container: "mountNode",
      forceFit: true
      //       height: window.innerHeight
    });

    chart.source(dv, {
      percent: {
        min: 0,
        formatter: function formatter(val) {
          return (val * 100).toFixed(2) + "%";
        }
      }
    });

    // 是否水平翻转
    // 改这个参数看效果！

    if (_this.state.transposeCoord) {
      chart.coord().transpose();
    }
    //不显示坐标轴
    chart.axis(false);
    //不现实标签分类
    chart.legend(false);
    //绘制堆叠图
    chart
      .intervalStack()
      .position("id*value")
      .color("key", function(value) {
        return _this.state.colorSet[value];
      });

    chart.tooltip(true, {
      showTitle: false // 默认标题不显示
    });

    chart.tooltip("month*tem");

    // chart.tooltip(true, {
    //   showTitle: false,
    //   useHtml: true,
    //   //       containerTpl:
    //   //         '<div class="g2-tooltip">' +
    //   //         '<div class="g2-tooltip-title" style="margin:10px 0;"></div>' +
    //   //         '<ul class="g2-tooltip-list"></ul></div>',

    //   htmlContent: function() {
    //     return `<li>test</li>`;
    //   }
    // });

    //数据处理文字显示状态
    _this.state.originalData.map(function(obj) {
      chart.guide().text({
        position: [obj.id, "min"],
        content: !_this.state.transposeCoord
          ? obj.proName.split("").join("\n")
          : obj.proName,
        style: {
          textAlign: !_this.state.transposeCoord ? "start" : "middle",
          textBaseline: !_this.state.transposeCoord ? "bottom" : "middle"
        },
        offsetY: !_this.state.transposeCoord ? -8 : 0,
        offsetX: !_this.state.transposeCoord ? -5 : 0
      });
    });
    chart.render();
    chart.on("tooltip:change", function(ev) {
      const items = ev.items; // tooltip显示的项
      const origin = items[0]; // 将一条数据改成多条数据
      //       console.log(origin, "origin");

      const range = origin.point._origin.range;
      items.map((item, index) => {
        item.name = titleSet[item.name];
        return item;
      });
      items.push(
        Object.assign({}, origin, {
          name: "结束值"
        })
      );
    });
  }
  go() {}
  render() {
    return (
      <div>
        <div
          onClick={() => {
            this.go();
          }}
        >
          aaa
        </div>
        <div
          className="chart-wrapper"
          id="mountNode"
          style={{ height: "500px", width: "500px" }}
        />
      </div>
    );
  }
}
