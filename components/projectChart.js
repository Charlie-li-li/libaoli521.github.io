import React from "react";
import {
  Spin,
  Modal,
  Button,
  Input,
  Icon,
  Popover,
  message,
  DatePicker,
  Radio,
  Slider,
  InputNumber,
  Row,
  Col
} from "antd";
import echarts from "echarts/lib/echarts";
import "echarts/lib/chart/bar";
import "echarts/lib/chart/pie";
import "echarts/lib/chart/line";
import "echarts/lib/component/tooltip";
import "echarts/lib/component/title";
import "echarts/lib/component/legend";
import moment from "moment";

import stylesheet from "../styles/components/projectChart.scss";
import {
  getChartByUserTask,
  getChartByUserMoney,
  getChartByTaskSituation,
  getChartByProjectProgress
} from "../core/service/project.service";
import { getFormulaById, updateFormula } from "../core/service/task.service";
import { dateToString, onlyNumber } from "../core/utils/util";
import { baseURI } from "../core/api/HttpClient";
import NullView from "../components/nullView";
import { number } from "echarts/lib/export";

const { RangePicker } = DatePicker;
const dateFormat = "YYYY/MM/DD";

/*
 * （必填）projectId:''                   // 项目ID
 * （选填）jurisdiction: false            // 默认无权限
 */

export default class ProjectChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      chart1DataInfo: [],
      chart1Loading: false,
      chart2Loading: false,
      chart3Loading: false,
      chart4Loading: false,
      chart3Start: "",
      chart3End: "",
      chart4Start: "",
      chart4End: "",
      chart4searchType: "1",
      chart1Render: true,
      chart2Render: true,
      chart3Render: true,
      chart4Render: true,
      chart3BigLoading: false,
      chart4BigLoading: false,

      calculationModel: false,
      FormulaList: {
        id: "", //计算公式id
        projectId: "", //项目id
        createPerf: "10", //创建任务绩效占比
        assignPerf: "5", //指派任务绩效占比
        confirmPerf: "15", //确认任务绩效占比
        finishPerf: "70", //完成任务绩效占比
        overDiscount: "90"
        // finishZcPerf: '100',  //正常完成任务绩效占比
        // finishYqPerf: '90',   //逾期完成任务绩效占比
      },

      projectId: "",
      formulaId: "",
      bigCharShow: false,
      bigCharTitle: "",
      bigCharHeight: 500,
      createTask: 10,
      appointedTask: 5,
      confirmationTask: 15,
      overdueVal: 10,
      advanceVal: 10,
      finishTaskVal: 70
    };
  }

  componentWillMount() {
    if (this.props.projectId) {
      this.setState({ projectId: this.props.projectId });
    }
  }

  componentDidMount() {
    if (this.props.projectId) {
      this.chart1(this.props.projectId);
      this.chart2(this.props.projectId);
      this.chart3(this.props.projectId);
      this.chart4(this.props.projectId);
    }
    //window.addEventListener('resize', this.resize.bind(this));
    const that = this;
    window.onresize = () => {
      that.resize();
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.projectId !== this.props.projectId) {
      this.setState({
        projectId: nextProps.projectId,
        chart4Start: "",
        chart4End: "",
        chart3Start: "",
        chart3End: "",
        chart4searchType: "1"
      });
      this.chart1(nextProps.projectId);
      this.chart2(nextProps.projectId);
      this.chart3(nextProps.projectId);
      this.chart4(nextProps.projectId);
    }
  }

  componentWillUnmount() {
    //window.removeEventListener('resize',this.resize);
    window.onresize = null;
    //重写组件的setState方法，直接返回空
    this.setState = (state, callback) => {
      return;
    };
  }

  resize() {
    this.chart1("", "重绘");
    this.chart2("", "重绘");
    this.chart3("", "", "", "重绘");
    this.chart4("", "", "", "重绘");
  }

  chart1(id, isDraw) {
    var chart1 = echarts.init(document.getElementById("main1"));
    if (isDraw === "重绘") {
      chart1.resize();
      return false;
    }
    this.setState({ chart1Loading: true });
    getChartByTaskSituation(id, res => {
      if (res.err) {
        return false;
      }
      if (res.count.count === 0) {
        this.setState({ chart1Render: false });
      } else {
        this.setState({ chart1Render: true });

        const chart1Datas = [];
        if (res.data) {
          chart1Datas.push(
            {
              value: res.data.weizp,
              name: "待指派",
              itemStyle: {
                color: "#a695f4"
              },
              key: res.data.dzpyq
            },
            {
              value: res.data.jinxz,
              name: "进行中",
              itemStyle: {
                color: "#a1d685"
              },
              key: res.data.jxzyq
            },
            {
              value: res.data.weish,
              name: "待确认",
              itemStyle: {
                color: " #81d4fa"
              },
              key: res.data.dqryq
            },
            {
              value: res.data.yiwc,
              name: "已完成",
              itemStyle: {
                color: "#90a4ae "
              },
              key: res.data.yuqwc
            },
            {
              value: res.data.yizz,
              name: "已终止",
              itemStyle: {
                color: "#dbdcdc"
              }
            }
          );
        }
        if (chart1Datas.length > 0) {
          this.setState({ chart1DataInfo: chart1Datas });
        } else {
          this.setState({ chart1DataInfo: [] });
        }
        var option1 = {
          tooltip: {
            trigger: "item",
            formatter: function(params, ticket, callback) {
              var res = "";
              res =
                `<div style="width:10px;height:10px;display:inline-block;margin-right:10px;border-radius:50%;background:${
                  params.color
                }"></div>` +
                params.name +
                " : " +
                params.value +
                `${
                  params.name == "已终止"
                    ? ""
                    : "<br/>" +
                      `<div style="display:inline-block;padding-left:20px;">逾期:</div>` +
                      `${params.data.key}`
                }` +
                "<br/>";
              return res;
            }
          },
          series: [
            {
              name: "任务概述",
              type: "pie",
              radius: ["50%", "70%"],
              avoidLabelOverlap: false,
              label: {
                normal: {
                  show: false,
                  position: "center"
                },
                emphasis: {
                  show: false,
                  textStyle: {
                    fontSize: "30",
                    fontWeight: "bold"
                  }
                }
              },
              labelLine: {
                normal: {
                  show: false
                }
              },
              data: chart1Datas
            }
          ]
        };
        chart1.setOption(option1);
      }
      this.setState({ chart1Loading: false });
    });
  }

  chart2(id, isDraw) {
    var chart2 = echarts.init(document.getElementById("main2"));
    if (isDraw === "重绘") {
      chart2.resize();
      return false;
    }
    this.setState({ chart2Loading: true });
    const data = { projectId: id };
    getChartByProjectProgress(data, res => {
      if (res.err) {
        return false;
      }
      if (res.length === 0) {
        this.setState({ chart2Render: false });
      } else {
        this.setState({ chart2Render: true });
        const dates = [];
        const data_wwc = [];
        const data_dqr = [];
        const data_wzp = [];
        const data_ywc = [];
        res.map(item => {
          dates.push(item.date);
          data_wwc.push(item.wwcCount);
          data_dqr.push(item.dqrCount);
          data_wzp.push(item.wzpCount);
          data_ywc.push(item.ywcCount);
        });

        var option2 = {
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "cross",
              label: {
                backgroundColor: "#6a7985"
              }
            }
          },
          legend: {
            data: [
              {
                name: "未指派",
                icon: "roundRect"
              },
              {
                name: "进行中",
                icon: "roundRect"
              },
              {
                name: "待确认",
                icon: "roundRect"
              },
              {
                name: "已完成",
                icon: "roundRect"
              }
            ],
            bottom: 0
          },
          toolbox: {
            feature: {
              saveAsImage: {}
            }
          },
          grid: {
            left: "10",
            right: "40",
            bottom: "30",
            top: "0",
            containLabel: true
          },
          xAxis: [
            {
              type: "category",
              boundaryGap: false,
              data: dates,
              axisLine: {
                lineStyle: {
                  color: "#C1BFBF"
                }
              }
            }
          ],
          yAxis: [
            {
              type: "value",
              axisLine: {
                lineStyle: {
                  color: "#C1BFBF"
                }
              },
              splitLine: {
                show: true,
                lineStyle: {
                  type: "dotted",
                  color: "#f5f5f5"
                }
              }
            }
          ],
          series: [
            {
              name: "已完成",
              type: "line",
              stack: "总量",
              itemStyle: {
                color: "#90a4ae"
              },
              areaStyle: { normal: {} },
              data: data_ywc
            },
            {
              name: "待确认",
              type: "line",
              stack: "总量",
              itemStyle: {
                color: " #81d4fa"
              },
              areaStyle: { normal: {} },
              data: data_dqr
            },
            {
              name: "进行中",
              type: "line",
              stack: "总量",
              itemStyle: {
                color: "#a1d685"
              },
              areaStyle: { normal: {} },
              data: data_wwc
            },
            {
              name: "未指派",
              type: "line",
              stack: "总量",
              itemStyle: {
                color: "#a695f4"
              },
              areaStyle: { normal: {} },
              data: data_wzp
            }
          ]
        };
        chart2.setOption(option2);
        chart2.resize();
      }

      this.setState({ chart2Loading: false });
    });
  }

  chart3(id, start, end, isDraw, isBigChart = false) {
    if (isBigChart) {
      if (isDraw !== "重绘") {
        this.setState({ chart3BigLoading: true });
      }
      var chart3 = echarts.init(document.getElementById("bigChart"));
    } else {
      if (isDraw !== "重绘") {
        this.setState({ chart3Loading: true });
      }
      var chart3 = echarts.init(document.getElementById("main3"));
    }
    if (isDraw === "重绘") {
      chart3.resize();
      return false;
    }
    const data = {
      projectId: id,
      attdate01: start ? start : "",
      attdate02: end ? end : ""
    };
    getChartByUserTask(data, res => {
      if (res.err) {
        return false;
      }
      if (isBigChart) {
        this.setState({ bigCharShow: true, bigCharTitle: "人员任务统计" });
      }
      if (res.tasktableData.length === 0) {
        this.setState({ chart3Render: false });
      } else {
        this.setState({ chart3Render: true });
        const chart3names = [];
        const chart3Datas_zcwc = [];
        const chart3Datas_tqwc = [];
        const chart3Datas_yqwc = [];
        const chart3Datas_zprw = [];
        const chart3Datas_qrrw = [];
        const chart3Datas_cjrw = [];

        if (res.tasktableData.length > 10) {
          this.setState({ bigCharHeight: res.tasktableData.length * 20 + 100 });
        } else {
          this.setState({ bigCharHeight: 300 });
        }

        res.tasktableData.map((item, i) => {
          chart3names.push(item.name);
          chart3Datas_zprw.push(item.dzprw);
          chart3Datas_cjrw.push(item.dwcrw);
          chart3Datas_qrrw.push(item.dqrrw);
          // chart3Datas_tqwc.push(item.tqwc);
          // chart3Datas_zcwc.push(item.zcwc);
          // chart3Datas_yqwc.push(item.yqwc);
        });
        var option3 = {
          tooltip: {
            trigger: "axis",
            axisPointer: {
              // 坐标轴指示器，坐标轴触发有效
              type: "shadow" // 默认为直线，可选为：'line' | 'shadow'
            }
          },
          legend: {
            data: ["待指派", "待完成", "待确认"],
            bottom: 0
          },
          grid: {
            left: "0",
            right: "30",
            bottom: "60",
            top: "0",
            containLabel: true
          },
          xAxis: {
            type: "value",
            // show: false,
            axisLine: {
              lineStyle: {
                color: "#C1BFBF"
              }
            }
          },
          yAxis: {
            type: "category",
            data: chart3names,
            axisLine: {
              lineStyle: {
                color: "#C1BFBF"
              }
            }
          },
          series: [
            {
              name: "待指派",
              type: "bar",
              stack: "总量",
              label: {
                show: false
              },
              itemStyle: {
                color: "#a695f4"
              },
              data: chart3Datas_zprw
            },
            {
              name: "待完成",
              type: "bar",
              stack: "总量",
              label: {
                show: false
              },
              itemStyle: {
                color: "#a1d685"
              },
              data: chart3Datas_cjrw
            },
            {
              name: "待确认",
              type: "bar",
              stack: "总量",
              label: {
                show: false
              },
              itemStyle: {
                color: "#81d4fa"
              },
              data: chart3Datas_qrrw
            }
          ]
        };
        chart3.setOption(option3);
        chart3.resize();
      }
      this.setState({ chart3Loading: false, chart3BigLoading: false });
    });
  }

  chart4(id, start, end, isDraw, search = "1", isBigChart = false) {
    if (isBigChart) {
      if (isDraw !== "重绘") {
        this.setState({ chart4BigLoading: true });
      }
      var chart4 = echarts.init(document.getElementById("bigChart"));
    } else {
      if (isDraw !== "重绘") {
        this.setState({ chart4Loading: true });
      }
      var chart4 = echarts.init(document.getElementById("main4"));
    }
    if (isDraw === "重绘") {
      chart4.resize();
      return false;
    }
    const data = {
      projectId: id,
      attdate01: start ? start : "",
      attdate02: end ? end : "",
      type: search ? search : "1"
    };
    getChartByUserMoney(data, res => {
      if (res.err) {
        return false;
      }
      if (isBigChart) {
        this.setState({ bigCharShow: true, bigCharTitle: "人员绩效统计" });
      }
      if (
        (res.contenTableData && res.contenTableData.length === 0) ||
        (res.tasktableData && res.tasktableData.length === 0)
      ) {
        this.setState({ chart4Render: false });
      } else {
        this.setState({ chart4Render: true });

        const chart4names = [];
        const chart4data_wcrw = [];
        const chart4data_zprw = [];
        const chart4data_qrrw = [];
        const chart4data_cjrw = [];

        if (search == "1") {
          if (res.contenTableData.length > 10) {
            this.setState({
              bigCharHeight: res.contenTableData.length * 20 + 100
            });
          } else {
            this.setState({ bigCharHeight: 300 });
          }
          res.contenTableData.map((item, i) => {
            chart4names.push(item.name);
            chart4data_wcrw.push(item.zcwcjx + item.yqwcjx);
            chart4data_zprw.push(item.zprwjx);
            chart4data_qrrw.push(item.qrrwjx);
            chart4data_cjrw.push(item.cjrwjx);
          });
        } else if (search == "2") {
          if (res.tasktableData.length > 10) {
            this.setState({
              bigCharHeight: res.tasktableData.length * 20 + 100
            });
          } else {
            this.setState({ bigCharHeight: 300 });
          }
          res.tasktableData.map((item, i) => {
            chart4names.push(item.name);
            chart4data_wcrw.push(item.zcwc + item.yqwc);
            chart4data_zprw.push(item.zprw);
            chart4data_qrrw.push(item.qrrw);
            chart4data_cjrw.push(item.cjrw);
          });
        }
        var option4 = {
          tooltip: {
            trigger: "axis",
            axisPointer: {
              // 坐标轴指示器，坐标轴触发有效
              type: "shadow" // 默认为直线，可选为：'line' | 'shadow'
            }
          },
          legend: {
            data: ["创建任务", "指派任务", "确认任务", "完成任务"],
            bottom: 0
          },
          grid: {
            top: "0",
            left: "0",
            right: "30",
            bottom: "60",
            containLabel: true
          },
          xAxis: {
            type: "value",
            axisLine: {
              lineStyle: {
                color: "#C1BFBF"
              }
            }
          },
          yAxis: {
            type: "category",
            data: chart4names,
            axisLine: {
              lineStyle: {
                color: "#C1BFBF"
              }
            }
          },
          series: [
            {
              name: "创建任务",
              type: "bar",
              stack: "总量",
              label: {
                show: false
              },
              itemStyle: {
                color: "#d3c4bd"
              },
              data: chart4data_cjrw
            },
            {
              name: "指派任务",
              type: "bar",
              stack: "总量",
              label: {
                show: false
              },
              itemStyle: {
                color: "#a695f4"
              },
              data: chart4data_zprw
            },
            {
              name: "确认任务",
              type: "bar",
              stack: "总量",
              label: {
                show: false
              },
              itemStyle: {
                color: "#81d4fa"
              },
              data: chart4data_qrrw
            },
            {
              name: "完成任务",
              type: "bar",
              stack: "总量",
              label: {
                show: false
              },
              itemStyle: {
                color: "#90a4ae"
              },
              data: chart4data_wcrw
            }
          ]
        };
        chart4.setOption(option4);
        chart4.resize();
      }
      this.setState({ chart4Loading: false, chart4BigLoading: false });
    });
  }
  // 查询计算公式
  getFormula(id) {
    this.setState({ calculationModel: true });
    // let { FormulaList } = this.state;
    getFormulaById(id, data => {
      if (data.err) {
        return false;
      }
      if (data) {
        this.setState({
          createTask: Number(data.createPerf),
          appointedTask: Number(data.assignPerf),
          confirmationTask: Number(data.confirmPerf),
          finishTaskVal: Number(data.finishPerf),
          overdueVal: 100 - Number(data.overDiscount),
          advanceVal: Number(data.finishTqPerf) - 100,
          formulaId: data.id ? data.id : "",
          projectId: id
        });
      }
    });
  }
  // 保存
  saveFormula() {
    const {
      createTask,
      appointedTask,
      confirmationTask,
      finishTaskVal,
      overdueVal,
      advanceVal,
      projectId,
      formulaId,
      chart4searchType
    } = this.state;
    let FormulaLists = {};
    if (formulaId === "") {
      FormulaLists = {
        createPerf: createTask.toFixed(2),
        assignPerf: appointedTask.toFixed(2),
        confirmPerf: confirmationTask.toFixed(2),
        finishPerf: finishTaskVal.toFixed(2),
        overDiscount: (100 - overdueVal).toFixed(2),
        finishTqPerf: (advanceVal + 100).toFixed(2),
        projectId: projectId,
        finishZcPerf: "100",
        finishYqPerf: "100"
      };
    } else {
      FormulaLists = {
        createPerf: createTask.toFixed(2),
        assignPerf: appointedTask.toFixed(2),
        confirmPerf: confirmationTask.toFixed(2),
        finishPerf: finishTaskVal.toFixed(2),
        overDiscount: (100 - overdueVal).toFixed(2),
        finishTqPerf: (advanceVal + 100).toFixed(2),
        projectId: projectId,
        finishZcPerf: "100",
        finishYqPerf: "100",
        id: formulaId
      };
    }
    updateFormula(FormulaLists, data => {
      if (data.err) {
        return false;
      }
      if (data) {
        message.success("保存成功");
        this.setState({ calculationModel: false });
        this.selectType(chart4searchType);
      }
    });
  }
  // 人员任务和人员绩效筛选
  selectTime(type, date) {
    const { chart4searchType } = this.state;
    if (type === "ryjx") {
      let start = "";
      let end = "";
      if (date && date.length > 0) {
        start = dateToString(date[0]._d, "date");
        end = dateToString(date[1]._d, "date");
      }
      this.setState({ chart4Start: start, chart4End: end });
      this.chart4(this.props.projectId, start, end, "", chart4searchType);
    } else if (type === "ryrw") {
      let start = "";
      let end = "";
      if (date && date.length > 0) {
        start = dateToString(date[0]._d, "date");
        end = dateToString(date[1]._d, "date");
      }
      this.setState({ chart3Start: start, chart3End: end });
      this.chart3(this.props.projectId, start, end);
    }
  }
  //人员绩效按类型筛选
  selectType(type) {
    const { chart4Start, chart4End } = this.state;
    this.setState({ chart4searchType: type });
    this.chart4(this.props.projectId, chart4Start, chart4End, "", type);
  }

  bigChartRender() {
    const { bigCharShow, bigCharTitle, bigCharHeight } = this.state;
    return (
      <div
        className="bigChartBox"
        style={bigCharShow ? {} : { display: "none" }}
      >
        <div className="bigChartDiv">
          <h3>
            <span>{bigCharTitle}</span>
            <Icon
              type="close"
              onClick={() => {
                this.setState({ bigCharShow: false });
              }}
            />
          </h3>
          <div className="bigChart">
            <div
              className="chart"
              id="bigChart"
              style={{ height: bigCharHeight + "px" }}
            />
          </div>
        </div>
      </div>
    );
  }
  createTaskValChange(val, name) {
    const {
      createTask,
      appointedTask,
      confirmationTask,
      finishTaskVal
    } = this.state;
    if (createTask < 0) {
      this.setState({ createTask: 0 });
    }
    if (appointedTask < 0) {
      this.setState({ appointedTask: 0 });
    }
    if (confirmationTask < 0) {
      this.setState({ confirmationTask: 0 });
    }
    if (finishTaskVal < 0) {
      this.setState({ finishTaskVal: 0 });
    }
    if (name === "create") {
      this.setState({ createTask: val });
      if (createTask < val) {
        if (finishTaskVal > 0) {
          this.setState({
            finishTaskVal: 100 - val - confirmationTask - appointedTask
          });
        } else if (finishTaskVal === 0 && confirmationTask > 0) {
          this.setState({
            confirmationTask: 100 - val - appointedTask
          });
        } else if (finishTaskVal === 0 && confirmationTask === 0) {
          this.setState({
            appointedTask: 100 - val
          });
        }
      } else if (createTask > val) {
        this.setState({
          finishTaskVal: 100 - val - appointedTask - confirmationTask
        });
      }
    } else if (name === "appointed") {
      this.setState({ appointedTask: val });
      if (appointedTask < val) {
        if (finishTaskVal > 0) {
          this.setState({
            finishTaskVal: 100 - val - createTask - confirmationTask
          });
        } else if (finishTaskVal === 0 && confirmationTask > 0) {
          this.setState({
            confirmationTask: 100 - val - createTask
          });
        } else if (finishTaskVal === 0 && confirmationTask === 0) {
          this.setState({
            createTask: 100 - val
          });
        }
      } else if (appointedTask > val) {
        this.setState({
          finishTaskVal: 100 - val - createTask - confirmationTask
        });
      }
    } else if (name === "confirmation") {
      this.setState({ confirmationTask: val });
      if (confirmationTask < val) {
        if (finishTaskVal > 0) {
          this.setState({
            finishTaskVal: 100 - val - createTask - appointedTask
          });
        } else if (finishTaskVal === 0 && appointedTask > 0) {
          this.setState({
            appointedTask: 100 - val - createTask
          });
        } else if (finishTaskVal === 0 && appointedTask === 0) {
          this.setState({
            createTask: 100 - val
          });
        }
      } else if (confirmationTask > val) {
        this.setState({
          finishTaskVal: 100 - val - appointedTask - createTask
        });
      }
    } else if (name === "finish") {
      this.setState({ finishTaskVal: val });
      if (finishTaskVal < val) {
        if (createTask > 0) {
          this.setState({
            createTask: 100 - val - confirmationTask - appointedTask
          });
        } else if (createTask === 0 && appointedTask > 0) {
          this.setState({ appointedTask: 100 - val - confirmationTask });
        } else if (createTask === 0 && appointedTask === 0) {
          this.setState({ confirmationTask: 100 - val });
        }
      } else if (finishTaskVal > val) {
        this.setState({
          confirmationTask: 100 - val - appointedTask - createTask
        });
      }
    }
  }
  render() {
    const {
      chart1Loading,
      chart2Loading,
      chart3Loading,
      chart4Loading,
      chart1DataInfo,
      FormulaList,
      chart3Start,
      chart3End,
      chart4Start,
      chart4End,
      chart4searchType,
      chart1Render,
      chart2Render,
      chart3Render,
      chart4Render,
      chart3BigLoading,
      chart4BigLoading,
      createTask,
      appointedTask,
      overdueVal,
      finishTask,
      confirmationTask,
      finishTaskVal,
      calculationModel,
      advanceVal
    } = this.state;
    const { jurisdiction } = this.props;
    return (
      <div className="projectChart">
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        {this.bigChartRender()}
        <div className="projectChart_row">
          <div className="chartBox" style={{ paddingBottom: 10 }}>
            <div className="chart_title">任务概述</div>
            <div className="chart">
              <Spin spinning={chart1Loading} />
              <div
                id="main1"
                style={{
                  width: "50%",
                  left: "0",
                  position: "absolute",
                  top: "0",
                  bottom: "0",
                  display: chart1Render ? "" : "none"
                }}
              />
              {!chart1Render ? (
                <NullView icon={"Warning"} showTit={"当前还没有可统计的数据"} />
              ) : (
                ""
              )}
              {chart1Render ? (
                <div className="datalist">
                  {chart1DataInfo && chart1DataInfo.length > 0
                    ? chart1DataInfo.map((item, i) => {
                        return (
                          <div className="li" key={i + "chart1DataInfo"}>
                            <div
                              className="dian"
                              style={{ background: item.itemStyle.color }}
                            />
                            <div className="charType">{item.name}</div>
                            <div className="baifenbi">{item.value}</div>
                          </div>
                        );
                      })
                    : ""}
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
          <div className="chartBox" style={{ paddingBottom: 10 }}>
            <div className="chart_title">项目进展</div>
            <Spin spinning={chart2Loading} />
            <div
              className="chart"
              id="main2"
              style={chart2Render ? {} : { display: "none" }}
            />
            {!chart2Render ? (
              <NullView icon={"Warning"} showTit={"当前还没有可统计的数据"} />
            ) : (
              ""
            )}
          </div>
        </div>
        <div className="projectChart_row">
          <div className="chartBox">
            <div className="chart_title">
              人员待办统计
              {!chart3Loading && chart3Render ? (
                <i
                  className="icon iconfont icon-icon--"
                  onClick={() => {
                    this.chart3(
                      this.props.projectId,
                      chart3Start,
                      chart3End,
                      "",
                      true
                    );
                  }}
                />
              ) : (
                ""
              )}
              {chart3BigLoading ? (
                <Icon style={{ right: "43px" }} type="loading" />
              ) : (
                ""
              )}
            </div>
            {chart3Render ? (
              <div className="chart_search">
                {chart3Start && chart3End ? (
                  <RangePicker
                    size="small"
                    value={[
                      moment(chart3Start, dateFormat),
                      moment(chart3End, dateFormat)
                    ]}
                    onChange={e => this.selectTime("ryrw", e)}
                  />
                ) : (
                  <div>
                    <RangePicker
                      size="small"
                      onChange={e => this.selectTime("ryrw", e)}
                    />
                  </div>
                )}
                <a
                  href={
                    baseURI +
                    "/calculate/downLoadTaskCalculate?projectId=" +
                    this.props.projectId +
                    "&attdate01=" +
                    chart3Start +
                    "&attdate02=" +
                    chart3End
                  }
                  download
                  target="_blank"
                >
                  <span className="download">导出</span>
                </a>
              </div>
            ) : (
              ""
            )}
            <Spin spinning={chart3Loading} />
            <div
              className="chart"
              id="main3"
              style={chart3Render ? {} : { display: "none" }}
            />
            {!chart3Render ? (
              <NullView icon={"Warning"} showTit={"当前还没有可统计的数据"} />
            ) : (
              ""
            )}
          </div>
          <div className="chartBox">
            <div className="chart_title">
              人员绩效统计
              <span
                className="more"
                style={chart4BigLoading ? { margin: "0 50px 0 0" } : {}}
                onClick={() => this.getFormula(this.props.projectId)}
              >
                查看计算公式
              </span>
              {chart4Render ? (
                <i
                  className="icon iconfont icon-icon--"
                  onClick={() => {
                    this.chart4(
                      this.props.projectId,
                      chart4Start,
                      chart4End,
                      "",
                      chart4searchType,
                      true
                    );
                  }}
                />
              ) : (
                ""
              )}
              {chart4BigLoading ? (
                <Icon style={{ right: "43px" }} type="loading" />
              ) : (
                ""
              )}
            </div>
            <div className="chart_search4">
              <Radio.Group
                className="group"
                defaultValue="1"
                buttonStyle="solid"
                value={chart4searchType}
                onChange={e => {
                  this.selectType(e.target.value);
                  this.setState({
                    chart4searchType: e.target.value,
                    chart4Loading: true
                  });
                }}
              >
                <Radio.Button value="1">按绩效值</Radio.Button>
                <Radio.Button value="2">按任务数</Radio.Button>
              </Radio.Group>
              {chart4Render ? (
                <div className="time">
                  {chart4Start && chart4End ? (
                    <RangePicker
                      size="small"
                      value={[
                        moment(chart4Start, dateFormat),
                        moment(chart4End, dateFormat)
                      ]}
                      onChange={e => this.selectTime("ryjx", e)}
                    />
                  ) : (
                    <div>
                      <RangePicker
                        size="small"
                        onChange={e => this.selectTime("ryjx", e)}
                      />
                    </div>
                  )}
                </div>
              ) : (
                ""
              )}
              <a
                href={
                  baseURI +
                  "/calculate/downLoadFlowContenCalculate?projectId=" +
                  this.props.projectId +
                  "&attdate01=" +
                  chart4Start +
                  "&attdate02=" +
                  chart4End +
                  "&type=" +
                  chart4searchType
                }
                download
                target="_blank"
              >
                <span className="download">导出</span>
              </a>
            </div>
            <Spin spinning={chart4Loading} />
            <div
              className="chart"
              id="main4"
              style={chart4Render ? {} : { display: "none" }}
            />
            {!chart4Render ? (
              <NullView icon={"Warning"} showTit={"当前还没有可统计的数据"} />
            ) : (
              ""
            )}
          </div>
        </div>
        {/* 查看计算公式弹框 */}

        <Modal
          title="绩效计算系数"
          visible={calculationModel}
          onCancel={() => {
            this.setState({ calculationModel: false });
          }}
          width={450}
          footer={null}
          className="calculationModel"
          wrapClassName="calculationModel"
          maskClosable={false}
        >
          <div className="calculationModel-list">
            <span className="title">创建任务</span>

            <Slider
              min={0}
              max={100}
              onChange={value => {
                this.createTaskValChange(value, "create");
              }}
              value={typeof createTask === "number" ? createTask : 0}
              style={{ width: 200 }}
              disabled={!jurisdiction}
            />
            <InputNumber
              min={0}
              precision={2}
              max={100}
              style={{ marginLeft: 20 }}
              value={createTask}
              formatter={value => `${value}%`}
              onChange={value => {
                this.createTaskValChange(value, "create");
              }}
              disabled={!jurisdiction}
            />
          </div>
          <div className="calculationModel-list">
            <span className="title">指派任务</span>
            <Slider
              min={0}
              max={100}
              onChange={value => {
                this.createTaskValChange(value, "appointed");
              }}
              value={typeof appointedTask === "number" ? appointedTask : 0}
              style={{ width: 200 }}
              disabled={!jurisdiction}
            />
            <InputNumber
              min={0}
              precision={2}
              max={100}
              style={{ marginLeft: 20 }}
              value={appointedTask}
              formatter={value => `${value}%`}
              onChange={value => {
                this.createTaskValChange(value, "appointed");
              }}
              disabled={!jurisdiction}
            />
          </div>
          <div className="calculationModel-list">
            <span className="title">确认任务</span>

            <Slider
              min={0}
              max={100}
              onChange={value => {
                this.createTaskValChange(value, "confirmation");
              }}
              value={
                typeof confirmationTask === "number" ? confirmationTask : 0
              }
              style={{ width: 200 }}
              disabled={!jurisdiction}
            />
            <InputNumber
              min={0}
              precision={2}
              max={100}
              style={{ marginLeft: 20 }}
              value={confirmationTask}
              formatter={value => `${value}%`}
              onChange={value => {
                this.createTaskValChange(value, "confirmation");
              }}
              disabled={!jurisdiction}
            />
          </div>
          <div className="calculationModel-line" />

          <div className="calculationModel-list">
            <span className="title">完成任务</span>
            <Slider
              min={0}
              max={100}
              onChange={value => {
                this.createTaskValChange(value, "finish");
              }}
              value={typeof finishTaskVal === "number" ? finishTaskVal : 0}
              style={{ width: 200 }}
              disabled={!jurisdiction}
            />
            <InputNumber
              min={0}
              precision={2}
              max={100}
              style={{ marginLeft: 20 }}
              value={finishTaskVal}
              formatter={value => `${value}%`}
              onChange={value => {
                this.createTaskValChange(value, "finish");
              }}
              disabled={!jurisdiction}
            />
          </div>
          <div className="calculationModel-list overdueColor">
            <span className="title">逾期扣除</span>
            <div className="overdueTotal">
              <InputNumber
                min={0}
                precision={2}
                max={100}
                style={{ marginLeft: 6 }}
                value={overdueVal}
                formatter={value => `${value}%`}
                onChange={value => {
                  this.setState({ overdueVal: value });
                }}
                disabled={!jurisdiction}
              />
            </div>
            <span className="titleBottom">提前奖励</span>
            <div className="overdueTotal">
              <InputNumber
                min={0}
                precision={2}
                max={100}
                // style={{ marginLeft: 20 }}
                value={advanceVal}
                formatter={value => `${value}%`}
                onChange={value => {
                  this.setState({ advanceVal: value });
                }}
                disabled={!jurisdiction}
              />
            </div>
            {/* <Slider
              min={0}
              max={100}
              onChange={value => {
                this.setState({ overdueVal: value });
              }}
              value={typeof overdueVal === "number" ? overdueVal : 0}
              style={{ width: 200 }}
              disabled={!jurisdiction}
            />
            <InputNumber
              min={0}
              precision={2}
              max={100}
              style={{ marginLeft: 20 }}
              value={overdueVal}
              formatter={value => `${value}%`}
              onChange={value => {
                this.setState({ overdueVal: value });
              }}
              disabled={!jurisdiction}
            /> */}
          </div>
          {/* <div className="calculationModel-line" /> */}

          <div className="calculationModel-list">
            <p>
              *计算说明：若一个任务的绩效为100，根据上面设置各个操作所占的绩效比例，创建任务计
              {createTask}绩效， 指派任务计{appointedTask}绩效，确认任务计
              {confirmationTask}绩效，正常完成任务计{finishTaskVal}绩效。
              如任务逾期完成,则扣除正常绩效的{overdueVal}%，计
              {((100 - overdueVal) * finishTaskVal * 0.01).toFixed(2)}
              绩效；如任务提前完成，则奖励正常绩效的{advanceVal}%,计
              {((100 + advanceVal) * finishTaskVal * 0.01).toFixed(2)}绩效。
            </p>
          </div>
          {jurisdiction ? (
            <div className="footerButton">
              <Button
                key="back"
                onClick={() => {
                  this.setState({ calculationModel: false });
                }}
              >
                取消
              </Button>
              <Button
                key="submit"
                type="primary"
                style={{ marginLeft: 20 }}
                onClick={() => this.saveFormula()}
              >
                保存
              </Button>
            </div>
          ) : (
            ""
          )}
        </Modal>
      </div>
    );
  }
}
