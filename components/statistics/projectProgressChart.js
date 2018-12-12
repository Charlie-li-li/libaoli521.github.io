import React from "react";
import { Layout, LocaleProvider, Icon, Spin, DatePicker, Popover } from "antd";
import zh_CN from "antd/lib/locale-provider/zh_CN";
import echarts from "echarts/lib/echarts";
import "echarts/lib/chart/bar";
import "echarts/lib/chart/pie";
import "echarts/lib/chart/line";
import "echarts/lib/component/tooltip";
import "echarts/lib/component/title";
import "echarts/lib/component/legend";
import "moment/locale/zh-cn";
import moment from "moment";

import stylesheet from "styles/components/statistics/projectProgressChart.scss";
import { dateToString } from "../../core/utils/util";
import NullView from "../nullView";
const { RangePicker } = DatePicker;
const dateFormat = "YYYY/MM/DD";
/**
 * (必填)chartProgress:[{date:'2018-10-23',wzpCount:'23',wwcCount:'65',dqrCount:'45',ywcCount:'12',...},{}],   //绘制图表所需要传的数据
 * （选填）progressTypeCallBack()     //选择本月或者上月时的回调（有本月，上月菜单选择时）
 * （选填）progressDateChartCallBack() //选择时间时的回调（有选择时间时）
 * （选填）timeMenuShow:false     //是否需要日期菜单（本月、上月） 需要：true;不需要:false,  默认:false
 * （选填）DatePickerShow:false    //是否需要日期筛选 需要：true;不需要:false,  默认:false
 *  (必填) calculationShow:false    //是否点击计算，点击:true,没有点击:false,默认:false
 */
export default class projectProgressChart extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      chartProgress: [],
      menuBar: "1",
      dateStart: "",
      dateEnd: "",
      chartProgessRender: true,
      timeMenuShow: false,
      DatePickerShow: false,
      calculationShow: false
    };
  }

  componentWillMount() {
    let progressDatas = [];
    if (this.props.chartProgress && this.props.chartProgress.length > 0) {
      this.props.chartProgress.map((iten, i) => {
        progressDatas.push(iten);
      });
      this.setState({ chartProgress: progressDatas });
    } else {
      this.setState({ chartProgress: [] });
    }
    this.dateCurrentChange("nowMonth");
  }

  componentDidMount() {
    setTimeout(() => {
      this.chart();
    }, 100);

    window.onresize = () => {
      this.resize();
    };
  }

  componentWillReceiveProps(nextProps) {
    let progressDatas = [];
    if (nextProps.calculationShow) {
      this.dateCurrentChange("nowMonth");
      this.setState({ menuBar: "1" });
    }

    if (nextProps.chartProgress && nextProps.chartProgress.length > 0) {
      nextProps.chartProgress.map((iten, i) => {
        progressDatas.push(iten);
      });
      this.setState(
        {
          chartProgress: nextProps.chartProgress
        },
        () => {
          this.chart();
        }
      );
    } else {
      this.setState({ chartProgress: [] }, () => {
        this.chart();
      });
    }
  }

  componentWillUnmount() {}
  resize() {
    this.chart("重绘");
  }
  chart(isDraw) {
    var charts = echarts.init(this.refs.chartProgress);
    if (isDraw === "重绘") {
      charts.resize();
      return false;
    }
    const { chartProgress } = this.state;
    const dates = [];
    const data_wzp = [];
    const data_wwc = [];
    const data_dqr = [];
    const data_ywc = [];
    if (chartProgress.length > 0) {
      chartProgress.map(item => {
        dates.push(item.date);
        data_wzp.push(item.wzpCount);
        data_wwc.push(item.wwcCount);
        data_dqr.push(item.dqrCount);
        data_ywc.push(item.ywcCount);
      });
    }

    if (chartProgress.length === 0) {
      this.setState({ chartProgessRender: false });
    } else {
      this.setState({ chartProgessRender: true });
      var option = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#6a7985"
            }
          },
          formatter: function(params, ticket, callback) {
            var res = "";
            var date = "";
            for (var i = 0; i < params.length; i++) {
              date = `<div style="padding-left:15px">${params[0].name}</div>`;
              res += `<div style="width:150px;text-align:left;padding-left:15px;">
                    <div style="width:10px;height:10px;display:inline-block;margin-right:10px;border-radius:50%;background:${
                      params[i].color
                    }"></div> 
                    ${params[i].seriesName} 
                     : 
                    ${params[i].value} 
                    </br></div>`;
            }
            return date + res;
          }
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          top: "8%",
          containLabel: true
        },
        xAxis: [
          {
            type: "category",
            boundaryGap: false,
            data: dates,
            axisLabel: {
              textStyle: {
                color: "#bdbdbd" //坐标值得具体的颜色
              }
            },
            axisLine: {
              lineStyle: {
                color: "#bdbdbd" //左边线的颜色
              }
            },
            splitLine: {
              show: false
            }
          }
        ],
        yAxis: [
          {
            type: "value",
            axisLabel: {
              textStyle: {
                color: "#bdbdbd" //坐标值得具体的颜色
              }
            },
            axisLine: {
              lineStyle: {
                color: "#bdbdbd" //左边线的颜色
              }
            },
            splitLine: {
              show: false
            }
          }
        ],
        series: [
          {
            name: "已完成",
            symbol: "none",
            type: "line",
            stack: "总量",
            itemStyle: {
              normal: {
                color: "#00000000"
              }
            },
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: "#b0bec5"
                  },
                  {
                    offset: 1,
                    color: "rgba(176,190,197,0.4)"
                  }
                ])
              }
            },
            data: data_ywc
          },
          {
            name: "待确认",
            type: "line",
            symbol: "none",
            stack: "总量",
            itemStyle: {
              normal: {
                color: "#00000000"
              }
            },
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: "#81d4fa"
                  },
                  {
                    offset: 1,
                    color: "rgba(129,212,250,0.4)"
                  }
                ])
              }
            },
            data: data_dqr
          },
          {
            name: "进行中",
            type: "line",
            symbol: "none",
            stack: "总量",
            itemStyle: {
              normal: {
                color: "#00000000"
              }
            },
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: "#A5d6A7"
                  },
                  {
                    offset: 1,
                    color: "rgba(165,214,167,0.4)"
                  }
                ])
              }
            },
            data: data_wwc
          },
          {
            name: "未指派",
            type: "line",
            symbol: "none",
            stack: "总量",
            itemStyle: {
              normal: {
                color: "#00000000"
              }
            },
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: "#CE93D8"
                  },
                  {
                    offset: 1,
                    color: "rgba(206,147,216,0.4)"
                  }
                ])
              }
            },
            data: data_wzp
          }
        ]
      };
      charts.setOption(option);
      setTimeout(() => {
        charts.resize();
      });
    }
  }
  menuChange(type) {
    switch (type) {
      case "1":
        this.setState({ menuBar: "1" });
        this.dateCurrentChange("nowMonth");
        break;
      case "2":
        this.setState({ menuBar: "2" });
        this.dateCurrentChange("oldMonth");
        break;
    }
    this.props.progressTypeCallBack(type);
  }
  dateChange(date) {
    const { dateStart, dateEnd } = this.state;
    let start = "";
    let end = "";
    if (date && date.length > 0) {
      start = dateToString(date[0]._d, "date");
      end = dateToString(date[1]._d, "date");
    }
    this.setState({ dateStart: start, dateEnd: end }, () => {
      const dateDatas = [start, end];
      this.props.progressDateChartCallBack(dateDatas);
      this.changeTime(start, end);
    });
  }
  getMonthDays(myMonth) {
    let now = new Date();
    let nowYear = now.getYear();
    let monthStartDate = new Date(nowYear, myMonth, 1);
    let monthEndDate = new Date(nowYear, myMonth + 1, 1);
    let days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
    return days;
  }
  dateCurrentChange(type) {
    let now = new Date();
    let nowMonth = now.getMonth();
    let nowYear = now.getFullYear();
    now.setDate(1);
    now.setMonth(now.getMonth() - 1);
    let lastMonth = now.getMonth();
    switch (type) {
      case "nowMonth":
        let monthStartDate = new Date(nowYear, nowMonth, 1);
        let monthEndDate = new Date(
          nowYear,
          nowMonth,
          this.getMonthDays(nowMonth)
        );
        this.setState({
          dateStart: dateToString(monthStartDate, "date"),
          dateEnd: dateToString(monthEndDate, "date")
        });
        break;
      case "oldMonth":
        let oldStartDate = new Date(nowYear, lastMonth, 1);
        let oldEndDate = new Date(
          nowYear,
          lastMonth,
          this.getMonthDays(lastMonth)
        );
        this.setState({
          dateStart: dateToString(oldStartDate, "date"),
          dateEnd: dateToString(oldEndDate, "date")
        });
        break;
    }
  }
  changeTime(start, end) {
    var _this = this;
    let now = new Date();
    let nowMonth = now.getMonth();
    let nowYear = now.getFullYear();
    now.setDate(1);
    now.setMonth(now.getMonth() - 1);
    let lastMonth = now.getMonth();
    let monthStartDate = new Date(nowYear, nowMonth, 1);
    let monthEndDate = new Date(nowYear, nowMonth, this.getMonthDays(nowMonth));
    let oldStartDate = new Date(nowYear, lastMonth, 1);
    let oldEndDate = new Date(nowYear, lastMonth, this.getMonthDays(lastMonth));
    if (
      start == dateToString(monthStartDate, "date") &&
      end == dateToString(monthEndDate, "date")
    ) {
      this.setState({ menuBar: "1" });
    } else if (
      start == dateToString(oldStartDate, "date") &&
      end == dateToString(oldEndDate, "date")
    ) {
      this.setState({ menuBar: "2" });
    } else {
      this.setState({ menuBar: "" });
    }
  }
  render() {
    const { menuBar, dateStart, dateEnd, chartProgessRender } = this.state;

    return (
      <div className="chartBox">
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        <div className="chart">
          <div className="top">
            <span className="title">
              {this.props.title ? this.props.title : ""}
            </span>
            {this.props.timeMenuShow ? (
              <ul>
                <li
                  style={
                    menuBar == "1" ? { color: "#757575", fontSize: "14px" } : {}
                  }
                  onClick={() => {
                    this.menuChange("1");
                  }}
                >
                  本月
                </li>
                <li
                  style={
                    menuBar == "2" ? { color: "#757575", fontSize: "14px" } : {}
                  }
                  onClick={() => {
                    this.menuChange("2");
                  }}
                >
                  上月
                </li>
              </ul>
            ) : (
              ""
            )}
            {this.props.DatePickerShow ? (
              <p>
                {dateStart !== "" && dateEnd !== "" ? (
                  <RangePicker
                    locale={zh_CN}
                    value={[
                      moment(dateStart, dateFormat),
                      moment(dateEnd, dateFormat)
                    ]}
                    onChange={e => {
                      this.dateChange(e);
                    }}
                  />
                ) : (
                  <RangePicker
                    locale={zh_CN}
                    onChange={e => {
                      this.dateChange(e);
                    }}
                  />
                )}
              </p>
            ) : (
              ""
            )}
          </div>
          <div className="chart-area">
            <div className="chart-boxImg">
              <div
                className="chart-img1"
                ref="chartProgress"
                style={
                  chartProgessRender
                    ? {
                        width: "100%",
                        left: "0",
                        position: "absolute",
                        top: "0",
                        bottom: "0"
                      }
                    : {
                        display: "none",
                        width: "100%",
                        left: "0",
                        position: "absolute",
                        top: "0",
                        bottom: "0"
                      }
                }
              />
              {chartProgessRender ? (
                ""
              ) : (
                <NullView icon={"Warning"} showTit={"当前还没有可统计的数据"} />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
