import React from "react";
import withRedux from "next-redux-wrapper";
import { bindActionCreators } from "redux";
import { initStore } from "../store";
import stylesheet from "styles/views/pc_test.scss";
import Head from "../components/header";
import * as projectAction from "../core/actions/project";
import * as statisticsAction from "../core/actions/statistics";
import zh_CN from "antd/lib/locale-provider/zh_CN";
import { Layout, LocaleProvider, Radio, DatePicker, Popover, Spin } from "antd";
import {
  downPendByProject,
  downPendByPerson,
  downNumByProject,
  downNumByPerson,
  downContentByProject,
  downContentByPerson
} from "../core/service/project.service";
import {
  getProjectProgess,
  getProjectStatistics,
  getTaskDistributedByState,
  getTaskDistributedByProject,
  getProjectListByTypeTag
} from "../core/service/project.service";
import RingChart from "../components/statistics/ringChartL";
import BarChart from "../components/statistics/BarChatL";
import BarChart2 from "../components/statistics/BarChatL2";

import ContentLeftList from "../components/common/contentLeftList"; //左侧列表

import _ from "lodash";
const { Content } = Layout;
const arrsss = [1, 2, 3, 4, 5, 6, 7, 8, 8, 7, 6];
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
      type: 0,
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
      chartProgressLoading: false
    };
  }
  componentWillMount() {
    const { projectIds } = this.state;
    const param = projectIds.length > 0 ? { projectId: projectIds } : {};
    this.props.getProjectStatistics(param, () => {
      this.setState({ pageLoading: false });
    });
    this.props.getPendStatistics(); //代办统计按人员
    this.props.getPendByProject(); //代办统计按项目
    this.props.getNumByProject(); //
    this.props.getNumByPerson(); //
    this.props.getContentByProject();
    this.props.getContentByPerson();
    this.props.getProjectList();
    this.getProjectList();
  }
  componentDidMount() {}
  getProjectList() {
    const { type, labelId, projectIds } = this.state;
    getProjectListByTypeTag(type, labelId, data => {
      let proIds = [];
      if (data && data.projectList && data.projectList.length > 0) {
        data.projectList.map((item, i) => {
          proIds.push(item.id);
        });
        this.setState({ projectIds: proIds }, () => {
          const { type, labelId } = this.state;
          // if (
          //   type === "1" &&
          //   labelId.length === 0 &&
          //   ((this.props.projectChartVal &&
          //     this.props.projectChartVal.length > 0) ||
          //     (this.props.projectProgessVal &&
          //       this.props.projectProgessVal.length > 0))
          // ) {
          //   this.setState(
          //     {
          //       stateChartDatas: this.props.stateChartVal,
          //       projectChartDatas: this.props.projectChartVal,
          //       projectProgressDatas: this.props.projectProgessVal
          //     },
          //     () => {
          //
          //     }
          //   );
          // } else {
          this.getTaskState(proIds);
          this.getTaskProject(proIds);
          this.getProjectProgress(proIds);
          // }
        });
      }
    });
  }
  handleMouseOver = (item, maskType, e) => {
    if (this.timer != null) {
      clearTimeout(this.timer);
    }
    const mousePos = this.mousePosition(e);

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
          // yqchuangjian: item.yqwc
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
  };
  handleMouseOut = e => {
    if (this.timer != null) {
      clearTimeout(this.timer);
      return;
    }
    this.timer = setTimeout(() => {
      this.setState({ mousePos: null, showData: null });
    }, 500);
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

  renderPendingProjectChart = (data, typeName = "name") => {
    const total = data[0].daizp + data[0].jinxz + data[0].daiqr;
    const barChatData = data.map(item => {
      return {
        title: item[typeName],
        unassigned: item.daizp,
        assignPercent: (item.daizp / total) * 100 + "%",
        going: item.jinxz,
        goingPercent: (item.jinxz / total) * 100 + "%",
        confirmed: item.daiqr,
        confirmedPercent: (item.daiqr / total) * 100 + "%",
        overduegoing: item.jxzyq,
        overdueconfirmed: item.dqryq,
        overdueunassigned: item.dzpyq
      };
    });
    const flag = typeName != "name";
    return (
      <div className={flag ? "ho-barChat barChat" : "barChat ver-barChat"}>
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
              onMouseOut={this.handleMouseOut.bind(this, item)}
              onMouseEnter={this.handleMouseOver.bind(this, item, 1)}
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

  renderPerformBarChat = (data, typeName = "name") => {
    if (!data || data.length <= 0) {
      return false;
    }
    const total = data[0].cjrw + data[0].zprw + data[0].qrrw + data[0].wcrw;
    const barChatData = data.map(item => {
      return {
        title: item[typeName],
        cjrw: item.cjrw,
        cjrwPercent: (item.cjrw / total) * 100 + "%",
        zprw: item.zprw,
        zprwPercent: (item.zprw / total) * 100 + "%",
        qrrw: item.qrrw,
        qrrwPercent: (item.qrrw / total) * 100 + "%",
        wcrw: item.wcrw,
        wcrwPercent: (item.wcrw / total) * 100 + "%",
        yqqr: item.yqqr,
        yqzp: item.yqzp,
        yqwc: item.yqwc
      };
    });
    const flag = typeName != "name";
    return (
      <div className={flag ? "ho-barChat barChat" : "barChat ver-barChat"}>
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
              onMouseOut={this.handleMouseOut.bind(this, item)}
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

  renderPerformValueBarChat = (data, typeName = "name") => {
    if (!data || data.length <= 0) {
      return false;
    }
    const total =
      data[0].cjrwjx + data[0].zprwjx + data[0].qrrwjx + data[0].wcrwjx;
    const barChatData = data.map(item => {
      return {
        title: item[typeName],
        cjrw: item.cjrwjx,
        cjrwPercent: (item.cjrwjx / total) * 100 + "%",
        zprw: item.zprwjx,
        zprwPercent: (item.zprwjx / total) * 100 + "%",
        qrrw: item.qrrwjx,
        qrrwPercent: (item.qrrwjx / total) * 100 + "%",
        wcrw: item.wcrwjx,
        wcrwPercent: (item.wcrwjx / total) * 100 + "%",
        yqwcjx: item.yqwcjx,
        yqqrjx: item.yqqrjx,
        yqzpjx: item.yqzpjx
      };
    });
    const flag = typeName != "name";

    return (
      <div className={flag ? "ho-barChat barChat" : "barChat ver-barChat"}>
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
              onMouseOut={this.handleMouseOut.bind(this, item)}
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
    const { showChart, projectList, type, projectListAll } = this.state;
    this.props.getProjectStatistics({
      type: type,
      projectIds: projectList.length > 0 ? projectList : projectListAll
    });
    if (Month === "currentMonth") {
      this.setState({ currentMonth: true, lastMonth: false, type: 0 });
      if (showChart === "achiev") {
        this.props.getNumByProject(
          type,
          projectList.length > 0 ? projectList : projectListAll
        );

        this.props.getNumByPerson(
          type,
          projectList.length > 0 ? projectList : projectListAll
        );
      } else {
        this.props.getContentByProject(
          type,
          projectList.length > 0 ? projectList : projectListAll
        );
        this.props.getContentByPerson(
          type,
          projectList.length > 0 ? projectList : projectListAll
        );
      }
    } else {
      this.setState({ lastMonth: true, currentMonth: false, type: 1 });
      if (showChart === "achiev") {
        this.props.getNumByProject(
          type,
          projectList.length > 0 ? projectList : projectListAll
        );

        this.props.getNumByPerson(
          type,
          projectList.length > 0 ? projectList : projectListAll
        );
      } else {
        this.props.getContentByProject(
          type,
          projectList.length > 0 ? projectList : projectListAll
        );
        this.props.getContentByPerson(
          type,
          projectList.length > 0 ? projectList : projectListAll
        );
      }
    }
  };
  onChangeTime(e, value) {
    const { showChart, attdate, projectList, type } = this.state;
    const { projectListAll } = this.props;
    this.setState({ attdate: value });

    if (showChart === "achiev") {
      this.props.getNumByProject(
        type,
        projectList.length > 0 ? projectList : projectListAll,
        value[0],
        value[1]
      );
      this.props.getNumByPerson(
        type,
        projectList.length > 0 ? projectList : projectListAll,
        value[0],
        value[1]
      );
    } else {
      this.props.getContentByProject(
        type,
        projectList.length > 0 ? projectList : projectListAll,
        value[0],
        value[1]
      );
      this.props.getContentByPerson(
        type,
        projectList.length > 0 ? projectList : projectListAll,
        value[0],
        value[1]
      );
    }
    //
  }
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
              opacity: 0.4
            },
            key: res.data.dzpyq,
            icon: "circle"
          },
          {
            value: res.data.jinxz,
            name: "进行中",
            itemStyle: {
              color: "#A5d6A7",
              opacity: 0.4
            },
            key: res.data.jxzyq,
            icon: "circle"
          },
          {
            value: res.data.daiqr,
            name: "待确认",
            itemStyle: {
              color: "#81d4fa",
              opacity: 0.4
            },
            key: res.data.dqryq,
            icon: "circle"
          },
          {
            value: res.data.yiwc,
            name: "已完成",
            itemStyle: {
              color: "#b0bec5",
              opacity: 0.4
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
              opacity: 0.4
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
            itemStyle: {},
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
      this.setState({ dates: dateData }, () => {
        this.getProjectProgress(projectIds, val[0], val[1], "");
      });
    }
  }
  //处理项目进展类型
  typeChange(val) {
    const { projectIds } = this.state;
    this.setState({ dateType: val }, () => {
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
    } else {
      return {
        chart1: this.renderPerformBarChat(taskNumList, "projectName"),
        chart2: this.renderPerformBarChat(taskPersonList)
      };
    }
  }
  projectListClick(list, menutype, tagId) {
    this.setState({ projectList: list });
    const { showChart, type } = this.state;

    const projectIds = list;
    this.props.getProjectStatistics({ projectIds });
    this.setState({ projectIds: list, type: menutype, labelId: tagId });
    this.props.getPendByProject({ projectIds }); //代办统计按人员
    this.props.getPendStatistics({ projectIds }); //代办统计按项目
    if (showChart === "achiev") {
      this.props.getNumByProject(type, projectIds); //
      this.props.getNumByPerson(type, projectIds); //
    } else {
      this.props.getContentByProject(type, projectIds);
      this.props.getContentByPerson(type, projectIds);
    }
    this.getTaskState(projectIds);
    this.getTaskProject(projectIds);
    this.getProjectProgress(projectIds);
    // this.props.getNumByProject(); //
    // this.props.getNumByPerson(); //
  }
  downLoad() {
    const { showChart, projectList, type, attdate } = this.state;
    const { projectListAll } = this.props;
    if (showChart === "achiev") {
      downNumByProject(
        projectList.length > 0 ? projectList : projectListAll,
        type,
        attdate[0],
        attdate[1]
      );
    } else {
      downContentByProject(
        projectList.length > 0 ? projectList : projectListAll,
        type,
        attdate[0],
        attdate[1]
      );
    }
  }
  downLoad1() {
    const { showChart, projectList, type, attdate } = this.state;
    const { projectListAll } = this.props;
    if (showChart === "achiev") {
      downNumByPerson(
        projectList.length > 0 ? projectList : projectListAll,
        type,
        attdate[0],
        attdate[1]
      );
    } else {
      downContentByPerson(
        projectList.length > 0 ? projectList : projectListAll,
        type,
        attdate[0],
        attdate[1]
      );
    }
  }
  render() {
    const {
      penProject,
      penPerson,
      taskNumList,
      taskPersonList,
      performancePro,
      performancePer,
      totalData,

      projectListAll
    } = this.props;
    const {
      showChart,
      lastMonth,
      currentMonth,
      projectId,
      type,
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
      chartProgressLoading
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
          <Content>
            {false ? (
              <div style={{ textAlign: "center" }}>
                <Spin spinning={pageLoading} />
              </div>
            ) : (
              <div className="census">
                <div
                  className={
                    projectSearchDivOnTop
                      ? "screen pro_screen chart-left-fixed"
                      : "screen pro_screen"
                  }
                >
                  <ContentLeftList
                    ref="staticticsDetail"
                    pageType={1}
                    projectSearchDivOnTop={projectSearchDivOnTop}
                    projectOnClick={(list, type, labelIds) => {
                      this.projectListClick(list, type, labelIds);
                    }}
                  />
                </div>
                <div className="rightSection">
                  <div>
                    <div className="contentSection">
                      <div className="contentSectionLeft">
                        <div className="contentSectionHead">
                          <div className="contentSectionLeftTitle">fjfkjf</div>
                          <div className="contentSectionLeftIcon">
                            <Popover
                              placement="left"
                              title={null}
                              content={
                                <div className="download">
                                  <div>导出项目待办</div>
                                  <div className="myBorder" />
                                  <div>导出人员待办</div>
                                </div>
                              }
                              trigger="click"
                              className="export"
                            >
                              <i className="iconfont icon-more"> </i>
                            </Popover>
                          </div>
                        </div>
                        <div className="contentSectionMain">
                          <div className="Main1">
                            <div className="Main1section">
                              <div className="Main1sectiontop">aaa</div>
                              <div className="Main1sectionbottom">aaa</div>
                            </div>
                            <div className="Main1section">
                              <div className="Main1sectiontop">aaa</div>
                              <div
                                className="Main1sectionbottom"
                                ref="alertRuleChart"
                              />
                            </div>
                            <div className="Main1section">
                              <div className="Main1sectiontop">aaa</div>
                              <div className="Main1sectionbottom" />
                            </div>
                          </div>
                          <div className="Main2">
                            <div className="Main2sectiontop">1111</div>
                            <div className="Main2sectionbottom">
                              <RingChart refname="aaa" />
                            </div>
                          </div>
                          <div className="Main2">
                            <div className="Main2sectiontop">1111</div>
                            <div className="Main2sectionbottom">
                              <RingChart refname="bbb" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="contentSection2">
                      <div className="contentSectionHead">
                        <div className="contentSectionLeftTitle">fjfkjf</div>
                        <div className="contentSectionLeftIcon">
                          <Popover
                            placement="left"
                            title={null}
                            content={
                              <div className="download">
                                <div>导出项目待办</div>
                                <div className="myBorder" />
                                <div>导出人员待办</div>
                              </div>
                            }
                            trigger="click"
                            className="export"
                          >
                            <i className="iconfont icon-more"> </i>
                          </Popover>
                        </div>
                      </div>
                      <div className="contentSectionMain">
                        <div className="Main1">
                          <div className="Main1section">
                            <div className="Main1sectiontop">aaa</div>
                            <div className="Main1sectionbottom">aaa</div>
                          </div>
                          <div className="Main1section">
                            <div className="Main1sectiontop">aaa</div>
                            <div className="Main1sectionbottom">aaa</div>
                          </div>
                          <div className="Main1section">
                            <div className="Main1sectiontop">aaa</div>
                            <div className="Main1sectionbottom">aaa</div>
                          </div>
                        </div>

                        <div className="Main2">
                          <div className="Main2sectiontop">1111</div>
                          <div
                            className="Main2sectionbottom"
                            style={{ position: "relative" }}
                          >
                            <BarChart refname="ccc" />
                            {[
                              "吕国营",
                              "吕国营",
                              "吕国营",
                              "吕国营",
                              "吕国营"
                            ].map((item, index) => {
                              return (
                                <div
                                  className="transName1"
                                  //   style={{
                                  //     left: `${53 + index * 46}px`
                                  //   }}
                                >
                                  {item}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="Main3">
                          <div className="Main3sectiontop">1111</div>
                          <div
                            className="Main3sectionbottom"
                            style={{ position: "relative" }}
                          >
                            <BarChart2 refname="ddd" />
                            {[
                              "吕国营",
                              "吕国营",
                              "吕国营",
                              "吕国营",
                              "吕国营",
                              "吕国营",
                              "吕国营",
                              "吕国营",
                              "吕国营",
                              "吕国营"
                            ].map((item, index) => {
                              return (
                                <div
                                  className="transName"
                                  style={{
                                    left: `${53 + index * 46}px`
                                  }}
                                >
                                  {item}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
