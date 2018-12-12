import React from "react";
import withRedux from "next-redux-wrapper";
import { bindActionCreators } from "redux";
import { initStore } from "../store";
import {
  Layout,
  LocaleProvider,
  Radio,
  Icon,
  Spin,
  Checkbox,
  DatePicker,
  Popover
} from "antd";
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

import stylesheet from "styles/views/statistics.scss";
import Head from "../components/header";
import BarChart from "../components/barChart";
import TagSelect from "../components/tagSelect";
import * as projectAction from "../core/actions/project";
import * as statisticsAction from "../core/actions/statistics";
import { baseURI } from "../core/api/HttpClient";
import NullView from "../components/nullView";

import {
  getProjectProgess,
  getPendStatistics,
  getProjectStatistics,
  getNumByProject,
  getNumByPerson,
  getProjectListByTypeTag,
  getContentByProject,
  getContentByPerson,
  getPendByProject, //待办统计按项目,
  down,
  downByProject
} from "../core/service/project.service";
import ContentLeftList from "../components/common/contentLeftList"; //左侧列表
import { getTagColorByColorCode, dateToString } from "../core/utils/util";
const { Content } = Layout;
const { RangePicker } = DatePicker;
const dateFormat = "YYYY/MM/DD";

class Statistics extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tagComponentShow: false,
      tagSelecteds: [],
      projectList: [],
      projectListLoading: false,
      type: "0",
      labelId: [],
      projectNum: 0, //项目数
      overdue: 0, //综合进展
      overFinish: 0, //逾期完成率
      participate: 0, //参与人数
      pendNum: 0, //待完成任务
      overNum: 0, //逾期任务
      finishNum: 0, //已完成的任务
      finishConten: 0, //已完成的绩效和
      progress: 0, //综合进展
      bottomColor: false,
      allproject: false, //全部项目
      show: false,
      dzp: 0,
      jxz: 0,
      yyq: 0,
      dqr: 0,
      ywc: 0,
      yzz: 0,
      dzpYq: 0,
      dqrYq: 0,
      ywcYq: 0,
      chart2ProjectList: [],
      chart1Loading: false,
      chart2Loading: false,
      chartProgessLoading: false,
      menuBar: "1",
      progessStart: "",
      progessEnd: "",
      newprogessStart: "",
      newprogessEnd: "",
      progessDates: [],
      flag: true,
      barChartProList: [], //barChart组件的统计数据源
      taskPendList: [], //按人员统计
      taskNumList: [], //绩效按项目
      projectIds: [],
      taskPersonList: [], //绩效按人员
      performancePro: [], // 绩效统计 绩效值按项目
      performancePer: [], // 绩效安     按人员
      progessDate: [],
      progessWzp: [],
      progessWwc: [],
      progessDqr: [],
      progessYwc: [],
      loading: true,
      chartMenuShow: false,
      chartProgessRender: true,
      chartInfoData: [],
      pageLoading: true
    };
  }

  componentWillMount() {
    this.getProjectList();
    const that = this;
    const { type, labelId } = this.state;
    if (
      type === "0" &&
      labelId.length === 0 &&
      ((this.props.projectChartVal && this.props.projectChartVal.length > 0) ||
        (this.props.projectProgessVal &&
          this.props.projectProgessVal.length > 0))
    ) {
      const dates = [];
      const data_ywc = [];
      const data_dqr = [];
      const data_wwc = [];
      const data_wzp = [];
      this.props.projectProgessVal.map(item => {
        dates.push(item.date);
        data_ywc.push(item.ywcCount / 2);
        data_dqr.push(item.dqrCount / 2);
        data_wwc.push(item.wwcCount / 2);
        data_wzp.push(item.wzpCount / 2);
      });
      const projectId = [];
      this.props.projectChartVal.map(ite => {
        projectId.push(ite.id);
      });
      that.setState(
        {
          dzp: that.props.stateChartVal && that.props.stateChartVal.dzp,
          jxz: that.props.stateChartVal && that.props.stateChartVal.jxz,
          yyq: that.props.stateChartVal && that.props.stateChartVal.yyq,
          dqr: that.props.stateChartVal && that.props.stateChartVal.dqr,
          ywc: that.props.stateChartVal && that.props.stateChartVal.ywc,
          yzz: that.props.stateChartVal && that.props.stateChartVal.yzz,
          dzpYq: that.props.stateChartVal && that.props.stateChartVal.dzpYq,
          dqrYq: that.props.stateChartVal && that.props.stateChartVal.dqrYq,
          ywcYq: that.props.stateChartVal && that.props.stateChartVal.ywcYq,
          chart2ProjectList: this.props.projectChartVal,
          progessDate: dates,
          progessWzp: data_wzp,
          progessWwc: data_wwc,
          progessDqr: data_dqr,
          progessYwc: data_ywc,
          projectIds: projectId,
          progessYwc: data_ywc,

          barChartProList: that.props.barChartProList,
          taskNumList: that.props.taskNumList,
          taskPendList: that.props.taskPendList,
          taskPersonList: that.props.taskPersonList,
          performancePro: that.props.performancePro,
          performancePer: that.props.performancePer,
          projectNum: that.props.headerData.projectNum, //项目数
          overdue: that.props.headerData.overdue, //综合进展
          overFinish: that.props.headerData.overFinish, //逾期完成率
          participate: that.props.headerData.participate, //参与人数
          pendNum: that.props.headerData.pendNum, //待完成任务
          overNum: that.props.headerData.overNum, //逾期任务
          finishNum: that.props.headerData.finishNum, //已完成的任务
          finishConten: that.props.headerData.finishConten, //已完成的绩效和
          progress: that.props.headerData.progress, //综合进展,
          loading: false,
          pageLoading: false
        },
        () => {}
      );
    } else {
      //       this.getAllProject();
    }
  }

  componentDidMount() {
    const that = this;
    const { type, labelId, count } = this.state;
    if (
      type === "0" &&
      labelId.length === 0 &&
      ((this.props.projectChartVal && this.props.projectChartVal.length > 0) ||
        (this.props.projectProgessVal &&
          this.props.projectProgessVal.length > 0))
    ) {
      that.chart1();
      that.chart2();
      that.chartProgess();
    } else {
      console.log("start");
      this.getAllProject();
    }
    window.onresize = () => {
      console.log(" this.chart1", this.chart1);
      console.log(" this.chartProgess", this.chartProgess);
      this.chart1.resize();
      this.chart2.resize();
      this.chartProgess.resize();
      //       this.resize();
    };
  }

  componentWillReceiveProps() {}

  componentWillUnmount() {}
  //默认获取全部项目统计数据
  getAllProject() {
    this.setState({ projectListLoading: true });
    getProjectListByTypeTag({ type: 0, labelId: [] }, data => {
      console.log("data", data);
      this.setState(
        {
          projectList: data.projectList,
          projectListLoading: false
        },
        () => {
          this.projectStatistics();
        }
      );
    });
  }

  //获取全部项目列表
  getProjectList(type = 0, labelId = []) {
    const param = {
      type: type,
      labelId: labelId
    };
    this.setState({ projectListLoading: true });
    getProjectListByTypeTag(param, data => {
      this.setState({
        projectList: data.projectList,
        projectListLoading: false
      });
    });
  }

  //点击标签删除
  deleteTag(id) {
    const { tagSelecteds, type } = this.state;
    const labelIds = [];
    if (tagSelecteds.length > 0) {
      tagSelecteds.map((item, index) => {
        if (item.id === id) {
          tagSelecteds.splice(index, 1);
        }
      });
    }
    this.setState({ tagSelecteds: tagSelecteds });
    if (tagSelecteds.length > 0) {
      tagSelecteds.map(item => {
        labelIds.push(item.id);
      });
    }
    this.setState({ labelId: labelIds });
    this.getProjectList(type, labelIds);
  }
  //点击项目删除
  deleteProject(id) {
    const { projectList } = this.state;
    let projectListcopy = [];
    if (projectList.length > 0) {
      projectList.map((item, index) => {
        if (item.id === id) {
        } else {
          projectListcopy.push(item);
        }
      });
    }

    this.setState({ projectList: projectListcopy });
  }
  //选择标签回调
  selectedTag(val) {
    const { type } = this.state;
    const labelId = [];
    val.map(item => {
      labelId.push(item.id);
    });
    this.getProjectList(type, labelId);
    this.setState({ labelId: labelId });
  }
  //清楚筛选
  clearAll() {
    this.setState({
      tagSelecteds: [],
      allproject: true,
      bottomColor: true,
      labelId: []
    });
    this.getProjectList(0, []);
  }
  //统计
  projectStatistics() {
    const { projectList } = this.state;
    const projectIds = [];
    if (projectList.length > 0) {
      projectList.map(item => {
        projectIds.push(item.id);
      });
    }
    const obj = { projectIds: projectIds };
    if (projectList.length > 0) {
      getProjectStatistics(obj, data => {
        console.log("getProjectStatistics", "data");

        const { type, labelId } = this.state;
        if (data) {
          if (
            type === "0" &&
            labelId.length === 0 &&
            this.props.projectChartVal &&
            this.props.projectChartVal.length === 0
          ) {
            let chart1Data = {};
            chart1Data.dzp = data.daizp;
            chart1Data.jxz = data.jinxz;
            chart1Data.yyq = data.jxzyq;
            chart1Data.dqr = data.daiqr;
            chart1Data.ywc = data.yiwc;
            chart1Data.yzz = data.yizz;
            chart1Data.dzpYq = data.dzpyq;
            chart1Data.dqrYq = data.dqryq;
            chart1Data.ywcYq = data.ywcyq;
            let headerData = {};
            (headerData.overdue = data.overdue),
              (headerData.overFinish = data.overFinish),
              (headerData.participate = data.participate),
              (headerData.pendNum = data.pendNum),
              (headerData.overNum = data.overNum),
              (headerData.finishNum = data.finishNum),
              (headerData.finishConten = data.finishConten),
              (headerData.projectNum = data.projectNum),
              (headerData.progress = data.progress),
              this.props.setStateVal(chart1Data);
            this.props.setProjectVal(data.projectList);
            this.props.setHeaderData(headerData);
          }
        }

        setTimeout(() => {
          this.setState(
            {
              overdue: data.overdue,
              overFinish: data.overFinish,
              participate: data.participate,
              pendNum: data.pendNum,
              overNum: data.overNum,
              finishNum: data.finishNum,
              finishConten: data.finishConten,
              projectNum: data.projectNum,
              progress: data.progress,
              dzp: data.daizp,
              jxz: data.jinxz,
              yyq: data.jxzyq,
              dqr: data.daiqr,
              ywc: data.yiwc,
              yzz: data.yizz,
              dzpYq: data.dzpyq,
              dqrYq: data.dqryq,
              ywcYq: data.ywcyq,
              chart2ProjectList: data.projectList,
              projectIds: projectIds,
              loading: true
            },
            () => {
              console.log("startChat1", "startChat");
              this.chart1();
              this.chart2();
            }
          );
        }, 100);
      });

      //待办统计 按项目
      getPendByProject(obj, data => {
        if (data) {
          if (
            this.props.barChartProList &&
            this.props.barChartProList.length === 0
          ) {
            this.props.getPendByProject(data.taskPendList);
          }
        }
        this.setState({ barChartProList: data.taskPendList });
      });
      //待办统计  按人员
      getPendStatistics(obj, data => {
        if (data) {
          if (this.props.taskPendList && this.props.taskPendList.length === 0) {
            this.props.getPendStatistics(data.taskPendList);
          }
        }
        this.setState({ taskPendList: data.taskPendList, pageLoading: false });
      });
      //绩效按项目
      setTimeout(() => {
        getNumByProject(obj, data => {
          if (data) {
            if (this.props.taskNumList && this.props.taskNumList.length === 0) {
              this.props.getNumByProject(data.taskNumList);
            }
          }
          this.setState({ taskNumList: data.taskNumList });
        });
        //绩效按人员
        getNumByPerson(obj, data => {
          if (data) {
            if (
              this.props.taskPersonList &&
              this.props.taskPersonList.length === 0
            ) {
              this.props.getNumByPerson(data.taskNumList);
            }
          }
          this.setState({ taskPersonList: data.taskNumList });
        });
        //绩效按项目统计
        getContentByProject(obj, data => {
          if (data) {
            if (
              this.props.performancePro &&
              this.props.performancePro.length === 0
            ) {
              this.props.getContentByProject(data.taskContentList);
            }
          }
          this.setState({ performancePro: data.taskContentList });
        });
        //绩效统计绩效值按人员
        getContentByPerson(obj, data => {
          if (data) {
            if (
              this.props.performancePer &&
              this.props.performancePer.length === 0
            ) {
              this.props.getContentByPerson(data.tasContentList);
            }
          }
          this.setState({ performancePer: data.tasContentList });
        });
        //项目进展统计
        this.getProgess(projectIds);
        this.setState({ loading: false });
      }, 4000);
    }
  }
  getProgess(projectIds, attdate01, attdate02, type) {
    const data = {
      projectIds: projectIds,
      attdate01: attdate01 ? attdate01 : "",
      attdate02: attdate02 ? attdate02 : "",
      type: type ? type : ""
    };
    getProjectProgess(data, res => {
      if (res.err) {
        return false;
      }
      const { type, labelId } = this.state;
      if (res.length > 0) {
        if (
          type === "0" &&
          labelId.length === 0 &&
          this.props.projectProgessVal.length === 0
        ) {
          this.props.setProjectProgessVal(res);
        }
      }
      const dates = [];
      const data_wzp = [];
      const data_wwc = [];
      const data_dqr = [];
      const data_ywc = [];
      if (res.length > 0) {
        res.map(item => {
          dates.push(item.date);
          data_wzp.push(item.wzpCount / 2);
          data_wwc.push(item.wwcCount / 2);
          data_dqr.push(item.dqrCount / 2);
          data_ywc.push(item.ywcCount / 2);
        });
      }
      this.setState(
        {
          progessDate: dates,
          progessWzp: data_wzp,
          progessWwc: data_wwc,
          progessDqr: data_dqr,
          progessYwc: data_ywc
        },
        () => {
          this.chartProgess();
        }
      );
    });
  }
  selectTime(type, barId) {
    const { projectList } = this.state;
    const projectIds = [];
    projectList.map(item => {
      projectIds.push(item.id);
    });
    if (type === "currentMonth" && barId === 3) {
      const obj = {
        projectIds: projectIds,
        type: 0
      };
      getNumByProject(obj, data => {
        this.setState({ taskNumList: data.taskNumList });
      });
    }
    if (type === "currentMonth" && barId === 4) {
      const obj = {
        projectIds: projectIds,
        type: 0
      };
      getNumByPerson(obj, data => {
        this.setState({ taskPersonList: data.taskNumList });
      });
    }
    if (type === "currentMonth" && barId === 5) {
      const obj = {
        projectIds: projectIds,
        type: 0
      };
      getContentByProject(obj, data => {
        this.setState({ performancePro: data.taskContentList });
      });
    }
    if (type === "currentMonth" && barId === 6) {
      const obj = {
        projectIds: projectIds,
        type: 0
      };
      getContentByPerson(obj, data => {
        this.setState({ performancePer: data.tasContentList });
      });
    }
    if (type === "lastMonth" && barId === 3) {
      const obj = {
        projectIds: projectIds,
        type: 1
      };
      getNumByProject(obj, data => {
        this.setState({ taskNumList: data.taskNumList });
      });
    }
    if (type === "lastMonth" && barId === 4) {
      const obj = {
        projectIds: projectIds,
        type: 1
      };
      getNumByPerson(obj, data => {
        this.setState({ taskPersonList: data.taskNumList });
      });
    }
    if (type === "lastMonth" && barId === 5) {
      const obj = {
        projectIds: projectIds,
        type: 1
      };
      getContentByProject(obj, data => {
        this.setState({ performancePro: data.taskContentList });
      });
    }
    if (type === "lastMonth" && barId === 6) {
      const obj = {
        projectIds: projectIds,
        type: 1
      };
      getContentByPerson(obj, data => {
        this.setState({ performancePer: data.tasContentList });
      });
    }
    if ((type === "custom" || type.length === 2) && barId === 3) {
      const obj = {
        projectIds: projectIds,
        type: "",
        attdate01: type[0],
        attdate02: type[1]
      };
      getNumByProject(obj, data => {
        this.setState({ taskNumList: data.taskNumList });
      });
    }
    if ((type === "custom" || type.length === 2) && barId === 4) {
      const obj = {
        projectIds: projectIds,
        type: "",
        attdate01: type[0],
        attdate02: type[1]
      };
      getNumByPerson(obj, data => {
        this.setState({ taskPersonList: data.taskNumList });
      });
    }
    if ((type === "custom" || type.length === 2) && barId === 5) {
      const obj = {
        projectIds: projectIds,
        type: "",
        attdate01: type[0],
        attdate02: type[1]
      };
      getContentByProject(obj, data => {
        this.setState({ performancePro: data.taskContentList });
      });
    }
    if ((type === "custom" || type.length === 2) && barId === 6) {
      const obj = {
        projectIds: projectIds,
        type: "",
        attdate01: type[0],
        attdate02: type[1]
      };
      getContentByPerson(obj, data => {
        this.setState({ performancePer: data.tasContentList });
      });
    }
  }

  //   resize() {
  //     this.chart1("重绘");
  //     this.chart2("重绘");
  //     this.chartProgess("重绘");
  //   }
  chart1(isDraw) {
    console.log(this.refs.chart1);
    //     const { chartClientWidth } = this.state;
    this.chart1 = echarts.init(this.refs.chart1);
    let _this = this;
    //     优化部分，如果原来大屏显示的，窗口变化看情况选择，如果没变化，不用setoptions,直接就resize
    //     if (
    //       isDraw === "重绘" &&
    //       chartClientWidth == (_this.refs.chart1.clientWidth > 460 ? true : false)
    //     ) {
    //       chart1.resize();
    //       return false;
    //     } else {
    //       this.setState({
    //         chartClientWidth: _this.refs.chart1.clientWidth > 460 ? true : false
    //       });
    //     }
    this.setState({ chart1Loading: true });

    const { dzp, jxz, yyq, dqr, ywc, yzz, dzpYq, dqrYq, ywcYq } = this.state;
    console.log(dzp);
    console.log(jxz);
    console.log(yyq);
    console.log(dqr);
    console.log(ywc);
    console.log(yzz);
    console.log(dzpYq);
    console.log(dqrYq);
    console.log(ywcYq);
    const chart1Datas = [];
    chart1Datas.push(
      {
        value: dzp,
        name: "待指派",
        itemStyle: {
          color: "#b2a4f4"
        },
        key: dzpYq,
        icon: "circle"
      },
      {
        value: jxz,
        name: "进行中",
        itemStyle: {
          color: "#b1deb3"
        },
        key: yyq,
        icon: "circle"
      },
      {
        value: dqr,
        name: "待确认",
        itemStyle: {
          color: "#b3e1f7"
        },
        key: dqrYq,
        icon: "circle"
      },
      {
        value: ywc,
        name: "已完成",
        itemStyle: {
          color: "#cfdfe6"
        },
        key: ywcYq,
        icon: "circle"
      },
      {
        value: yzz,
        name: "已终止",
        itemStyle: {
          color: "#dbdcdc"
        },
        icon: "circle"
      }
    );
    //     let chartWidth = this.$refs.chart1.clientWidth;

    //     console.log(chartWidth);
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
                : "<br/>" + " 逾期:" + `${params.data.key}`
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
              position: "center",
              textStyle: {
                color: "transparent"
              }
            },
            emphasis: {
              show: true,
              textStyle: {
                fontSize: "30",
                fontWeight: "bold",
                color: "transparent"
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
      ],
      legend: {
        show: _this.refs.chart1.clientWidth > 460 ? true : false,
        // show: true,
        orient: "vertical",
        y: "center",
        padding: 10,
        x: "right",
        itemGap: 20,
        itemWidth: 16,
        textStyle: {
          fontSize: 12
        },
        align: "left",
        formatter: function(name) {
          var target;

          for (var i = 0, l = chart1Datas.length; i < l; i++) {
            if (chart1Datas[i].name == name) {
              target = chart1Datas[i].value;
            }
          }
          var arr = [name + `  ` + target];
          return arr.join("\n");
        }
      }
    };

    this.chart1.setOption(option1);
    console.log(chart1Datas, "chart1Datas");

    //     chart1.resize();
    //     window.onresize = chart1.resize();
    this.setState({ chart1Loading: false });
  }
  chart2(isDraw) {
    this.chart2 = echarts.init(this.refs.chart2, "light");
    if (isDraw === "重绘") {
      chart2.resize();
      return false;
    }
    this.setState({ chart2Loading: true });
    const { chart2ProjectList } = this.state;
    const chart2Datas = [];
    if (chart2ProjectList && chart2ProjectList.length > 0) {
      chart2ProjectList.map((item, i) => {
        chart2Datas.push({
          value: item.allTaskNum,
          name: item.proName
        });
      });
    }
    var option2 = {
      legend: {
        show: false
      },
      tooltip: {
        trigger: "item",
        formatter: function(params, ticket, callback) {
          var res = "";
          res =
            `<div style="display:inline-block;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;word-break: normal;max-width:200px;line-height:12px">${
              params.name
            }</div>` +
            " : " +
            params.value;
          return res;
        }
      },
      series: [
        {
          name: "项目概述",
          type: "pie",
          radius: ["50%", "70%"],
          avoidLabelOverlap: false,
          label: {
            normal: {
              show: false,
              position: "center",
              textStyle: {
                color: "transparent"
              }
            },
            emphasis: {
              show: true,
              textStyle: {
                fontSize: "30",
                fontWeight: "bold",
                color: "transparent"
              }
            }
          },
          labelLine: {
            normal: {
              show: false
            }
          },
          data: chart2Datas
        }
      ]
    };
    this.chart2.setOption(option2);
    //     window.onresize = chart2.resize();

    this.setState({ chart2Loading: false });
  }
  chartProgess(isDraw) {
    this.chartProgess = echarts.init(document.getElementById("chartProgess"));
    if (isDraw === "重绘") {
      this.chartProgess.resize();
      return false;
    }
    const {
      progessDate,
      progessDqr,
      progessWwc,
      progessWzp,
      progessYwc
    } = this.state;
    this.setState({ chartProgessLoading: true });
    if (progessDqr.length === 0) {
      this.setState({ chartProgessRender: false });
    } else {
      this.setState({ chartProgessRender: true });
      if (progessDate.length > 0) {
        let dayStart = new Date(progessDate[0]);
        let dayEnd = new Date(progessDate[progessDate.length - 1]);
        if (this.state.flag) {
          this.setState({
            newprogessStart: dateToString(dayStart, "date"),
            newprogessEnd: dateToString(dayEnd, "date"),
            flag: false
          });
        }
        this.setState({
          progessStart: dateToString(dayStart, "date"),
          progessEnd: dateToString(dayEnd, "date"),
          progessDates: progessDate
        });
        var optionpro = {
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
                date = `${params[0].name}`;
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
            containLabel: true
          },
          xAxis: [
            {
              type: "category",
              boundaryGap: false,
              data: progessDate
            }
          ],
          yAxis: [
            {
              type: "value"
            }
          ],
          series: [
            {
              name: "已完成",
              type: "line",
              stack: "总量",
              itemStyle: {
                normal: {
                  color: "#cfdfe6"
                }
              },
              areaStyle: {
                normal: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0,
                      color: "#546e7a"
                    },
                    {
                      offset: 1,
                      color: "#cfdfe6"
                    }
                  ])
                }
              },
              data: progessYwc
            },
            {
              name: "待确认",
              type: "line",
              stack: "总量",
              itemStyle: {
                normal: {
                  color: "#b3e1f7"
                }
              },
              areaStyle: {
                normal: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0,
                      color: "#76b8ef"
                    },
                    {
                      offset: 1,
                      color: "#b3e1f7"
                    }
                  ])
                }
              },
              data: progessDqr
            },
            {
              name: "进行中",
              type: "line",
              stack: "总量",
              itemStyle: {
                normal: {
                  color: "#b1deb3"
                }
              },
              areaStyle: {
                normal: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0,
                      color: "#7bc653"
                    },
                    {
                      offset: 1,
                      color: "#b1deb3"
                    }
                  ])
                }
              },
              data: progessWwc
            },
            {
              name: "未指派",
              type: "line",
              stack: "总量",
              itemStyle: {
                normal: {
                  color: "#b2a4f4"
                }
              },
              areaStyle: {
                normal: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    {
                      offset: 0,
                      color: "#6a4eed"
                    },
                    {
                      offset: 1,
                      color: "#b2a4f4"
                    }
                  ])
                }
              },
              data: progessWzp
            }
          ]
        };
        this.chartProgess.setOption(optionpro);
        setTimeout(() => {
          this.chartProgess.resize();
        });
      }
    }
    this.setState({ chartProgessLoading: false });
  }
  menuChange(bar, type) {
    const { projectIds } = this.state;
    if (bar === "1") {
      this.setState({ menuBar: "1" });
      this.dateCurrentChange("toDay");
    } else if (bar === "2") {
      this.setState({ menuBar: "2" });
      this.dateCurrentChange("month");
    } else if (bar === "3") {
      this.setState({ menuBar: "3" });
      this.dateCurrentChange("season");
    } else if (bar === "4") {
      this.setState({ menuBar: "4" });
      this.dateCurrentChange("year");
    }
    this.setState({ progessType: type });
    this.getProgess(projectIds, "", "", type);
  }
  dateChange(date) {
    const { projectIds } = this.state;
    let start = "";
    let end = "";
    if (date && date.length > 0) {
      start = dateToString(date[0]._d, "date");
      end = dateToString(date[1]._d, "date");
    }
    this.setState({ progessStart: start, progessEnd: end });
    this.changeTime(start, end);
    this.getProgess(projectIds, start, end, "");
  }
  getMonthDays(myMonth) {
    let now = new Date();
    let nowYear = now.getYear();
    let monthStartDate = new Date(nowYear, myMonth, 1);
    let monthEndDate = new Date(nowYear, myMonth + 1, 1);
    let days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
    return days;
  }
  getQuarterStartMonth() {
    let now = new Date();
    let nowMonth = now.getMonth();
    let quarterStartMonth = 0;
    if (nowMonth < 3) {
      quarterStartMonth = 0;
    }
    if (2 < nowMonth && nowMonth < 6) {
      quarterStartMonth = 3;
    }
    if (5 < nowMonth && nowMonth < 9) {
      quarterStartMonth = 6;
    }
    if (nowMonth > 8) {
      quarterStartMonth = 9;
    }
    return quarterStartMonth;
  }
  dateCurrentChange(type) {
    let now = new Date();
    let nowMonth = now.getMonth();
    let nowYear = now.getFullYear();
    switch (type) {
      case "month":
        let monthStartDate = new Date(nowYear, nowMonth, 1);
        let monthEndDate = new Date(
          nowYear,
          nowMonth,
          this.getMonthDays(nowMonth)
        );
        this.setState({
          progessStart: dateToString(monthStartDate, "date"),
          progessEnd: dateToString(monthEndDate, "date")
        });
        break;
      case "season":
        let quarterStartDate = new Date(
          nowYear,
          this.getQuarterStartMonth(),
          1
        );
        let quarterEndMonth = this.getQuarterStartMonth() + 2;
        let quarterEndDate = new Date(
          nowYear,
          quarterEndMonth,
          this.getMonthDays(quarterEndMonth)
        );
        this.setState({
          progessStart: dateToString(quarterStartDate, "date"),
          progessEnd: dateToString(quarterEndDate, "date")
        });
        break;
      case "year":
        let currentYearFirstDate = new Date(nowYear, 0, 1);
        let currentYearLastDate = new Date(nowYear, 11, 31);
        this.setState({
          progessStart: dateToString(currentYearFirstDate, "date"),
          progessEnd: dateToString(currentYearLastDate, "date")
        });
        break;
      case "toDay":
        let dayStart = new Date(this.state.progessDates[0]);
        let dayEnd = new Date(
          this.state.progessDates[this.state.progessDates.length - 1]
        );
        this.setState({
          progessStart: dateToString(dayStart, "date"),
          progessEnd: dateToString(dayEnd, "date")
        });
        break;
    }
  }
  changeTime(start, end) {
    const {
      progessStart,
      progessEnd,
      newprogessStart,
      newprogessEnd
    } = this.state;
    var _this = this;
    let now = new Date();
    let nowMonth = now.getMonth();
    let nowYear = now.getFullYear();
    let monthStartDate = new Date(nowYear, nowMonth, 1);
    let monthEndDate = new Date(nowYear, nowMonth, this.getMonthDays(nowMonth));
    let quarterStartDate = new Date(nowYear, this.getQuarterStartMonth(), 1);
    let quarterEndMonth = this.getQuarterStartMonth() + 2;
    let quarterEndDate = new Date(
      nowYear,
      quarterEndMonth,
      this.getMonthDays(quarterEndMonth)
    );
    let currentYearFirstDate = new Date(nowYear, 0, 1);
    let currentYearLastDate = new Date(nowYear, 11, 31);
    let dayStart = newprogessStart;
    let dayEnd = newprogessEnd;
    if (
      start == dateToString(monthStartDate, "date") &&
      end == dateToString(monthEndDate, "date")
    ) {
      this.setState({ menuBar: "2" });
    } else if (
      start == dateToString(quarterStartDate, "date") &&
      end == dateToString(quarterEndDate, "date")
    ) {
      this.setState({ menuBar: "3" });
    } else if (
      start == dateToString(currentYearFirstDate, "date") &&
      end == dateToString(currentYearLastDate, "date")
    ) {
      this.setState({ menuBar: "4" });
    } else if (start == dayStart && end == dayEnd) {
      this.setState({ menuBar: "1" });
    } else {
      this.setState({ menuBar: "" });
    }
  }
  headMenu() {
    const { chartMenuShow } = this.state;
    if (chartMenuShow) {
      this.setState({ chartMenuShow: false });
    } else {
      this.setState({ chartMenuShow: true });
    }
  }
  render() {
    const {
      tagComponentShow,
      tagSelecteds,
      projectList,
      show,
      projectListLoading,
      labelId,
      projectNum,
      overdue,
      overFinish,
      participate,
      pendNum,
      overNum,
      finishNum,
      finishConten,
      progress,
      allproject,
      chart1Loading,
      chart2Loading,
      chartProgessLoading,
      menuBar,
      progessStart,
      progessEnd,
      barChartProList,
      taskPendList,
      taskNumList,
      taskPersonList,
      performancePro,
      performancePer,
      loading,
      chartMenuShow,
      chartProgessRender,
      chartInfoData,
      pageLoading,
      projectIds
    } = this.state;

    return (
      <LocaleProvider locale={zh_CN}>
        <Layout>
          <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
          <Head
            menuShow={true}
            iconOnClickCallBack={() => {
              this.headMenu();
            }}
          />
          {pageLoading ? (
            <div style={{ textAlign: "center" }}>
              <Spin spinning={pageLoading} />
            </div>
          ) : (
            <Content>
              {/* {tagComponentShow ? (
                <TagSelect
                  title="标签"
                  type="2"
                  selectedTags={tagSelecteds}
                  closedCallBack={() => {
                    this.setState({ tagComponentShow: false });
                  }}
                  selectedProjects={JSON.parse(JSON.stringify(tagSelecteds))}
                  selectedCallBack={val => {
                    this.setState({ tagSelecteds: val }), this.selectedTag(val);
                  }}
                />
              ) : (
                ""
              )} */}
              <div className="pro_statistics">
                {/* {chartMenuShow ? (
                  <div
                    className="chartCen"
                    onClick={() => {
                      this.setState({ chartMenuShow: false });
                    }}
                  />
                ) : (
                  ""
                )} */}
                <ContentLeftList
                  ref="staticticsDetail"
                  pageType={1}
                  projectSearchDivOnTop={chartMenuShow}
                  projectOnClick={res => {
                    //     this.projectOnClick(res);
                    console.log(res);
                  }}
                  // style={{ height: "calc(100vh -70px)" }}
                />
                {/* <div
                  className={
                    chartMenuShow ? "pro_screen chart-left-fixed" : "pro_screen"
                  }
                >
                  <div className="pro_title">
                    <span className="pro_screen_title">项目筛选</span>
                    <span className="switch">
                      显示筛选结果
                      <Checkbox
                        onClick={() => {
                          this.setState({ show: !show });
                        }}
                        style={{ marginLeft: 8 }}
                      />
                    </span>
                  </div>
                  <div className="pro_radio">
                    <Radio.Group
                      defaultValue="0"
                      buttonStyle="outline"
                      onChange={e => {
                        this.getProjectList(e.target.value, labelId),
                          this.setState({
                            type: e.target.value,
                            allproject: false
                          });
                      }}
                    >
                      <Radio.Button value="0" checked={allproject}>
                        全部项目
                      </Radio.Button>
                      <Radio.Button value="1">我参与的</Radio.Button>
                      <Radio.Button value="2">我负责的</Radio.Button>
                      <Radio.Button value="3">我关注的</Radio.Button>
                    </Radio.Group>
                  </div>
                  <div className="pro_tag">
                    <div className="pro_tag_title">
                      项目标签{" "}
                      <Icon
                        type="plus"
                        className="icon_plus"
                        onClick={() => {
                          this.setState({ tagComponentShow: true });
                        }}
                      />
                    </div>
                    <ul>
                      {tagSelecteds && tagSelecteds.length > 0 ? (
                        tagSelecteds.map((item, index) => {
                          return (
                            <li
                              className={
                                "textMore " +
                                getTagColorByColorCode("1", item.color)
                              }
                              key={item.id}
                            >
                              <span>{item.labelname}</span>
                              <span
                                className="labelCen"
                                onClick={() => {
                                  this.deleteTag(item.id);
                                }}
                              >
                                点击移除
                              </span>
                            </li>
                          );
                        })
                      ) : (
                        <div className="null">未选标签</div>
                      )}
                    </ul>
                  </div>
                  <div className="border_bottom" />
                  {show ? (
                    <div className="pro_list">
                      <Spin spinning={projectListLoading} />
                      {projectList && projectList.length > 0
                        ? projectList.map((item, i) => {
                            return (
                              <div className="textMore" key={i}>
                                {item.proName}
                                <div
                                  className="projectCen"
                                  onClick={() => {
                                    this.deleteProject(item.id);
                                  }}
                                >
                                  点击移除
                                </div>
                              </div>
                            );
                          })
                        : ""}
                    </div>
                  ) : (
                    ""
                  )}
                  <div className="bottom_button">
                    <div
                      onClick={() => {
                        this.clearAll();
                      }}
                      style={
                        tagSelecteds.length > 0 ? { color: "#64b5f6" } : {}
                      }
                    >
                      清除筛选
                    </div>
                    <div
                      onClick={() => {
                        this.projectStatistics();
                      }}
                      className="last_button"
                      style={
                        projectList.length > 0
                          ? { backgroundColor: "#64b5f6" }
                          : {}
                      }
                    >
                      统计
                    </div>
                  </div>
                </div> */}
                <div className="pro_statistics_content">
                  <div className="pro_statistics_top">
                    <div className="pro_total">
                      <span>项目数</span>
                      <div>{parseFloat(projectNum).toLocaleString()}</div>
                    </div>
                    <div className="pro_total">
                      <span>参与人数</span>
                      <div>{parseFloat(participate).toLocaleString()}</div>
                    </div>
                    <div className="pro_total">
                      <span>综合进度</span>
                      <div>
                        {parseFloat(progress)}
                        <span style={{ color: "#000" }}>%</span>
                      </div>
                    </div>
                    <div className="borderLeft" />
                    <div className="pro_total">
                      <span>待完成任务</span>
                      <div>{parseFloat(pendNum).toLocaleString()}</div>
                    </div>
                    <div className="pro_total">
                      <span>逾期任务</span>
                      <div>{parseFloat(overNum).toLocaleString()}</div>
                    </div>
                    <div className="pro_total">
                      <span>逾期率</span>
                      <div>
                        {parseFloat(overdue)}
                        <span style={{ color: "#000" }}>%</span>
                      </div>
                    </div>
                    <div className="borderLeft" />
                    <div className="pro_total">
                      <span>已完成任务</span>
                      <div>{parseFloat(finishNum).toLocaleString()}</div>
                    </div>
                    <div className="pro_total">
                      <span>已完成绩效</span>
                      <div>{parseFloat(finishConten).toLocaleString()}</div>
                    </div>
                    <div className="pro_total">
                      <span>逾期完成率</span>
                      <div>
                        {parseFloat(overFinish)}
                        <span style={{ color: "#000" }}>%</span>
                      </div>
                    </div>
                  </div>
                  <div className="statistics_contain">
                    <div className="task_distribution">
                      <h2>任务分布</h2>
                      <div className="taskSpread">
                        {/* <div className="stateChart">
                          <div className="stateChartTitle">
                            <span>按状态</span>
                            <div className="stateOut">
                              <Popover
                                placement="left"
                                title={null}
                                content={
                                  <a
                                    href={
                                      baseURI +
                                      "/statistics/downLoadTaskByStatus"
                                    }
                                    download
                                    target="_blank"
                                  >
                                    <span className="download">导出</span>
                                  </a>
                                }
                                trigger="click"
                                className="outText"
                              >
                                <i className="iconfont icon-more"> </i>
                              </Popover>
                            </div>
                          </div>
                          <div className="stateChartBox">
                            <Spin spinning={chart1Loading} />
                            <div id="chart1" />
                          </div>
                        </div> */}
                        <div className="projectChart">
                          <div className="projectChartTitle">
                            <span>按状态</span>
                            <div className="projectOut" id="area1">
                              <Popover
                                placement="left"
                                title={null}
                                getPopupContainer={() =>
                                  document.getElementById("area1")
                                }
                                content={
                                  <a
                                    //     href={
                                    //       baseURI +
                                    //       "/statistics/downLoadTaskByStatus"
                                    //     }
                                    //     download
                                    onClick={() => {
                                      down(projectIds);
                                    }}
                                  >
                                    <span className="download">导出</span>
                                  </a>
                                }
                                trigger="click"
                                className="outText"
                              >
                                <i className="iconfont icon-more"> </i>
                              </Popover>
                            </div>
                          </div>
                          <div className="projectChartBox">
                            <Spin spinning={chart1Loading} />
                            <div
                              //       id="chart1"
                              ref="chart1"
                              style={{
                                width: "100%",
                                height: "100%"
                                // left: "0",
                                // position: "absolute",
                                // top: "0",
                                // bottom: "0"
                              }}
                            />
                          </div>
                          <div />
                        </div>
                        <div
                          className="projectChart"
                          style={{ marginLeft: "40px" }}
                        >
                          <div className="projectChartTitle">
                            <span>按项目</span>
                            <div className="projectOut" id="area2">
                              <Popover
                                placement="left"
                                title={null}
                                getPopupContainer={() =>
                                  document.getElementById("area2")
                                }
                                content={
                                  <a
                                    onClick={() => {
                                      downByProject(projectIds);
                                    }}
                                  >
                                    <span className="download">导出</span>
                                  </a>
                                }
                                trigger="click"
                                className="outText"
                              >
                                <i className="iconfont icon-more"> </i>
                              </Popover>
                            </div>
                          </div>
                          <div className="projectChartBox">
                            <Spin spinning={chart2Loading} />
                            <div
                              ref="chart2"
                              style={{
                                width: "100%",
                                height: "100%"
                                // left: "0",
                                // position: "absolute",
                                // top: "0",
                                // bottom: "0"
                              }}
                            />
                          </div>
                        </div>
                        <div className="clearfix" />
                      </div>
                    </div>
                    <div className="backlog_statistics">
                      <h2>待办统计</h2>
                      <div className="waitChart">
                        <div className="wait1">
                          <BarChart
                            title={"按项目"}
                            barChartProList={barChartProList.slice(0, 5)}
                            // loading={loading}
                            barId={1}
                            chartType={"toDo"}
                            downLoadType={projectIds}
                          />
                        </div>
                        <div className="wait2">
                          <BarChart
                            title={"按人员"}
                            barChartProList={taskPendList}
                            barId={2}
                            chartType={"toDo"}
                            // loading={loading}
                            className="barChart"
                            downLoadType={projectIds}
                          />
                        </div>
                        <div className="clearfix" />
                      </div>
                    </div>
                    <div className="backlog_statistics">
                      <h2>绩效统计(任务数)</h2>
                      <div className="waitChart">
                        <div className="wait1">
                          <BarChart
                            title={"按项目"}
                            barChartProList={taskNumList}
                            tabTimeShow={true}
                            barId={3}
                            chartType={"achievements"}
                            className="barChart"
                            downLoadType={projectIds}
                            selectedCallBack={(type, barId) => {
                              this.selectTime(type, barId);
                            }}
                            loading={loading}
                          />
                        </div>
                        <div className="wait2">
                          <BarChart
                            title={"按人员"}
                            barChartProList={taskPersonList}
                            tabTimeShow={true}
                            barId={4}
                            chartType={"achievements"}
                            className="barChart"
                            loading={loading}
                            downLoadType={projectIds}
                            selectedCallBack={(type, barId) => {
                              this.selectTime(type, barId);
                            }}
                          />
                        </div>
                        <div className="clearfix" />
                      </div>
                    </div>
                    <div className="backlog_statistics">
                      <h2>绩效统计(绩效值)</h2>
                      <div className="waitChart">
                        <div className="wait1">
                          <BarChart
                            title={"按项目"}
                            barChartProList={performancePro}
                            tabTimeShow={true}
                            barId={5}
                            chartType={"performance"}
                            loading={loading}
                            downLoadType={projectIds}
                            className="barChart"
                            selectedCallBack={(type, barId) => {
                              this.selectTime(type, barId);
                            }}
                          />
                        </div>
                        <div className="wait2">
                          <BarChart
                            title={"按人员"}
                            barChartProList={performancePer}
                            tabTimeShow={true}
                            barId={6}
                            loading={loading}
                            downLoadType={projectIds}
                            chartType={"performance"}
                            className="barChart"
                            selectedCallBack={(type, barId) => {
                              this.selectTime(type, barId);
                            }}
                          />
                        </div>
                        <div className="clearfix" />
                      </div>
                    </div>
                    <div className="taskProgess">
                      <h3>历史进展</h3>
                      <div className="progessBox">
                        <div className="progessTitle">
                          <div className="progessTime">
                            {progessStart !== "" && progessEnd !== "" ? (
                              <RangePicker
                                locale={zh_CN}
                                value={[
                                  moment(progessStart, dateFormat),
                                  moment(progessEnd, dateFormat)
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
                          </div>
                          <div className="timeBox">
                            <ul>
                              <li
                                onClick={() => {
                                  this.menuChange("1", "");
                                }}
                              >
                                <span
                                  className={
                                    menuBar === "1" ? "textColor" : "text"
                                  }
                                >
                                  至今
                                </span>
                                <span
                                  className={menuBar === "1" ? "textLine" : ""}
                                />
                              </li>
                              <li
                                onClick={() => {
                                  this.menuChange("2", "0");
                                }}
                              >
                                <span
                                  className={
                                    menuBar === "2" ? "textColor" : "text"
                                  }
                                >
                                  本月
                                </span>
                                <span
                                  className={menuBar === "2" ? "textLine" : ""}
                                />
                              </li>
                              <li
                                onClick={() => {
                                  this.menuChange("3", "1");
                                }}
                              >
                                <span
                                  className={
                                    menuBar === "3" ? "textColor" : "text"
                                  }
                                >
                                  本季度
                                </span>
                                <span
                                  className={menuBar === "3" ? "textLine" : ""}
                                />
                              </li>
                              <li
                                onClick={() => {
                                  this.menuChange("4", "2");
                                }}
                              >
                                <span
                                  className={
                                    menuBar === "4" ? "textColor" : "text"
                                  }
                                >
                                  今年
                                </span>
                                <span
                                  className={menuBar === "4" ? "textLine" : ""}
                                />
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="progessChart">
                          <Spin spinning={chartProgessLoading} />
                          <div
                            id="chartProgess"
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
                            <NullView
                              icon={"Warning"}
                              showTit={"当前还没有可统计的数据"}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Content>
          )}
        </Layout>
      </LocaleProvider>
    );
  }
}
function mapStateToProps(state) {
  return {
    stateChartVal: state.project.stateChartVal,
    projectChartVal: state.project.projectChartVal,
    projectProgessVal: state.project.projectProgessVal,
    projectList: state.statistics.projectList,
    totalData: state.statistics.totalData,
    taskPendList: state.statistics.taskPendList,
    taskNumList: state.statistics.taskNumList,
    taskPersonList: state.statistics.taskPersonList,
    performancePro: state.statistics.performancePro,
    performancePer: state.statistics.performancePer,
    taskPendChart: state.statistics.taskPendChart,
    NumByProjectChart: state.statistics.NumByProjectChart,
    NumByPersonChart: state.statistics.NumByPersonChart,
    ContentProjectChart: state.statistics.ContentProjectChart,
    ContentPersonChart: state.statistics.ContentPersonChart,
    headerData: state.statistics.headerData,
    barChartProList: state.statistics.barChartProList
  };
}
const mapDispatchToProps = dispatch => {
  return {
    setStateVal: bindActionCreators(projectAction.setStateVal, dispatch),
    setProjectVal: bindActionCreators(projectAction.setProjectVal, dispatch),

    setProjectProgessVal: bindActionCreators(
      projectAction.setProjectProgessVal,
      dispatch
    ),
    getProjectListByTypeTag: bindActionCreators(
      statisticsAction.getProjectListByTypeTag,
      dispatch
    ),
    getProjectStatistics: bindActionCreators(
      statisticsAction.getProjectStatistics,
      dispatch
    ),
    getPendStatistics: bindActionCreators(
      statisticsAction.getPendStatistics,
      dispatch
    ),
    getNumByProject: bindActionCreators(
      statisticsAction.getNumByProject,
      dispatch
    ),
    getNumByPerson: bindActionCreators(
      statisticsAction.getNumByPerson,
      dispatch
    ),
    getContentByProject: bindActionCreators(
      statisticsAction.getContentByProject,
      dispatch
    ),
    getContentByPerson: bindActionCreators(
      statisticsAction.getContentByPerson,
      dispatch
    ),
    getPendByProject: bindActionCreators(
      statisticsAction.getPendByProject,
      dispatch
    ),
    setHeaderData: bindActionCreators(statisticsAction.setHeaderData, dispatch)
  };
};

export default withRedux(initStore, mapStateToProps, mapDispatchToProps)(
  Statistics
);
