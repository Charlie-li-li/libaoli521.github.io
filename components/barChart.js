import React from "react";
import { Popover, Spin, DatePicker } from "antd";
import stylesheet from "styles/components/barChart.scss";
import echarts from "echarts/lib/echarts";
import "echarts/lib/chart/bar";
import "echarts/lib/chart/pie";
import "echarts/lib/chart/line";
import "echarts/lib/component/tooltip";
import "echarts/lib/component/title";
import "echarts/lib/component/legend";
import { baseURI } from "../core/api/HttpClient";
import {
  downPendByProject,
  downPendByPerson,
  downNumByProject,
  downNumByPerson,
  downContentByProject,
  downContentByPerson
} from "../core/service/project.service";

const { RangePicker } = DatePicker;
/*
 * （必填）barChartProList: 
      如果 chartType === "toDo"  待办统计        //统计的数据list 长度是5
      [{
        daiqr: 0   //待确认
        daizp: 4527   //待指派
        dqryq: 0   //待确认逾期
        dzpyq: 1929   //待指派逾期
        id: "1cb758224ee84dc494906cd4b3b5794b"   //项目id
        jinxz: 8   //进行中
        jxzyq: 1   //进行中逾期
        proName: ""   //项目名
       }]  
      如果 chartType === "achievements"   绩效统计（任务数）       
      [{
          cjrw: ''   //创建任务
          projectName: "导入测试"
          qrrw: ''   //确认任务
          wcrw: ''   //完成任务
          yqqr: ''   //逾期确认
          yqwc: ''   //逾期完成
          yqzp: ''   //逾期指派
          zprw: ''   //指派任务
       }]  
      如果 chartType === "performance"         绩效统计（绩效值） 
      [{
          cjrw: ''   //创建任务
          name: "导入测试"
          qrrw: ''   //确认任务
          wcrw: ''   //完成任务
          yqqr: ''   //逾期确认
          yqwc: ''   //逾期完成
          yqzp: ''   //逾期指派
          zprw: ''   //指派任务
       }]  

 * （选填）title: {''}           // 统计图title
 * （必填）barId：{}                //统计图对应的id
 *  tabTimeShow:boolaen          //true 有时间选项 false 不展示时间选项
 *  chartType:{''}           //待办统计传 '待办' , 绩效统计传 '绩效' ,绩效值传'绩效值'
 *  selectedCallBack(type, barId)        选择时间回调  type: currentMonth 本月|| lastMonth上月||custom 自定义 barId：对应哪一个图
 *
 */
export default class barChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentMonth: true, //本月
      lastMonth: false, //上月
      custom: false, //自定义
      barList: [],
      hrefLink: "",
      type: "",
      attdate: ["", ""]
      //       flag: false
    };
  }

  componentWillMount() {
    this.setState({
      barList: this.props.barChartProList,
      barId: this.props.barId,
      chartType: this.props.chartType
    });
  }
  componentDidMount() {
    const that = this;
    const { barId } = this.state;
    let statisticBarName = "statisticBar" + barId;
    let statisticRef = this.refs[statisticBarName];
    this.barChartPie = echarts.init(statisticRef);

    //     this.chart
    //     const { flag } = this.state;
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.barChartProList && nextProps.barChartProList.length > 0) {
      this.setState({
        barList: nextProps.barChartProList,
        barId: nextProps.barId,
        chartType: nextProps.chartType
      });
    }
    this.chart(nextProps.barChartProList, nextProps.barId, nextProps.chartType);
    window.onresize = () => {
      this.chart("", "", "", "重绘");
    };
  }
  chart(barList, barId, chartType, isDraw) {
    if (isDraw === "重绘") {
      this.barChartPie.resize();
      return false;
    }
    if (this.props.loading) {
      this.barChartPie.showLoading({
        text: "数据正在努力加载...",
        textStyle: { fontSize: 20, color: "#f5f5f5" }
      });
    } else {
      this.barChartPie.hideLoading();
    }
    if (chartType === "toDo") {
      const appointed = [];
      const completed = [];
      const confirmed = [];
      if (barList.length < 5) {
        barList.map((item, i) => {
          appointed.push({ value: item.daizp, overdue: item.dzpyq });
          completed.push({ value: item.jinxz, overdue: item.jxzyq });
          confirmed.push({ value: item.daiqr, overdue: item.dqryq });
        });
        for (let i = 0; i < 5 - barList.length; i++) {
          appointed.push({ value: 0, overdue: 0 });
          completed.push({ value: 0, overdue: 0 });
          confirmed.push({ value: 0, overdue: 0 });
        }
      } else {
        barList.map((item, i) => {
          appointed.push({ value: item.daizp, overdue: item.dzpyq });
          completed.push({ value: item.jinxz, overdue: item.jxzyq });
          confirmed.push({ value: item.daiqr, overdue: item.dqryq });
        });
      }
      var option = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow"
          },
          formatter: function(params) {
            var res = "";
            for (var i = 0, l = params.length; i < l; i++) {
              res +=
                `<div style="width:10px;height:10px;display:inline-block;border-radius:50%;background:${
                  params[i].color
                }"></div>` +
                "&nbsp;" +
                params[i].seriesName +
                ": " +
                params[i].value +
                "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
                "<br/>" +
                `<span style="font-size:8px;margin-left:30px;">逾期：</span>${
                  params[i].data.overdue
                }` +
                "<br/>";
            }
            return res;
          }
        },
        xAxis: [
          {
            type: "value",
            show: false
          }
        ],
        yAxis: [
          {
            type: "category",
            data: ["", "", "", "", ""],
            show: false
          }
        ],
        grid: {
          left: "0%",
          right: "0",
          bottom: "0%",
          top: "10%",
          containLabel: true
        },
        series: [
          {
            name: "待指派",
            type: "bar",
            stack: "堆积",
            barWidth: 10,
            itemStyle: {
              normal: {
                color: "#b2a4f4",
                barBorderRadius: [10, 0, 0, 10]
              }
            },
            data: appointed.reverse()
          },
          {
            name: "待完成",
            type: "bar",
            stack: "堆积",
            itemStyle: {
              normal: {
                color: "#b1deb3",
                barBorderRadius: [0, 0, 0, 0]
              }
            },
            data: completed.reverse()
          },
          {
            name: "待确认",
            type: "bar",
            stack: "堆积",
            itemStyle: {
              normal: {
                color: "#b3e1f7",
                barBorderRadius: [0, 10, 10, 0]
              }
            },
            data: confirmed.reverse()
          }
        ]
      };
    } else if (chartType === "achievements") {
      const appointed = [];
      const completed = [];
      const confirmed = [];
      const create = [];
      if (barList.length < 5) {
        barList.map((item, i) => {
          create.push({ value: item.cjrw, overdue: 0 });
          appointed.push({ value: item.zprw, overdue: item.yqzp });
          completed.push({ value: item.wcrw, overdue: item.yqwc });
          confirmed.push({ value: item.qrrw, overdue: item.yqqr });
        });
        for (let i = 0; i < 5 - barList.length; i++) {
          create.push({ value: 0, overdue: 0 });
          appointed.push({ value: 0, overdue: 0 });
          completed.push({ value: 0, overdue: 0 });
          confirmed.push({ value: 0, overdue: 0 });
        }
      } else {
        barList.map((item, i) => {
          create.push({ value: item.cjrw, overdue: 0 });
          appointed.push({ value: item.zprw, overdue: item.yqzp });
          completed.push({ value: item.wcrw, overdue: item.yqwc });
          confirmed.push({ value: item.qrrw, overdue: item.yqqr });
        });
      }
      var option = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: "shadow" // 默认为直线，可选为：'line' | 'shadow'
          },
          formatter: function(params) {
            var res = "";
            for (var i = 0, l = params.length; i < l; i++) {
              res +=
                `<div style="width:10px;height:10px;display:inline-block;border-radius:50%;background:${
                  params[i].color
                }"></div>` +
                "&nbsp;" +
                params[i].seriesName +
                ": " +
                params[i].value +
                "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
                "<br/>";
              if (i != 0) {
                res +=
                  `<span style="font-size:8px;margin-left:18px;">逾期：</span>${
                    params[i].data.overdue
                  }` + "<br/>";
              }
            }

            return res;
          }
        },
        xAxis: [
          {
            type: "value",
            show: false
          }
        ],
        yAxis: [
          {
            type: "category",
            data: ["", "", "", "", ""],
            show: false
          }
        ],
        grid: {
          left: "0%",
          right: "0",
          bottom: "0%",
          top: "10%",
          containLabel: true
        },
        series: [
          {
            name: "创建",
            type: "bar",
            stack: "堆积",
            barWidth: 10,
            itemStyle: {
              normal: {
                color: "#d3c4bd",
                barBorderRadius: [10, 0, 0, 10]
              }
            },
            data: create.reverse()
          },
          {
            name: "指派",
            type: "bar",
            stack: "堆积",
            itemStyle: {
              normal: {
                color: "#b2a4f4",
                barBorderRadius: [0, 0, 0, 0]
              }
            },
            data: appointed.reverse()
          },
          {
            name: "确认",
            type: "bar",
            stack: "堆积",
            itemStyle: {
              normal: {
                color: "#b3e1f7",
                barBorderRadius: [0, 0, 0, 0]
              }
            },
            data: confirmed.reverse()
          },
          {
            name: "完成",
            type: "bar",
            stack: "堆积",
            itemStyle: {
              normal: {
                color: "#cfdfe6",
                barBorderRadius: [0, 10, 10, 0]
              }
            },
            data: completed.reverse()
          }
        ]
      };
    } else if (chartType === "performance") {
      const appointed = [];
      const completed = [];
      const confirmed = [];
      const create = [];
      if (barList.length < 5) {
        barList.map((item, i) => {
          create.push({ value: item.cjrwjx, overdue: 0 });
          appointed.push({ value: item.zprwjx, overdue: item.yqzpjx });
          completed.push({ value: item.wcrwjx, overdue: item.yqwcjx });
          confirmed.push({ value: item.qrrwjx, overdue: item.yqqrjx });
        });
        for (let i = 0; i < 5 - barList.length; i++) {
          create.push({ value: 0, overdue: 0 });
          appointed.push({ value: 0, overdue: 0 });
          completed.push({ value: 0, overdue: 0 });
          confirmed.push({ value: 0, overdue: 0 });
        }
      } else {
        barList.map((item, i) => {
          create.push({ value: item.cjrwjx, overdue: 0 });
          appointed.push({ value: item.zprwjx, overdue: item.yqzpjx });
          completed.push({ value: item.wcrwjx, overdue: item.yqwcjx });
          confirmed.push({ value: item.qrrwjx, overdue: item.yqqrjx });
        });
      }
      var option = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: "shadow" // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        formatter: function(params) {
          var res = "";
          for (var i = 0, l = params.length; i < l; i++) {
            res +=
              `<div style="width:10px;height:10px;display:inline-block;border-radius:50%;background:${
                params[i].color
              }"></div>` +
              "&nbsp;" +
              params[i].seriesName +
              "： " +
              params[i].value +
              "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
              "<br/>";
            if (i != 0) {
              res +=
                `<span style="font-size:8px;margin-left:18px;">逾期：</span>${
                  params[i].data.overdue
                }` + "<br/>";
            }
          }
          return res;
        },
        xAxis: [
          {
            type: "value",
            show: false
          }
        ],
        yAxis: [
          {
            type: "category",
            data: ["", "", "", "", ""],
            show: false
          }
        ],
        grid: {
          left: "0%",
          right: "0",
          bottom: "0%",
          top: "10%",
          containLabel: true
        },
        series: [
          {
            name: "创建",
            type: "bar",
            stack: "堆积",
            barWidth: 10,
            itemStyle: {
              normal: {
                color: "#d3c4bd",
                barBorderRadius: [10, 0, 0, 10]
              }
            },
            data: create.reverse()
          },
          {
            name: "指派",
            type: "bar",
            stack: "堆积",
            itemStyle: {
              normal: {
                color: "#b2a4f4",
                barBorderRadius: [0, 0, 0, 0]
              }
            },
            data: appointed.reverse()
          },
          {
            name: "确认",
            type: "bar",
            stack: "堆积",
            itemStyle: {
              normal: {
                color: "#b3e1f7",
                barBorderRadius: [0, 0, 0, 0]
              }
            },
            data: confirmed.reverse()
          },
          {
            name: "完成",
            type: "bar",
            stack: "堆积",
            itemStyle: {
              normal: {
                color: "#cfdfe6",
                barBorderRadius: [0, 10, 10, 0]
              }
            },
            data: completed.reverse()
          }
        ]
      };
    }
    this.barChartPie.setOption(option);
    //     this.setState({
    //       flag: true
    //     });
    //     if (!flag) {
    //       chart.resize();
    //     }
    //     chart.resize();
  }

  //   resize() {
  //     this.chart("", "", "", "重绘");
  //   }
  componentWillUnmount() {}
  timeSelect(Month, barId) {
    if (Month === "currentMonth") {
      this.props.selectedCallBack(Month, barId);
      this.setState({
        currentMonth: true,
        lastMonth: false,
        custom: false,
        type: 0,
        attdate: ["", ""]
      });
    }
    if (Month === "lastMonth") {
      this.props.selectedCallBack(Month, barId);
      this.setState({
        currentMonth: false,
        lastMonth: true,
        custom: false,
        type: 1,
        attdate: ["", ""]
      });
    }
    if (Month === "custom") {
      this.setState({
        // currentMonth: false,
        // lastMonth: false,
        // custom: true,
        attdate: this.state.attdate
      });
    }
  }
  onChange(value, dateStrings) {
    const { barId } = this.props;
    this.props.selectedCallBack(dateStrings, barId);

    this.setState({
      attdate: dateStrings,
      currentMonth: false,
      lastMonth: false,
      custom: true,
      type: ""
    });
  }
  downLoadExcel() {
    const { barId, downLoadType } = this.props;
    const { type, attdate } = this.state;
    if (barId === 1) {
      downPendByProject(downLoadType);
    } else if (barId === 2) {
      downPendByPerson(downLoadType);
    } else if (barId === 3) {
      downNumByProject(downLoadType, type, attdate[0], attdate[1]);
    } else if (barId === 4) {
      downNumByPerson(downLoadType, type, attdate[0], attdate[1]);
    } else if (barId === 5) {
      downContentByProject(downLoadType, type, attdate[0], attdate[1]);
    } else if (barId === 6) {
      downContentByPerson(downLoadType, type, attdate[0], attdate[1]);
    }
  }
  render() {
    const { title, tabTimeShow, barId, downLoadType } = this.props;
    const {
      currentMonth,
      lastMonth,
      custom,
      barList,
      attdate,
      type
    } = this.state;
    const length = barList.length;
    return (
      <div className="barChart">
        <style
          dangerouslySetInnerHTML={{
            __html: stylesheet
          }}
        />
        <div className="header">
          <span className="title"> {title} </span>
          {tabTimeShow ? (
            <div className="tabTime">
              <ul>
                <li
                  onClick={() => {
                    this.timeSelect("currentMonth", barId);
                  }}
                >
                  <span className={currentMonth ? "textColor" : "text"}>
                    本月
                  </span>
                  <span className={currentMonth ? "textLine" : ""} />
                </li>
                <li
                  onClick={() => {
                    this.timeSelect("lastMonth", barId);
                  }}
                >
                  <span className={lastMonth ? "textColor" : "text"}>上月</span>
                  <span className={lastMonth ? "textLine" : ""} />
                </li>
                <li
                  onClick={() => {
                    this.timeSelect("custom", barId);
                  }}
                >
                  <span className={attdate[0] !== "" ? "textColor" : "text"}>
                    自定义
                  </span>
                  <span className={attdate[0] !== "" ? "textLine" : ""} />
                </li>
              </ul>
              <div
                className="timePicker"
                onClick={() => {
                  this.timeSelect("custom", barId);
                }}
              >
                <RangePicker
                  className="timePickerSelect"
                  placeholder=""
                  size={"small"}
                  format="YYYY-MM-DD"
                  onChange={(value, dateStrings) => {
                    this.onChange(value, dateStrings);
                  }}
                />
              </div>
            </div>
          ) : (
            ""
          )}
          <div id={`area_${barId}`} className="exportIcon">
            <Popover
              placement="left"
              title={null}
              getPopupContainer={() => document.getElementById(`area_${barId}`)}
              content={
                <a
                  onClick={() => {
                    // down2(downLoadType);
                    this.downLoadExcel();
                  }}
                >
                  <span className="download">导出</span>
                </a>
              }
              trigger="click"
              className="export"
            >
              <i className="iconfont icon-more"> </i>
            </Popover>
          </div>
        </div>
        <div className="bar">
          <div className="chart" ref={"statisticBar" + barId} />
          {barList && barList.length > 0
            ? barList.map((item, i) => {
                var name = item.proName || item.name || item.projectName;
                if (item.total === 0) {
                  name = name + "（0）";
                }
                return (
                  <div className={"projectName" + i} key={i}>
                    {name}
                  </div>
                );
              })
            : ""}
        </div>
      </div>
    );
  }
}
