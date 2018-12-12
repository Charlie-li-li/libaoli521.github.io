import React from "react";
import {
  Layout,
  Icon,
  Spin,
  Radio,
  Tag,
  message,
  Progress,
  Input,
  Modal,
  Button,
  Popover
} from "antd";
import { bindActionCreators } from "redux";
import withRedux from "next-redux-wrapper";
import { LocaleProvider } from "antd";
import zh_CN from "antd/lib/locale-provider/zh_CN";
import "moment/locale/zh-cn";

import { initStore } from "../store";
import stylesheet from "styles/views/project.scss";
import Head from "../components/header";
import * as projectAction from "../core/actions/project";
import {
  getProListByType,
  cancelAttentionWitchProject,
  addAttentionWitchProject,
  projectLimit
} from "../core/service/project.service";
import { getLimtTask } from "../core/service/task.service";

import { getProjectTypeList } from "../core/service/tag.service";
import {
  listScroll,
  getTagColorByColorCode,
  isLoadingErr,
  getTeamInfoWithMoney,
  clearTag
} from "../core/utils/util";
import Router from "next/router";
import ProjectCreate from "../components/projectCreate";

import dingJS from "../core/utils/dingJSApi";
import NullView from "../components/nullView";
import MoneyEnd from "../components/moneyEnd";

const { Content } = Layout;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Search = Input.Search;

class Project extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      projectList: [],
      projectListNowPage: 1,
      projectListAllPage: 0,
      projectListLoading: false,
      projectListLoadingCount: 0,
      rtype: "2", // 默认选中 所有项目
      labelIds: [],
      searchTxt: "",
      projectListMoreLoading: false,
      typeList: [],
      projectCreateShow: "",
      projectId: "",
      searchOpen: true,

      moneyEnd: false,
      projectMax: 0,
      available: true,
      visible: false,
      versionShow: false,
      focus: false
    };
  }

  componentWillMount() {
    if (this.props.projectSearchVal.type) {
      this.setState({ rtype: this.props.projectSearchVal.type });
    }
    this.getProList(
      this.props.projectSearchVal.type ? this.props.projectSearchVal.type : ""
    );
    this.getProTypeList();
  }

  componentDidMount() {
    if (getTeamInfoWithMoney("版本名称") === "免费版") {
      this.getLimtProject();
    }

    dingJS.authDingJsApi();
  }

  componentWillUnmount() {
    this.setState = (state, callback) => {
      return;
    };
  }

  // 获取项目分类
  getProTypeList() {
    getProjectTypeList(data => {
      if (data.err) {
        return false;
      }
      this.setState({ typeList: data.labels });
    });
  }
  //获取限制
  getLimtProject() {
    getLimtTask(data => {
      if (data.err) {
        return false;
      }
      this.setState({
        available: data.success,
        projectMax: data.projectMax
      });
    });
  }

  //免费版任务限制
  freeTaskLimit() {
    const { available } = this.state;
    if (getTeamInfoWithMoney("版本名称") === "免费版") {
      this.getLimtProject();
      if (!available) {
        this.setState({ visible: true });
      }
    }
  }
  // 获取项目列表
  getProList(type, pageNo, labelIds, searchTxt = "") {
    if (!type) {
      type = this.state.rtype;
    }
    if (!pageNo) {
      pageNo = 1;
    }
    if (!labelIds) {
      labelIds = this.state.labelIds ? this.state.labelIds : [];
    }
    if (!searchTxt) {
      searchTxt = this.state.searchTxt;
    } else if (searchTxt === "空") {
      searchTxt = "";
    }

    if (pageNo === 1) {
      this.setState({ projectListLoading: true });
    } else {
      this.setState({ projectListMoreLoading: true });
    }

    const projectSeachVal = {
      type: type
    };
    this.props.setProjectSeachVal(projectSeachVal);
    this.setState({ projectListLoading: true });
    const labs = labelIds.map(item => {
      return item.id;
    });
    getProListByType(
      type,
      pageNo,
      data => {
        if (data.err) {
          this.setState({ projectListLoadingCount: "err" });
          this.setState({
            projectListLoading: false,
            projectListMoreLoading: false
          });

          if (pageNo > 1) {
            message.error(isLoadingErr());
          }
          return false;
        }
        if (data.pageNo === 1) {
          if (data.projects) {
            this.setState({ projectList: data.projects });
          }
        } else {
          let newProjectList = JSON.parse(
            JSON.stringify(this.state.projectList)
          );
          data.projects.map((item, i) => {
            const idLength = newProjectList.filter(val => val.id === item.id);
            if (idLength.length === 0) {
              newProjectList.push(item);
            }
          });
          this.setState({ projectList: newProjectList });
        }

        this.setState({
          projectListAllPage: data.last,
          projectListNowPage: data.pageNo,
          projectListLoading: false,
          projectListMoreLoading: false
        });
        if (this.state.projectListLoadingCount === "err") {
          this.setState({ projectListLoadingCount: 0 });
        } else {
          this.setState({
            projectListLoadingCount: this.state.projectListLoadingCount + 1
          });
        }
      },
      39,
      labs,
      searchTxt
    );
  }

  scrollOnBottom(e) {
    const isOnButtom = listScroll(e);
    const { projectListAllPage, projectListNowPage } = this.state;
    if (isOnButtom && projectListNowPage < projectListAllPage) {
      this.setState({ projectListMoreLoading: true });
      this.getProList("", projectListNowPage + 1);
    }
  }

  // 取消&关注
  attention(type, proId) {
    if (type === "1") {
      cancelAttentionWitchProject(proId, data => {
        if (data.err) {
          return false;
        }
        message.success("取消成功");
        this.getProList();
      });
    } else {
      addAttentionWitchProject(proId, data => {
        if (data.err) {
          return false;
        }
        message.success("关注成功");
        this.getProList();
      });
    }
  }

  onChange(e) {
    let rType = e.target.value;
    this.setState({ rtype: rType });
    this.getProList(rType, 1);
  }

  selectingTag(id, color, name) {
    let { labelIds } = this.state;
    const length = labelIds.filter(val => val.id === id).length;
    if (length === 0) {
      labelIds.push({
        id: id,
        color: color,
        name: name,
        type: "2"
      });
    } else {
      let newLabels = [];
      labelIds.map((val, i) => {
        if (val.id !== id) {
          newLabels.push(val);
        }
      });
      labelIds = newLabels;
    }
    this.setState({ labelIds: labelIds });
    this.getProList("", 1, labelIds);
  }
  // 回调刷新数据
  updateOk(val) {
    if (val === "刷新") {
      this.getProList();
    } else {
      const { projectList } = this.state;
      if (projectList.length > 0) {
        projectList.map((item, index) => {
          if (item.id === val.id) {
            item.attstr04 = val.attstr04;
            item.proname = val.proname;
            if (val.tags) {
              const tags = [];
              val.tags.map(tag => {
                tags.push({
                  id: tag.id,
                  labelname: tag.name,
                  color: tag.color
                });
              });
              item.labelList = tags;
            }
            this.setState({ projectList: projectList });
          }
        });
      }
    }
  }
  render() {
    const {
      versionShow,
      visible,
      available,
      projectList,
      projectMax,
      searchOpen,
      projectListLoading,
      projectId,
      projectCreateShow,
      moneyEnd,
      projectListLoadingCount,
      rtype,
      searchTxt,
      projectListMoreLoading,
      projectListNowPage,
      projectListAllPage,
      typeList,
      labelIds
    } = this.state;

    return (
      <LocaleProvider locale={zh_CN}>
        <Layout>
          <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
          <Head />
          <Content className="project">
            {moneyEnd ? (
              <MoneyEnd
                alertText={getTeamInfoWithMoney("专业版提示")}
                closeCallBack={() => {
                  this.setState({ moneyEnd: false });
                }}
              />
            ) : (
              ""
            )}
            <Modal
              visible={visible}
              onCancel={() => {
                this.setState({ visible: false });
              }}
              footer={null}
              width={versionShow ? 850 : 520}
              closable={!versionShow}
              mask={true}
              className="limitModel"
              maskClosable={false}
              wrapClassName="limitModel"
              style={versionShow ? {} : { top: 260, height: "400px" }}
            >
              {versionShow ? (
                <div className="imgBox">
                  <p>基础版&专业版功能对比</p>
                  <Icon
                    type="close"
                    onClick={() => {
                      this.setState({ versionShow: false });
                    }}
                  />
                  <div className="img">
                    <img src="../static/react-static/pcvip/imgs/versionTable1.png?t=2.1" />
                    <img src="../static/react-static/pcvip/imgs/versionTable2.jpg?t=2.1" />
                  </div>
                </div>
              ) : (
                ""
              )}
              <div
                className="writeBox"
                style={versionShow ? { display: "none" } : {}}
              >
                <p>
                  <span className="limitMesg">用量信息</span>
                  <span
                    onClick={() => {
                      this.setState({ versionShow: true });
                    }}
                    className="versionMeg"
                  >
                    版本介绍
                  </span>
                </p>
                <div className="myBorder" />
                <div className="text">
                  <p>
                    您正在使用的是<b> 蚂蚁分工免费版</b>，免费版每月可创建
                    <b> 200 </b>条任务，本月任务用量已达版本上限。
                  </p>
                  <p>
                    如您的团队项目和任务数量较多，可升级为经济实惠的
                    <b> 蚂蚁分工基础版</b>
                    ，基础版不限使用人数、不限项目数量、不限任务数量。
                  </p>
                  <p>
                    我们更建议您升级到功能强大的<b> 蚂蚁分工专业版</b>
                    ，专业版具有批量任务操作、甘特图、多维度数据统计图表等专业功能，助您提高协同工作效率、提升项目管理水平。
                  </p>
                </div>
                <div className="renew">
                  <Popover
                    content={
                      <div>
                        {getTeamInfoWithMoney("是否钉钉订单") ? (
                          <div>
                            <img
                              src="../static/react-static/pcvip/imgs/ewmDing.png"
                              style={{
                                width: "200px",
                                height: "230px",
                                margin: "10px 0px 0 10px"
                              }}
                            />
                            <img
                              src="../static/react-static/pcvip/imgs/ewmMaYi.png"
                              style={{
                                width: "200px",
                                height: "230px",
                                margin: "10px 10px 0 40px"
                              }}
                            />
                          </div>
                        ) : (
                          <img
                            src="../static/react-static/pcvip/imgs/ewmMaYi.png"
                            style={{
                              width: "200px",
                              height: "230px",
                              margin: "10px 10px 0px 10px"
                            }}
                          />
                        )}
                      </div>
                    }
                    placement="top"
                    trigger="click"
                  >
                    <Button
                      type="primary"
                      style={{ marginRight: "20px", height: "30px" }}
                    >
                      升级专业版
                    </Button>
                  </Popover>
                  <Popover
                    content={
                      <div>
                        {getTeamInfoWithMoney("是否钉钉订单") ? (
                          <div>
                            <img
                              src="../static/react-static/pcvip/imgs/ewmDing.png"
                              style={{
                                width: "200px",
                                height: "230px",
                                margin: "10px 0px 0 10px"
                              }}
                            />
                            <img
                              src="../static/react-static/pcvip/imgs/ewmMaYi.png"
                              style={{
                                width: "200px",
                                height: "230px",
                                margin: "10px 10px 0 40px"
                              }}
                            />
                          </div>
                        ) : (
                          <img
                            src="../static/react-static/pcvip/imgs/ewmMaYi.png"
                            style={{
                              width: "200px",
                              height: "230px",
                              margin: "10px 10px 0px 10px"
                            }}
                          />
                        )}
                      </div>
                    }
                    placement="top"
                    trigger="click"
                  >
                    <Button type="primary" style={{ height: "30px" }}>
                      升级基础版
                    </Button>
                  </Popover>
                  <span
                    onClick={() => {
                      this.setState({
                        projectCreateShow: "创建项目",
                        visible: false
                      });
                    }}
                    style={{
                      color: "#BDBDBD",
                      cursor: "pointer",
                      marginLeft: "20px"
                    }}
                  >
                    继续创建项目
                    <Icon type="right" />
                  </span>
                </div>
              </div>
            </Modal>
            <div className="project-filter">
              <div className="switchRow">
                <RadioGroup
                  defaultValue={rtype}
                  onChange={e => this.onChange(e)}
                >
                  <RadioButton value="1" className="">
                    所有项目
                  </RadioButton>
                  <RadioButton value="2">我参与的</RadioButton>
                  <RadioButton value="4">我负责的</RadioButton>
                  <RadioButton value="3">我关注的</RadioButton>
                </RadioGroup>
                {/* <Search
                  placeholder="项目搜索"
                  onSearch={value => {
                    this.getProList("", 1, "", value);
                  }}
                  value={searchTxt}
                  onChange={e => {
                    let searchTxt = e.target.value;
                    this.setState({ searchTxt: searchTxt });
                  }}
                  style={{ width: 200, margin: "3px 15px 0 0", float: "right" }}
                /> */}
                {searchTxt ? (
                  <div
                    className="quxiao"
                    onClick={() => {
                      this.setState({ searchTxt: "" });
                      this.getProList("", 1, "", "空");
                    }}
                  >
                    取消
                  </div>
                ) : (
                  ""
                )}
                <Input
                  // prefix='a'
                  style={
                    this.state.focus
                      ? {
                          width: 300,
                          transition: "width .35s linear",
                          float: "right",
                          paddingRight: "20px"
                        }
                      : {
                          width: 200,
                          transition: "width .35s linear",
                          float: "right",
                          paddingRight: "20px"
                        }
                  }
                  prefix={
                    <i
                      className="iconfont icon-search"
                      style={{
                        fontSize: "16px",
                        color: "#08c",
                        height: "16px",
                        display: "flex",
                        color: "#bdbdbd",
                        lineHeight: "24px"
                      }}
                    />
                  }
                  placeholder="项目搜索"
                  value={searchTxt}
                  onFocus={() => {
                    this.setState({ focus: true });
                  }}
                  onBlur={() => {
                    this.setState({ focus: false });
                  }}
                  onChange={e => {
                    let searchTxt = e.target.value;
                    this.setState({ searchTxt: searchTxt });
                  }}
                  onPressEnter={e => {
                    this.getProList("", 1, "", e.target.value);
                  }}
                />
              </div>
              <div className="choose">
                <div
                  className="chooseText"
                  onClick={() => {
                    this.setState({ searchOpen: !searchOpen });
                  }}
                >
                  筛选
                </div>
                <Icon
                  type={searchOpen ? "up-circle-o" : "down-circle-o"}
                  onClick={() => {
                    this.setState({ searchOpen: !searchOpen });
                  }}
                />
                <div className="line" />
              </div>
              {searchOpen &&
                typeList.map((item, i) => {
                  if (item.parentList && item.parentList.length > 0) {
                    return (
                      <div className="project-filter-item" key={item.id}>
                        <div className="title textMore">{item.labelname}</div>
                        {item.parentList && item.parentList.length > 0 ? (
                          <div className="ct">
                            {item.parentList.map(val => {
                              return (
                                <Tag
                                  key={val.id}
                                  className={
                                    "textMore " +
                                    (labelIds.filter(v => v.id === val.id)
                                      .length > 0
                                      ? getTagColorByColorCode("1", item.color)
                                      : getTagColorByColorCode("2", item.color))
                                  }
                                  onClick={() => {
                                    this.selectingTag(
                                      val.id,
                                      item.color,
                                      val.labelname
                                    );
                                  }}
                                >
                                  {val.labelname}
                                </Tag>
                              );
                            })}
                          </div>
                        ) : (
                          ""
                        )}
                      </div>
                    );
                  }
                })}
            </div>
            <div className="project-main">
              <div
                className="project-main-ct"
                onScroll={e => {
                  this.scrollOnBottom(e);
                }}
              >
                <Spin spinning={projectListLoading} />
                <div className="project-card">
                  {projectCreateShow === "创建项目" ? (
                    <ProjectCreate
                      updateOkCallback={val => this.updateOk(val)}
                      closedCallBack={() => {
                        this.setState({ projectCreateShow: false });
                      }}
                    />
                  ) : (
                    ""
                  )}
                  {projectCreateShow === "编辑项目" ? (
                    <ProjectCreate
                      projectId={projectId}
                      updateOkCallback={val => this.updateOk(val)}
                      closedCallBack={() => {
                        this.setState({ projectCreateShow: false });
                      }}
                    />
                  ) : (
                    ""
                  )}
                  {projectListLoadingCount !== "err" &&
                  projectListLoadingCount > 0 &&
                  available ? (
                    <div
                      className="card card-add"
                      onClick={e =>
                        this.setState({ projectCreateShow: "创建项目" })
                      }
                    >
                      <div className="item">
                        <Icon type="plus-circle-o" />
                        <p>创建项目</p>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {projectListLoadingCount !== "err" &&
                  projectListLoadingCount > 0 &&
                  !available ? (
                    <div
                      className="card card-add"
                      onClick={e => {
                        this.freeTaskLimit();
                      }}
                    >
                      <div className="item">
                        <Icon type="plus-circle-o" />
                        <p>创建项目</p>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  {projectList.map((item, i) => {
                    return (
                      <div className="card" key={item.id}>
                        <div
                          className="item"
                          onClick={() => {
                            Router.push("/pc_projectDetails?id=" + item.id);
                          }}
                        >
                          <div className="title">
                            <svg className="pro-icon" aria-hidden="true">
                              {item.attstr04 ? (
                                <use xlinkHref={item.attstr04} />
                              ) : (
                                <use xlinkHref="#pro-myfg-1020" />
                              )}
                            </svg>
                            <div className="name textMore">{item.proname}</div>
                          </div>
                          {item.labelList && item.labelList.length > 0 ? (
                            <div className="labels textMore">
                              {item.labelList.map((ite, i) => {
                                if (i < 3) {
                                  return (
                                    <Tag
                                      key={ite.id}
                                      className={
                                        "textMore " +
                                        getTagColorByColorCode("1", ite.color)
                                      }
                                    >
                                      {ite.labelname}
                                    </Tag>
                                  );
                                }
                              })}
                              {item.labelList && item.labelList.length > 3 ? (
                                <Icon type="ellipsis" />
                              ) : (
                                ""
                              )}
                            </div>
                          ) : (
                            <div className="labels">
                              <Tag className="nullTag">未分类</Tag>
                            </div>
                          )}
                          <div className="cont">
                            <div className="iBox">
                              {item.collect === "1" ? (
                                <Icon
                                  className="attention"
                                  type="star"
                                  onClick={e => {
                                    e.stopPropagation();
                                    this.attention(item.collect, item.id);
                                  }}
                                />
                              ) : (
                                <Icon
                                  className="attention"
                                  type="star-o"
                                  onClick={e => {
                                    e.stopPropagation();
                                    this.attention(item.collect, item.id);
                                  }}
                                />
                              )}
                            </div>
                            <Progress
                              type="circle"
                              percent={parseInt(item.progress)}
                              width={65}
                              format={percent => `${percent}%`}
                            />
                            <ul>
                              <li style={{ color: "#fd9c52" }}>
                                逾期数：<span>{item.yyqCount}</span>
                              </li>
                              <li style={{ color: "#5e97f6" }}>
                                完成数：<span>{item.ywcCount}</span>
                              </li>
                              <li>
                                任务数：<span>{item.child}</span>
                              </li>
                              <li style={{ margin: "10px 0 0 0" }}>
                                <span
                                  style={{ float: "right", height: "10px" }}
                                />
                                <label
                                  style={{ float: "right" }}
                                  className="textMore"
                                >
                                  {item.user ? item.user.name : ""}
                                </label>
                              </li>
                            </ul>
                            <div className="iBox" style={{ flex: "0 0 auto" }}>
                              <Icon
                                type={item.jurisdiction ? "setting" : "profile"}
                                onClick={e => {
                                  e.stopPropagation();
                                  this.setState({
                                    projectCreateShow: "编辑项目",
                                    projectId: item.id
                                  });
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {projectList.length === 0 && projectListLoadingCount === "err" && (
                  <NullView
                    isLoadingErr={true}
                    restLoadingCallBack={() => {
                      this.getProList();
                    }}
                  />
                )}
                {!projectListMoreLoading &&
                projectListNowPage < projectListAllPage &&
                projectListLoadingCount !== "err" ? (
                  <div className="moreLoadingRow">下拉加载更多</div>
                ) : (
                  ""
                )}
                {!projectListMoreLoading &&
                projectListNowPage === projectListAllPage &&
                projectListLoadingCount !== "err" ? (
                  <div className="moreLoadingRow">已经到底喽</div>
                ) : (
                  ""
                )}
                {projectListMoreLoading ? (
                  <div className="moreLoadingRow">
                    <Icon type="loading" className="loadingIcon" />
                    正在加载更多
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>
          </Content>
        </Layout>
      </LocaleProvider>
    );
  }
}

function mapStateToProps(state) {
  return {
    projectSearchVal: state.project.projectSearchVal
  };
}
const mapDispatchToProps = dispatch => {
  return {
    setProjectSeachVal: bindActionCreators(
      projectAction.setProjectSeachVal,
      dispatch
    )
  };
};
export default withRedux(initStore, mapStateToProps, mapDispatchToProps)(
  Project
);
