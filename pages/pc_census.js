import React from "react";
import withRedux from "next-redux-wrapper";
import { bindActionCreators } from "redux";
import { initStore } from "../store";
import stylesheet from "styles/views/census.scss";
import Head from "../components/header";
import * as projectAction from "../core/actions/project";
import * as statisticsAction from "../core/actions/statistics";
import zh_CN from "antd/lib/locale-provider/zh_CN";
import {
  Layout,
  LocaleProvider,
  Radio,
  DatePicker,
  Popover,
  Spin,
  Tooltip
} from "antd";
import {
  downPendByProject,
  downPendByPerson,
  downNumByProject,
  downNumByPerson,
  downContentByProject,
  downContentByPerson,
  downByProject,
  down
} from "../core/service/project.service";
import {
  getProjectProgess,
  getProjectStatistics,
  getTaskDistributedByState,
  getTaskDistributedByProject,
  getProjectListByTypeTag
} from "../core/service/project.service";
import RingChart from "../components/statistics/ringChart";
import ProjectProgressChart from "../components/statistics/projectProgressChart";
import ContentLeftList from "../components/common/contentLeftList"; //左侧列表
import NullView from "../components/nullView";
import moment from "moment";
import _ from "lodash";
const { RangePicker } = DatePicker;
const { Content } = Layout;

class Census extends React.Component {
  constructor() {
    super();
    this.state = {
      showChart: "achiev",
      currentMonth: true,
      lastMonth: false,
      projectSearchDivOnTop: false,
      mousePos: null,
      showData: null,
      projectId: [],
      monthType: 0,
      attdate: [],
      maskType: "",
      stateChartDatas: [],
      projectChartDatas: [],
      projectProgressDatas: [],
      dates: [],
      dateType: "",
      type: "1",
      labelId: [],
      projectList: [],
      projectIds: [], //我参与的项目id
      pageLoading: true,
      chart1Loading: false,
      chart2Loading: false,
      chartProgressLoading: false,
      nullview: false,
      conditionData: false,
      conditionProjectIds: [],
      flag: true
    };
  }
  componentWillMount() {
    this.getProjectList();
    console.log(this.props);
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
      case "currentMonth":
        let monthStartDate = new Date(nowYear, nowMonth, 1);
        let monthEndDate = new Date(
          nowYear,
          nowMonth,
          this.getMonthDays(nowMonth)
        );
        return [moment(monthStartDate), moment(monthEndDate)];
        break;
      case "lastMonth":
        let oldStartDate = new Date(nowYear, lastMonth, 1);
        let oldEndDate = new Date(
          nowYear,
          lastMonth,
          this.getMonthDays(lastMonth)
        );
        return [moment(oldStartDate), moment(oldEndDate)];
        break;
      default:
        return [];
        break;
    }
  }

  getProjectList() {
    const { type, labelId } = this.state;
    getProjectListByTypeTag(type, labelId, data => {
      let proIds = [];
      if (data && data.projectList && data.projectList.length > 0) {
        data.projectList.map((item, i) => {
          proIds.push(item.id);
        });
        if (this.state.flag) {
          this.setState({ conditionProjectIds: proIds, flag: false });
        }
        this.setState({ projectIds: proIds }, () => {
          this.getTaskState(proIds);
          this.getTaskProject(proIds);
          this.getProjectProgress(proIds, "", "", "1");
        });
        this.props.getProjectStatistics({ projectIds: proIds }, () => {
          this.setState({ pageLoading: false });
        });
        this.props.getLeftContent({ projectIds: proIds, type: 0 }, () => {});
        this.props.getPendStatistics({ projectIds: proIds }); //代办统计按人员
        this.props.getPendByProject({ projectIds: proIds }); //代办统计按项目
        this.props.getNumByProject("0", proIds); //
        this.props.getNumByPerson("0", proIds); //
        this.props.getContentByProject("0", proIds);
        this.props.getContentByPerson("0", proIds);
      } else {
        this.setState({ pageLoading: false });
        this.setState({ nullview: true });
      }
    });
    this.setState({
      attdate: this.dateCurrentChange("currentMonth")
    });
  }

  handleMouseOverMask = ev => {
    let mousePos = this.mousePosition(ev);
    const clientWidth = document.body.clientWidth;
    const clientHeight = document.body.clientHeight;
    if (clientWidth - mousePos.x < 230) {
      mousePos.x = mousePos.x - (260 - (clientWidth - mousePos.x));
    }
    if (clientHeight - mousePos.y < 200) {
      mousePos.y = mousePos.y - (200 - (clientHeight - mousePos.y));
    }
    this.setState({ mousePos });
  };

  handleMouseOver(item, maskType, ev) {
    var oEvent = ev || event;
    var reltg = oEvent.fromElement || oEvent.relatedTarget;
    //其中oEvent.fromElement兼容IE，chrome
    //oEvent.relatedTarget;兼容FF。
    if (reltg && !reltg.isEqualNode(ev.target)) {
      reltg = reltg.parentNode;
    }
    if (!(reltg && reltg.isEqualNode(ev.target))) {
      // 这里可以编写 onmouseenter 事件的处理代码
      if (this.timer != null) {
        clearTimeout(this.timer);
      }
      let mousePos = this.mousePosition(ev);
      const clientWidth = document.body.clientWidth;
      const clientHeight = document.body.clientHeight;
      if (clientWidth - mousePos.x < 260) {
        mousePos.x = mousePos.x - (260 - (clientWidth - mousePos.x));
        mousePos.y = mousePos.y - 160;
      }
      if (clientHeight - mousePos.y < 200) {
        mousePos.y = mousePos.y - (200 - (clientHeight - mousePos.y));
      }
      this.setState({ mousePos });
      if (maskType === 1) {
        this.setState({
          maskType: 1,

          showData: {
            zhipai: item.unassigned,
            queren: item.confirmed,
            wancheng: item.going,
            yqzhipai: item.overdueunassigned,
            yqqueren: item.overdueconfirmed,
            yqwancheng: item.overduegoing
          }
        });
      } else if (maskType === 2) {
        this.setState({
          maskType: 2,
          showData: {
            zhipai: item.zprw,
            queren: item.qrrw,
            wancheng: item.wcrw,
            yqzhipai: item.yqzp,
            yqqueren: item.yqqr,
            yqwancheng: item.yqwc,
            chuangjian: item.cjrw
          }
        });
      } else if (maskType === 3) {
        this.setState({
          maskType: 2,

          showData: {
            zhipai: item.zprw,
            queren: item.qrrw,
            wancheng: item.wcrw,
            yqzhipai: item.yqzpjx,
            yqqueren: item.yqqrjx,
            yqwancheng: item.yqwcjx,
            chuangjian: item.cjrw
          }
        });
      }
      this.timer = null;
    }
  }
  handleMouseOut = ev => {
    var oEvent = ev || event;
    var reltg = oEvent.toElement || oEvent.relatedTarget;
    //其中oEvent.toElement兼容IE，chrome
    //oEvent.relatedTarget;兼容FF。
    if (reltg && !reltg.isEqualNode(ev.target)) {
      reltg = reltg.parentNode;
    }
    if (!(reltg && reltg.isEqualNode(ev.target))) {
      if (this.timer) {
        clearTimeout(this.timer);
        return;
      }
      if (reltg && reltg.className) {
        if (
          reltg.className == "hoverStyle" ||
          reltg.className == "hoverStyleSec" ||
          reltg.className == "barChartBox"
        ) {
          let mousePos = this.mousePosition(ev);
          const clientWidth = document.body.clientWidth;
          const clientHeight = document.body.clientHeight;
          if (clientWidth - mousePos.x < 260) {
            mousePos.x = mousePos.x - (260 - (clientWidth - mousePos.x));
          }
          if (clientHeight - mousePos.y < 230) {
            mousePos.y = mousePos.y - (200 - (clientHeight - mousePos.y));
          }
          setTimeout(() => {
            this.setState({ mousePos });
          }, 100);
          return;
        }
      }

      this.timer = setTimeout(() => {
        this.setState({ mousePos: null, showData: null });
      }, 150);
    }
  };

  mousePosition = ev => {
    ev = ev || window.event;
    if (ev.pageX || ev.pageY) {
      return { x: ev.pageX, y: ev.pageY };
    }
    return {
      x: ev.clientX + document.body.scrollLeft - document.body.clientLeft,
      y: ev.clientY + document.body.scrollTop - document.body.clientTop
    };
  };
  //待办统计 ----两个图
  renderPendingProjectChart = (data, typeName = "name") => {
    const total = data[0].daizp + data[0].jinxz + data[0].daiqr;
    const barChatData = data.map(item => {
      return {
        title: item[typeName],
        unassigned: item.daizp,
        assignPercent: Math.floor((item.daizp / total) * 100) + "%",
        going: item.jinxz,
        goingPercent: Math.floor((item.jinxz / total) * 100) + "%",
        confirmed: item.daiqr,
        confirmedPercent: Math.floor((item.daiqr / total) * 100) + "%",
        overduegoing: item.jxzyq,
        overdueconfirmed: item.dqryq,
        overdueunassigned: item.dzpyq
      };
    });
    const flag = typeName != "name";
    return (
      <div className={flag ? "ho-barChat barChat" : "barChat ver-barChat"}>
        <div className="borderTest3" />

        <div className="barChatName">{flag ? "项目排行" : "人员排行"}</div>
        {barChatData.map((item, index) => {
          return (
            <div
              className={
                typeName != "name"
                  ? "item  horizontal clearfloat"
                  : "item  vertical clearfloat"
              }
              key={index}
              onMouseOut={this.handleMouseOut.bind(this)}
              onMouseOver={this.handleMouseOver.bind(this, item, 1)}
              onMouseMove={this.handleMouseOver.bind(this, item, 1)}
            >
              <div className="bar-title">{item.title}</div>
              <div
                className="unassigned"
                style={{ width: item.assignPercent }}
              />
              <div className="going" style={{ width: item.goingPercent }} />
              <div
                className="confirmed"
                style={{ width: item.confirmedPercent }}
              />
            </div>
          );
        })}
      </div>
    );
  };
  //绩效统计 ----任务数
  renderPerformBarChat = (data, typeName = "name") => {
    if (!data || data.length <= 0) {
      return false;
    }
    const total = data[0].cjrw + data[0].zprw + data[0].qrrw + data[0].wcrw;
    const barChatData = data.map(item => {
      if (total == 0) {
        return {
          title: item[typeName],
          cjrw: 0,
          cjrwPercent: "0%",
          zprw: 0,
          zprwPercent: 0,
          qrrw: 0,
          qrrwPercent: "0%",
          wcrw: 0,
          wcrwPercent: "0%",
          yqwcjx: 0,
          yqqrjx: 0,
          yqzpjx: 0
        };
      }
      return {
        title: item[typeName],
        cjrw: item.cjrw,
        cjrwPercent: Math.floor((item.cjrw / total) * 100) + "%",
        zprw: item.zprw,
        zprwPercent: Math.floor((item.zprw / total) * 100) + "%",
        qrrw: item.qrrw,
        qrrwPercent: Math.floor((item.qrrw / total) * 100) + "%",
        wcrw: item.wcrw,
        wcrwPercent: Math.floor((item.wcrw / total) * 100) + "%",
        yqqr: item.yqqr,
        yqzp: item.yqzp,
        yqwc: item.yqwc
      };
    });
    const flag = typeName != "name";
    return (
      <div className={flag ? "ho-barChat barChat" : "barChat ver-barChat"}>
        <div className="borderTest3" />

        <div className="barChatName">{flag ? "项目排行" : "人员排行"}</div>

        {barChatData.map((item, index) => {
          return (
            <div
              className={
                typeName != "name"
                  ? "item  horizontal clearfloat"
                  : "item  vertical clearfloat"
              }
              key={index}
              onMouseOut={this.handleMouseOut.bind(this)}
              onMouseOver={this.handleMouseOver.bind(this, item, 2)}
            >
              <div className="bar-title">{item.title}</div>
              <div className="cj" style={{ width: item.cjrwPercent }} />
              <div className="unassigned" style={{ width: item.zprwPercent }} />
              <div className="confirmed" style={{ width: item.qrrwPercent }} />
              <div className="wcrw" style={{ width: item.wcrwPercent }} />
            </div>
          );
        })}
      </div>
    );
  };

  //绩效统计 ----绩效值
  renderPerformValueBarChat = (data, typeName = "name") => {
    if (!data || data.length <= 0) {
      return false;
    }
    const total =
      data[0].cjrwjx + data[0].zprwjx + data[0].qrrwjx + data[0].wcrwjx;

    const barChatData = data.map(item => {
      if (total == 0) {
        return {
          title: item[typeName],
          cjrw: 0,
          cjrwPercent: "0%",
          zprw: 0,
          zprwPercent: 0,
          qrrw: 0,
          qrrwPercent: "0%",
          wcrw: 0,
          wcrwPercent: "0%",
          yqwcjx: 0,
          yqqrjx: 0,
          yqzpjx: 0
        };
      }
      return {
        title: item[typeName],
        cjrw: item.cjrwjx,
        cjrwPercent: Math.floor((item.cjrwjx / total) * 100) + "%",
        zprw: item.zprwjx,
        zprwPercent: Math.floor((item.zprwjx / total) * 100) + "%",
        qrrw: item.qrrwjx,
        qrrwPercent: Math.floor((item.qrrwjx / total) * 100) + "%",
        wcrw: item.wcrwjx,
        wcrwPercent: Math.floor((item.wcrwjx / total) * 100) + "%",
        yqwcjx: item.yqwcjx,
        yqqrjx: item.yqqrjx,
        yqzpjx: item.yqzpjx
      };
    });
    const flag = typeName != "name";

    return (
      <div className={flag ? "ho-barChat barChat" : "barChat ver-barChat"}>
        <div className="borderTest3" />

        <div className="barChatName">{flag ? "项目排行" : "人员排行"}</div>

        {barChatData.map((item, index) => {
          return (
            <div
              className={
                typeName != "name"
                  ? "item  horizontal clearfloat"
                  : "item  vertical clearfloat"
              }
              key={index}
              onMouseOut={this.handleMouseOut.bind(this)}
              onMouseOver={this.handleMouseOver.bind(this, item, 3)}
            >
              <div className="bar-title">{item.title}</div>
              <div className="cj" style={{ width: item.cjrwPercent }} />
              <div className="unassigned" style={{ width: item.zprwPercent }} />
              <div className="confirmed" style={{ width: item.qrrwPercent }} />
              <div className="wcrw" style={{ width: item.wcrwPercent }} />
            </div>
          );
        })}
      </div>
    );
  };
  timeSelect = Month => {
    const { projectList, projectIds } = this.state;
    this.setState(
      {
        currentMonth: Month === "currentMonth" ? true : false,
        lastMonth: Month === "lastMonth" ? true : false,
        monthType: Month === "currentMonth" ? 0 : 1,
        attdate: this.dateCurrentChange(Month)
      },
      () => {
        const { monthType } = this.state;
        this.props.getLeftContent({
          type: monthType,
          projectIds: projectList.length > 0 ? projectList : projectIds
        });
        this.props.getNumByProject(
          monthType,
          projectList.length > 0 ? projectList : projectIds
        );

        this.props.getNumByPerson(
          monthType,
          projectList.length > 0 ? projectList : projectIds
        );

        this.props.getContentByProject(
          monthType,
          projectList.length > 0 ? projectList : projectIds
        );
        this.props.getContentByPerson(
          monthType,
          projectList.length > 0 ? projectList : projectIds
        );
      }
    );
  };
  onChangeTime = (e, value) => {
    const { projectList, projectIds } = this.state;
    if (value[0] && value[1]) {
      this.setState({
        attdate: [moment(value[0]), moment(value[1])],
        currentMonth: false,
        lastMonth: false,
        monthType: ""
      });
      this.props.getLeftContent({
        projectIds: projectIds,
        attdate01: value[0],
        attdate02: value[1]
      });
    } else {
      this.setState({
        attdate: [],
        currentMonth: false,
        lastMonth: false,
        monthType: ""
      });
      this.props.getLeftContent({
        projectIds: projectIds
      });
    }

    this.props.getNumByProject(
      "",
      projectList.length > 0 ? projectList : projectIds,
      value[0],
      value[1]
    );
    this.props.getNumByPerson(
      "",
      projectList.length > 0 ? projectList : projectIds,
      value[0],
      value[1]
    );

    this.props.getContentByProject(
      "",
      projectList.length > 0 ? projectList : projectIds,
      value[0],
      value[1]
    );
    this.props.getContentByPerson(
      "",
      projectList.length > 0 ? projectList : projectIds,
      value[0],
      value[1]
    );
  };
  headMenu() {
    const { projectSearchDivOnTop } = this.state;
    if (projectSearchDivOnTop) {
      this.setState({ projectSearchDivOnTop: false });
    } else {
      this.setState({ projectSearchDivOnTop: true });
    }
  }
  showChartTask = e => {
    this.setState({
      showChart: e.target.value
    });
  };
  //获取任务分布按任务状态数据
  getTaskState(projectIds) {
    const data = {
      projectIds: projectIds && projectIds
    };
    this.setState({ chart1Loading: true });
    getTaskDistributedByState(data, res => {
      if (res.err) {
        return false;
      }
      const { type, labelId } = this.state;
      if (res.data) {
        let stateDatas = [];
        stateDatas.push(
          {
            value: res.data.daizp,
            name: "待指派",
            itemStyle: {
              color: "#CE93D8",
              opacity: 0.52
            },
            key: res.data.dzpyq,
            icon: "circle"
          },
          {
            value: res.data.jinxz,
            name: "进行中",
            itemStyle: {
              color: "#A5d6A7",
              opacity: 0.52
            },
            key: res.data.jxzyq,
            icon: "circle"
          },
          {
            value: res.data.daiqr,
            name: "待确认",
            itemStyle: {
              color: "#81d4fa",
              opacity: 0.52
            },
            key: res.data.dqryq,
            icon: "circle"
          },
          {
            value: res.data.yiwc,
            name: "已完成",
            itemStyle: {
              color: "#b0bec5",
              opacity: 0.52
            },
            key: res.data.ywcyq,
            key1: res.data.tqwc,
            icon: "circle"
          },
          {
            value: res.data.yizz,
            name: "已终止",
            itemStyle: {
              color: "#ffd54f",
              opacity: 0.52
            },
            icon: "circle"
          }
        );
        if (
          type === "1" &&
          labelId.length === 0 &&
          this.props.projectProgessVal.length === 0
        ) {
          this.props.setStateVal(stateDatas);
        }
        this.setState({ stateChartDatas: stateDatas });
      }
    });
    this.setState({ chart1Loading: false });
  }
  //获取任务分布按项目
  getTaskProject(projectIds) {
    const data = {
      projectIds: projectIds && projectIds
    };
    this.setState({ chart2Loading: true });
    getTaskDistributedByProject(data, res => {
      if (res.err) {
        return false;
      }
      const { type, labelId } = this.state;
      if (res.data && res.data.length > 0) {
        let projectDatas = [];
        res.data.map((item, i) => {
          projectDatas.push({
            value: item.allTask,
            name: item.proName,
            itemStyle: {
              opacity: 0.52
            },
            key: item.daizp,
            key1: item.jinxz,
            key2: item.daiqr,
            key3: item.yiwc,
            key4: item.yizz,
            icon: "circle"
          });
        });
        if (
          type === "1" &&
          labelId.length === 0 &&
          this.props.projectProgessVal.length === 0
        ) {
          this.props.setProjectVal(projectDatas);
        }
        this.setState({ projectChartDatas: projectDatas });
      }
    });
    this.setState({ chart2Loading: false });
  }
  //获取项目进展数据
  getProjectProgress(projectIds, attdate01, attdate02, type) {
    const data = {
      projectIds: projectIds && projectIds,
      attdate01: attdate01 ? attdate01 : "",
      attdate02: attdate02 ? attdate02 : "",
      type: type ? type : ""
    };
    this.setState({ chartProgressLoading: true });
    getProjectProgess(data, res => {
      if (res.err) {
        return false;
      }
      const { type, labelId } = this.state;
      if (res.length > 0) {
        if (
          type === "1" &&
          labelId.length === 0 &&
          this.props.projectProgessVal.length === 0
        ) {
          this.props.setProjectProgessVal(res);
        }
      }

      if (res.length > 0) {
        let progressDatas = [];
        res.map((item, i) => {
          progressDatas.push(item);
        });
        this.setState({
          projectProgressDatas: progressDatas
        });
      } else {
        this.setState(
          {
            projectProgressDatas: res
          },
          () => {}
        );
      }
    });
    this.setState({ chartProgressLoading: false });
  }
  //处理选中日期
  dateChange(val) {
    const { dates, projectIds } = this.state;
    const dateData = [];
    if (val.length > 0) {
      val.map((item, i) => {
        dateData.push(item);
      });
      this.setState({ dates: dateData, conditionData: false }, () => {
        this.getProjectProgress(projectIds, val[0], val[1], "");
      });
    }
  }
  //处理项目进展类型
  typeChange(val) {
    const { projectIds } = this.state;
    this.setState({ dateType: val, conditionData: false }, () => {
      this.getProjectProgress(projectIds, "", "", val);
    });
  }
  renderChart() {
    const {
      taskNumList,
      taskPersonList,
      performancePro,
      performancePer
    } = this.props;
    const { showChart } = this.state;
    let chart1 = "";
    let chart2 = "";
    if (showChart == "achiev") {
      return {
        chart1: this.renderPerformValueBarChat(performancePro, "projectName"),
        chart2: this.renderPerformValueBarChat(performancePer)
      };
    } else if (showChart == "taskNum") {
      return {
        chart1: this.renderPerformBarChat(taskNumList, "projectName"),
        chart2: this.renderPerformBarChat(taskPersonList)
      };
    }
  }
  projectListClick(list, menutype, tagId) {
    const { conditionProjectIds } = this.state;
    if (
      list.length !== conditionProjectIds.length ||
      menutype !== "1" ||
      tagId.length !== 0
    ) {
      this.setState({ conditionData: true });
    } else {
      this.setState({ conditionData: false });
    }
    this.setState(
      {
        projectList: list,
        nullview: false,
        attdate: this.dateCurrentChange("currentMonth"),
        projectIds: list,
        type: menutype,
        labelId: tagId,
        currentMonth: true,
        lastMonth: false,
        monthType: 0
      },
      () => {
        const projectIds = list;
        this.props.getProjectStatistics({ projectIds });
        this.props.getLeftContent({ projectIds: projectIds, type: 0 });
        this.props.getPendByProject({ projectIds }); //代办统计按人员
        this.props.getPendStatistics({ projectIds }); //代办统计按项目
        this.props.getNumByProject(0, projectIds); //
        this.props.getNumByPerson(0, projectIds); //
        this.props.getContentByProject(0, projectIds);
        this.props.getContentByPerson(0, projectIds);
        this.getTaskState(projectIds);
        this.getTaskProject(projectIds);
        this.getProjectProgress(projectIds, "", "", "1");
      }
    );
  }
  downLoad() {
    const {
      showChart,
      projectList,
      monthType,
      attdate,
      projectIds
    } = this.state;
    if (showChart === "taskNum") {
      if (monthType != "") {
        downNumByProject(
          projectList.length > 0 ? projectList : projectIds,
          monthType
        );
        return false;
      }
      if (attdate && attdate.length <= 0) {
        downNumByProject(projectList.length > 0 ? projectList : projectIds, 0);
        return false;
      }

      downNumByProject(
        projectList.length > 0 ? projectList : projectIds,
        "",
        attdate[0],
        attdate[1]
      );
    } else if (showChart === "achiev") {
      if (monthType != "") {
        downContentByProject(
          projectList.length > 0 ? projectList : projectIds,
          monthType
        );
        return false;
      }
      if (attdate && attdate.length <= 0) {
        downContentByProject(
          projectList.length > 0 ? projectList : projectIds,
          0
        );
        return false;
      }

      downContentByProject(
        projectList.length > 0 ? projectList : projectIds,
        "",
        attdate[0],
        attdate[1]
      );
    }
  }
  downLoad1() {
    const {
      showChart,
      projectList,
      monthType,
      attdate,
      projectIds
    } = this.state;
    if (showChart === "taskNum") {
      if (monthType != "") {
        downNumByPerson(
          projectList.length > 0 ? projectList : projectIds,
          monthType
        );
        return false;
      }
      if (attdate && attdate.length <= 0) {
        downNumByPerson(projectList.length > 0 ? projectList : projectIds, 0);
        return false;
      }

      downNumByPerson(
        projectList.length > 0 ? projectList : projectIds,
        "",
        attdate[0],
        attdate[1]
      );
    } else if (showChart === "achiev") {
      if (monthType != "") {
        downContentByPerson(
          projectList.length > 0 ? projectList : projectIds,
          monthType
        );
        return false;
      }
      if (attdate && attdate.length <= 0) {
        downContentByPerson(
          projectList.length > 0 ? projectList : projectIds,
          0
        );
        return false;
      }

      downContentByPerson(
        projectList.length > 0 ? projectList : projectIds,
        "",
        attdate[0],
        attdate[1]
      );
    }
  }
  render() {
    const { penProject, penPerson, totalData, totalDataBottom } = this.props;
    const {
      lastMonth,
      projectIds,
      currentMonth,
      attdate,
      mousePos,
      showData,
      maskType,
      pageLoading,
      stateChartDatas,
      projectChartDatas,
      projectProgressDatas,
      projectSearchDivOnTop,
      projectList,
      chart1Loading,
      chart2Loading,
      chartProgressLoading,
      nullview,
      conditionData
    } = this.state;
    return (
      <LocaleProvider locale={zh_CN}>
        <Layout>
          <Head
            menuShow={true}
            iconOnClickCallBack={() => {
              this.headMenu();
            }}
          />
          <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
          {maskType === 1 ? (
            <div
              onMouseOver={this.handleMouseOverMask.bind(this)}
              style={
                mousePos
                  ? {
                      position: "absolute",
                      left: mousePos.x + 60,
                      top: mousePos.y - 80,
                      zIndex: 999
                    }
                  : { display: "none" }
              }
              className="hoverStyle"
            >
              <div>
                <span className="yuandian1" />
                待指派：
                {showData && showData.zhipai}
              </div>
              <span>逾期：{showData && showData.yqzhipai}</span>
              <div>
                <span className="yuandian2" />
                待完成：{showData && showData.wancheng}
              </div>
              <span>逾期：{showData && showData.yqwancheng}</span>
              <div>
                <span className="yuandian3" />
                待确认：{showData && showData.queren}
              </div>
              <span>逾期：{showData && showData.yqqueren}</span>
            </div>
          ) : (
            <div
              onMouseOver={this.handleMouseOverMask.bind(this)}
              style={
                mousePos
                  ? {
                      position: "absolute",
                      left: mousePos.x + 60,
                      top: mousePos.y - 80,
                      zIndex: 999
                    }
                  : { display: "none" }
              }
              className="hoverStyleSec"
            >
              <div>
                <span className="yuandian1" />
                创建：
                {showData && showData.chuangjian}
              </div>
              <div>
                <span className="yuandian2" />
                指派：{showData && showData.zhipai}
              </div>
              <span>逾期：{(showData && showData.yqzhipai) || 0}</span>
              <div>
                <span className="yuandian3" />
                确认：{showData && showData.queren}
              </div>
              <span>逾期：{(showData && showData.yqqueren) || 0}</span>
              <div>
                <span className="yuandian4" />
                完成：{showData && showData.wancheng}
              </div>
              <span>逾期：{(showData && showData.yqwancheng) || 0}</span>
            </div>
          )}
          {console.log(totalDataBottom, "totalDataBottom")}
          <Content>
            {pageLoading ? (
              <div style={{ textAlign: "center" }}>
                <Spin spinning={pageLoading} />
              </div>
            ) : (
              <div className="census">
                <div
                  className={
                    projectSearchDivOnTop
                      ? "screen pro_screen chart-left-fixed census_screen_fixed"
                      : "screen pro_screen census_screen"
                  }
                >
                  <ContentLeftList
                    ref="staticticsDetail"
                    pageType={1}
                    projectIds={projectIds}
                    projectSearchDivOnTop={projectSearchDivOnTop}
                    projectOnClick={(list, type, labelIds) => {
                      this.projectListClick(list, type, labelIds);
                    }}
                  />
                </div>
                {nullview ? (
                  <div className="censusContent">
                    <NullView style={{ marginTop: "100px" }} />
                  </div>
                ) : (
                  <div className="censusContent">
                    <div className="topBox">
                      <div className="boxTop clearfloat">
                        <div className="title">
                          <span className="titleName"> 任务统计</span>
                          <Popover
                            placement="left"
                            title={null}
                            content={
                              <div className="download">
                                <div
                                  onClick={() => {
                                    down(
                                      projectList.length > 0
                                        ? projectList
                                        : projectIds
                                    );
                                  }}
                                  className="downloadChild"
                                >
                                  导出任务分布
                                </div>
                                <div className="myBorder" />
                                <div
                                  onClick={() => {
                                    downByProject(
                                      projectList.length > 0
                                        ? projectList
                                        : projectIds
                                    );
                                  }}
                                  className="downloadChild"
                                >
                                  导出项目分布
                                </div>
                              </div>
                            }
                            trigger="click"
                            className="export"
                          >
                            <i className="iconfont icon-more"> </i>
                          </Popover>
                        </div>
                        <div className="barChartBoxToT">
                          <div className="countTop">
                            <div> 项目数</div>
                            <span>
                              {totalData.projectList &&
                                totalData.projectList.projectNum}
                            </span>
                            <div> 参与人数</div>
                            {totalData.projectList &&
                            _.isNumber(totalData.projectList.participate) &&
                            totalData.projectList.participate < 10000 ? (
                              <span>{totalData.projectList.participate}</span>
                            ) : (
                              <Tooltip
                                title={
                                  totalData.projectList &&
                                  totalData.projectList.participate
                                }
                              >
                                <span>9999+</span>
                              </Tooltip>
                            )}
                            <div> 综合进度</div>
                            <span>
                              {totalData.projectList &&
                                parseFloat(totalData.projectList.progress)}
                              <span className="parseFloatStyle">%</span>
                            </span>
                          </div>
                          <div className="taskArea-content-project">
                            <div className="topChartBox">
                              <Spin spinning={chart1Loading} />
                              <RingChart
                                title={"任务分布"}
                                chartData={stateChartDatas}
                                ref="chart1"
                              />
                            </div>
                            <div className="projectArea">
                              <Spin spinning={chart2Loading} />
                              <RingChart
                                title={"项目分布"}
                                chartData={projectChartDatas}
                                colorType={"light"}
                                ref="chart2"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="progressBox clearfloat">
                        <Spin spinning={chartProgressLoading} />
                        <ProjectProgressChart
                          title={"历史进展"}
                          ref="chart3"
                          chartProgress={projectProgressDatas}
                          timeMenuShow={true}
                          DatePickerShow={true}
                          calculationShow={conditionData}
                          progressDateChartCallBack={val => {
                            this.dateChange(val);
                          }}
                          progressTypeCallBack={val => {
                            this.typeChange(val);
                          }}
                        />
                      </div>
                    </div>
                    <div className="box clearfloat">
                      <div className="title">
                        <span className="titleName"> 待办统计</span>
                        <Popover
                          placement="left"
                          title={null}
                          content={
                            <div className="download">
                              <div
                                onClick={() => {
                                  downPendByProject(
                                    projectList.length > 0
                                      ? projectList
                                      : projectIds
                                  );
                                }}
                                className="downloadChild"
                              >
                                导出项目待办
                              </div>
                              <div className="myBorder" />
                              <div className="myBorder1" />
                              <div
                                onClick={() => {
                                  downPendByPerson(
                                    projectList.length > 0
                                      ? projectList
                                      : projectIds
                                  );
                                }}
                                className="downloadChild"
                              >
                                导出人员待办
                              </div>
                            </div>
                          }
                          trigger="click"
                          className="export"
                        >
                          <i className="iconfont icon-more"> </i>
                        </Popover>
                      </div>
                      <div className="barChartBoxTop">
                        <div className="count">
                          <div> 待完成任务</div>
                          <span>
                            {totalData.projectList &&
                              totalData.projectList.pendNum}
                          </span>
                          <div> 逾期任务</div>
                          {totalData.projectList &&
                          _.isNumber(totalData.projectList.overNum) &&
                          totalData.projectList.overNum < 10000 ? (
                            <span>{totalData.projectList.overNum}</span>
                          ) : (
                            <Tooltip
                              title={
                                totalData.projectList &&
                                totalData.projectList.overNum
                              }
                            >
                              <span>9999+</span>
                            </Tooltip>
                          )}
                          <div> 逾期率</div>
                          <span>
                            {totalData.projectList &&
                              parseFloat(totalData.projectList.overdue)}
                            <span className="parseFloatStyle">%</span>
                          </span>
                        </div>
                        <div className="borderTest" />
                        <div className="borderTest1" />
                        {penProject.taskPendList &&
                          this.renderPendingProjectChart(
                            penProject.taskPendList,
                            "proName"
                          )}
                        <div className="borderTest2" />
                        {penPerson.taskPendList &&
                          this.renderPendingProjectChart(
                            penPerson.taskPendList
                          )}
                      </div>
                    </div>
                    <div className="box clearfloat">
                      <div className="title">
                        <span className="titleName"> 绩效统计</span>

                        <Popover
                          placement="left"
                          title={null}
                          content={
                            <div className="download">
                              <div
                                className="downloadChild"
                                onClick={() => {
                                  this.downLoad();
                                }}
                              >
                                导出项目绩效
                              </div>
                              <div className="myBorder" />
                              <div
                                className="downloadChild"
                                onClick={() => {
                                  this.downLoad1();
                                }}
                              >
                                导出人员绩效
                              </div>
                            </div>
                          }
                          trigger="click"
                          className="export"
                        >
                          <i className="iconfont icon-more"> </i>
                        </Popover>
                        <Radio.Group
                          className="group"
                          defaultValue="achiev"
                          buttonStyle="solid"
                          onChange={e => {
                            this.setState({
                              showChart: e.target.value
                            });
                          }}
                        >
                          <Radio.Button value="achiev">绩效值</Radio.Button>
                          <Radio.Button value="taskNum">任务数</Radio.Button>
                        </Radio.Group>

                        <RangePicker
                          className="timePickerSelect"
                          format="YYYY-MM-DD"
                          size="small"
                          value={attdate.length > 0 ? attdate : null}
                          onChange={(value, dateStrings) => {
                            this.onChangeTime(value, dateStrings);
                          }}
                        />
                        <div className="tabTime">
                          <ul>
                            <li
                              onClick={() => {
                                this.timeSelect("currentMonth");
                              }}
                            >
                              <span
                                className={currentMonth ? "textColor" : "text"}
                              >
                                本月
                              </span>
                            </li>
                            <li
                              onClick={() => {
                                this.timeSelect("lastMonth");
                              }}
                            >
                              <span
                                className={lastMonth ? "textColor" : "text"}
                              >
                                上月
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div className="barChartBox">
                        <div className="count">
                          <div> 完成任务</div>
                          <span>
                            {totalDataBottom && totalDataBottom.finishNum}
                          </span>
                          <div> 完成绩效</div>
                          {totalDataBottom &&
                          _.isNumber(totalDataBottom.finishConten) &&
                          totalDataBottom.finishConten < 10000 ? (
                            <span>{totalDataBottom.finishConten}</span>
                          ) : (
                            <Tooltip
                              title={
                                totalDataBottom && totalDataBottom.finishConten
                              }
                            >
                              <span>9999+</span>
                            </Tooltip>
                          )}
                          <div> 逾期完成率</div>
                          <span>
                            {totalDataBottom &&
                              parseFloat(totalDataBottom.overFinish)}
                            <span className="parseFloatStyle">%</span>
                          </span>
                        </div>
                        <div className="borderTest" />
                        <div className="borderTest1" />
                        {this.renderChart().chart1}
                        <div className="borderTest2" />
                        {this.renderChart().chart2}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Content>
        </Layout>
      </LocaleProvider>
    );
  }
}
const mapStateToProps = state => {
  return {
    penPerson: state.statistics.taskPendList,
    penProject: state.statistics.barChartProList,

    stateChartVal: state.project.stateChartVal,
    projectChartVal: state.project.projectChartVal,
    projectProgessVal: state.project.projectProgessVal,
    projectList: state.statistics.projectList,
    totalData: state.statistics.totalData,
    totalDataBottom: state.statistics.totalDataBottom,

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
    projectListAll: state.statistics.projectListAll
  };
};
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
      statisticsAction.getProjectStatistics, // 获取头部和 任务分布统计数据
      dispatch
    ),
    getLeftContent: bindActionCreators(
      statisticsAction.getLeftContent, // 获取头部和 任务分布统计数据最后面三个
      dispatch
    ),
    getPendStatistics: bindActionCreators(
      statisticsAction.getPendStatistics, //代办统计按人员
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
    getProjectList: bindActionCreators(
      statisticsAction.getProjectList,
      dispatch
    ),
    setHeaderData: bindActionCreators(statisticsAction.setHeaderData, dispatch)
  };
};

export default withRedux(initStore, mapStateToProps, mapDispatchToProps)(
  Census
);
