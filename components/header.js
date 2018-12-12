import React from "react";
import {
  Layout,
  Row,
  Col,
  Dropdown,
  Icon,
  Menu,
  Button,
  Popover,
  Modal
} from "antd";
import Router from "next/router";
import NProgress from "nprogress";

import stylesheet from "styles/components/header.scss";
import Message from "../components/message";
import TaskCreate from "../components/taskCreate";
import { getMessageCount } from "../core/service/message.service";
import { getLimtTask } from "../core/service/task.service";
import Storage from "../core/utils/storage";
import Feedback from "./feedback";
import TagManage from "./tagManage";
import TagManageTask from "./common/tagManageTask";
import MoneyEnd from "../components/moneyEnd";
import Authorization from "../components/setting/authorization";
import { getTeamInfoWithMoney } from "../core/utils/util";
import VersionUpdate from "../components/versionUpdate";
import VersionUpgrades from "../components/versionUpgrades";
import HttpClient from "../core/api/HttpClient";
Router.onRouteChangeStart = url => {
  NProgress.start();
};
Router.onRouteChangeComplete = () => NProgress.done();
Router.onRouteChangeError = () => NProgress.done();

const { Header } = Layout;

/*
 * （选填）menuShow：false         // 顶部菜单小图标是否显示
 * （选填）menuClickCallBack(val)  // 点击对应菜单的回调
 * （选填）iconOnClickCallBack()   // 点击顶部小图标的回调
 */

export default class Head extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      act: "/home",
      menuShow: false,
      messageShow: false,
      createShow: false,
      messageCount: 0,
      user: {},
      isAysc: "",
      feedShow: false, //意见反馈弹框是否显示
      projectManage: false, //项目分类管理是否显示
      publicManage: false,
      personManage: false,

      teamMoneyEnd: false,
      versionAlert: false,
      versionUpdateShow: false,
      taskMax: 0,
      available: true,
      demo: false,
      visible: false,
      versionShow: false,
      authoriShow: false
    };
  }

  componentWillMount() {
    this.getMsgCount();
    const user = Storage.get("user");
    this.setState({ user: user });
  }

  componentDidMount() {
    const lastVersionNum = Storage.getLocal("lastVersionNum");
    const currentVer = HttpClient.getVersion();
    if (lastVersionNum === null || lastVersionNum != currentVer) {
      this.setState({ versionUpdateShow: true });
      Storage.setLocal("lastVersionNum", currentVer);
    } else {
      this.setState({ versionUpdateShow: false });
    }
    if (getTeamInfoWithMoney("版本名称") === "免费版") {
      this.getLimt();
    }
    const that = this;
    window.addEventListener("resize", e => {
      if (document.documentElement.clientWidth > 1250) {
        that.setState({ menuShow: false });
      }
    });

    this.menuAct();
  }

  componentWillReceiveProps() {
    this.menuAct();
  }

  componentWillUnmount() {
    this.setState = (state, callback) => {
      return;
    };
  }
  getLimt() {
    getLimtTask(data => {
      console.log(data);
      if (data.err) {
        return false;
      }
      this.setState({
        taskMax: data.projectMax,
        available: data.success
      });
    });
  }

  //免费版任务限制
  freeTaskLimit() {
    const { available } = this.state;
    if (getTeamInfoWithMoney("版本名称") === "免费版") {
      this.getLimt();
      if (!available) {
        this.setState({ visible: true });
      }
    }
  }
  menuAct() {
    const url = Router.router.pathname;
    this.setState({ act: url });
  }

  getMsgCount() {
    getMessageCount(res => {
      if (res.err) {
        return false;
      }
      this.setState({
        messageCount: res.messageCount,
        isAysc: res.tiem ? res.tiem.isAdmin : ""
      });
    });
  }

  menuSwitch() {
    const { act } = this.state;
    if (act.indexOf("/pc_task") !== -1) {
      if (this.state.menuShow) {
        this.setState({ menuShow: false });
      } else {
        this.setState({ menuShow: true });
      }
    } else if (act.indexOf("/pc_projectDetails") !== -1) {
      this.props.iconOnClickCallBack();
    } else if (act.indexOf("/pc_dynamicNew") !== -1) {
      this.props.iconOnClickCallBack();
    } else if (act.indexOf("/pc_census") !== -1) {
      this.props.iconOnClickCallBack();
    }
  }
  demoShowTest(e) {
    this.setState({ demo: e });
  }

  render() {
    const {
      visible,
      versionShow,
      demo,
      available,
      taskMax,
      act,
      menuShow,
      messageShow,
      user,
      createShow,
      messageCount,
      feedShow,
      projectManage,
      publicManage,
      personManage,
      versionAlert,
      isAysc,
      versionUpdateShow,
      teamMoneyEnd,
      authoriShow
    } = this.state;
    const menu = (
      <Menu>
        <Menu.Item>
          <a
            onClick={() => {
              this.setState({ authoriShow: true });
            }}
          >
            <i className="iconfont icon-authority" />
            授权信息
          </a>
        </Menu.Item>
        <Menu.Item>
          <a
            onClick={() => {
              this.setState({ projectManage: true });
            }}
          >
            <i className="iconfont icon-label1" />
            项目分类管理
          </a>
        </Menu.Item>
        <Menu.Item>
          <a
            onClick={() => {
              this.setState({ publicManage: true });
            }}
          >
            <i className="iconfont icon-label" />
            任务标签管理
          </a>
        </Menu.Item>

        {/* <Menu.Item>
          <a
            onClick={() => {
              this.setState({ versionUpdateShow: true });
            }}
          >
            <i className="iconfont icon-setting" />
            偏好設置
          </a>
        </Menu.Item> */}
        <Menu.Divider />
        <Menu.Item>
          <a
            onClick={() => {
              this.setState({ versionUpdateShow: true });
            }}
          >
            <i className="iconfont icon-2" />
            版本说明
          </a>
        </Menu.Item>
        <Menu.Item>
          <a
            onClick={() => {
              Router.push("/pc_guide");
            }}
          >
            <i className="iconfont icon-touchhandgesture" />
            功能引导
          </a>
        </Menu.Item>
        <Menu.Item>
          <a
            onClick={() => {
              this.setState({ feedShow: true });
            }}
          >
            <i className="iconfont icon-mail" />
            联系服务商
          </a>
        </Menu.Item>
        {/* <Menu.Item>
          <a
            onClick={() => {
              this.setState({ personManage: true });
            }}
          >
            <i className="iconfont icon-2" />
            个人标签管理
          </a>
        </Menu.Item> */}
        {/* <Menu.Item>
          <a
            onClick={() => {
              this.setState({ feedShow: true });
            }}
          >
            <i className="iconfont icon-2" />
            联系服务商
          </a>
        </Menu.Item>
        <Menu.Item>
          <a
            onClick={() => {
              Router.push("/pc_guide");
            }}
          >
            <i className="iconfont icon-2" />
            功能引导
          </a>
        </Menu.Item>
        <Menu.Item>
          <a
            onClick={() => {
              Router.push("/pc_help");
            }}
          >
            <i className="iconfont icon-2" />
            帮助中心
          </a>
        </Menu.Item> */}
      </Menu>
    );
    let { selectKey } = this.props;
    if (selectKey === "") {
      selectKey = "all";
    }
    return (
      <div>
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        <Header>
          {versionUpdateShow ? (
            <VersionUpdate
              demoShowTest={demo => this.demoShowTest(demo)}
              versionUpdateShow={versionUpdateShow}
              closeCallBack={() => {
                this.setState({ versionUpdateShow: false });
              }}
            />
          ) : (
            ""
          )}
          {demo ? (
            <VersionUpgrades
              closeCallBack={() => {
                this.setState({ demo: false });
              }}
            />
          ) : (
            ""
          )}
          {createShow ? (
            <TaskCreate
              closedCallBack={() => {
                this.setState({ createShow: false });
              }}
            />
          ) : (
            ""
          )}
          {teamMoneyEnd && (
            <MoneyEnd
              alertText={getTeamInfoWithMoney("续费提示")}
              closeCallBack={() => {
                this.setState({ teamMoneyEnd: false });
              }}
            />
          )}
          {versionAlert && (
            <MoneyEnd
              alertText={getTeamInfoWithMoney("专业版提示")}
              closeCallBack={() => {
                this.setState({ versionAlert: false });
              }}
            />
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
              </div>
            </div>
          </Modal>
          <Row>
            <Col span={16}>
              {act.indexOf("/pc_task") !== -1 ||
              act.indexOf("/pc_projectDetails") !== -1 ||
              act.indexOf("/pc_dynamicNew") !== -1 ||
              act.indexOf("/pc_census") !== -1 ? (
                <Icon
                  type="menu-unfold"
                  className="barIcon"
                  onClick={() => {
                    this.menuSwitch();
                  }}
                />
              ) : (
                ""
              )}
              {menuShow ? (
                <div
                  className="listMenuBox"
                  onClick={() => {
                    this.setState({ menuShow: false });
                  }}
                >
                  <ul className="listMenu">
                    <li>
                      <div className="tit">
                        <Icon type="mail" />
                        <span>我的任务</span>
                      </div>
                      <ul>
                        <li
                          className={selectKey === "sub1" ? "act" : ""}
                          onClick={() => {
                            this.props.menuClickCallBack("sub1");
                          }}
                        >
                          我负责的
                        </li>
                        <li
                          className={selectKey === "my_add" ? "act" : ""}
                          onClick={() => {
                            this.props.menuClickCallBack("my_add");
                          }}
                        >
                          我创建的
                        </li>
                        <li
                          className={selectKey === "my_be" ? "act" : ""}
                          onClick={() => {
                            this.props.menuClickCallBack("my_be");
                          }}
                        >
                          我指派的
                        </li>
                        <li
                          className={selectKey === "my_succeed" ? "act" : ""}
                          onClick={() => {
                            this.props.menuClickCallBack("my_succeed");
                          }}
                        >
                          我确认的
                        </li>
                        <li
                          className={selectKey === "my_attention" ? "act" : ""}
                          onClick={() => {
                            this.props.menuClickCallBack("my_attention");
                          }}
                        >
                          我关注的
                        </li>
                      </ul>
                    </li>
                    <li className={selectKey === "all" ? "act" : ""}>
                      {getTeamInfoWithMoney("是否可用") && (
                        <div
                          onClick={() => {
                            this.props.menuClickCallBack("all");
                          }}
                          className="tit"
                        >
                          {getTeamInfoWithMoney("版本名称") === "专业版" ? (
                            <Icon type="mail" />
                          ) : (
                            ""
                          )}
                          {getTeamInfoWithMoney("版本名称") !== "专业版" ? (
                            <svg
                              className="pro-icon zuanshi"
                              aria-hidden="true"
                            >
                              <use xlinkHref={"#pro-myfg-zuanshi"} />
                            </svg>
                          ) : (
                            ""
                          )}
                          <span>全部任务</span>
                        </div>
                      )}
                      {!getTeamInfoWithMoney("是否可用") && (
                        <div
                          onClick={() => {
                            this.setState({ versionAlert: true });
                          }}
                          className="tit"
                        >
                          <svg className="pro-icon zuanshi" aria-hidden="true">
                            <use xlinkHref={"#pro-myfg-zuanshi"} />
                          </svg>
                          <span>全部任务</span>
                        </div>
                      )}
                    </li>
                    <div className="butBox">
                      {!available ? (
                        <Button
                          type="primary"
                          icon="plus-circle-o"
                          onClick={() => {
                            this.freeTaskLimit();
                          }}
                        >
                          创建任务
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          onClick={() => {
                            this.setState({ createShow: true });
                          }}
                        >
                          创建任务
                        </Button>
                      )}
                    </div>
                  </ul>
                </div>
              ) : (
                ""
              )}
              <div className="ant-dropdown-link">
                <div className="title">
                  蚂蚁分工
                  <span
                    className="spanicon"
                    style={
                      getTeamInfoWithMoney("版本名称") === "免费版"
                        ? {
                            background:
                              "url(../static/react-static/pcvip/imgs/free.png) no-repeat center center",
                            backgroundSize: "contain",
                            display: "block",
                            top:
                              getTeamInfoWithMoney("版本名称") === "试用版" ||
                              (getTeamInfoWithMoney("版本名称") !== "试用版" &&
                                getTeamInfoWithMoney("剩余天数") < 16 &&
                                getTeamInfoWithMoney("版本名称") !== "免费版")
                                ? "-2px"
                                : "8px"
                          }
                        : getTeamInfoWithMoney("版本名称") === "专业版"
                        ? {
                            background:
                              "url(../static/react-static/pcvip/imgs/pro.png) no-repeat center center",
                            backgroundSize: "contain",
                            display: "block",
                            top:
                              getTeamInfoWithMoney("版本名称") === "试用版" ||
                              (getTeamInfoWithMoney("版本名称") !== "试用版" &&
                                getTeamInfoWithMoney("剩余天数") < 16 &&
                                getTeamInfoWithMoney("版本名称") !== "免费版")
                                ? "-2px"
                                : "8px"
                          }
                        : getTeamInfoWithMoney("版本名称") === "基础版"
                        ? {
                            background:
                              "url(../static/react-static/pcvip/imgs/bas.png) no-repeat center center",
                            backgroundSize: "contain",
                            top:
                              getTeamInfoWithMoney("版本名称") === "试用版" ||
                              (getTeamInfoWithMoney("版本名称") !== "试用版" &&
                                getTeamInfoWithMoney("剩余天数") < 16 &&
                                getTeamInfoWithMoney("版本名称") !== "免费版")
                                ? "-2px"
                                : "8px",
                            display: "block"
                          }
                        : getTeamInfoWithMoney("版本名称") === "试用版"
                        ? {
                            background:
                              "url(../static/react-static/pcvip/imgs/pro-sy.png) no-repeat center center",
                            backgroundSize: "contain",
                            top:
                              getTeamInfoWithMoney("版本名称") === "试用版" ||
                              (getTeamInfoWithMoney("版本名称") !== "试用版" &&
                                getTeamInfoWithMoney("剩余天数") < 16 &&
                                getTeamInfoWithMoney("版本名称") !== "免费版")
                                ? "-2px"
                                : "8px",
                            display: "block"
                          }
                        : {}
                    }
                  >
                    {/* {getTeamInfoWithMoney("版本名称") === "试用版"
                      ? "专业版"
                      : getTeamInfoWithMoney("版本名称")}
                    {getTeamInfoWithMoney("版本名称") !== "基础版" &&
                    getTeamInfoWithMoney("版本名称") !== "免费版" ? (
                      <svg
                        className="pro-icon zuanshi"
                        aria-hidden="true"
                        style={{ margin: "0 5px 0 5px" }}
                      >
                        <use xlinkHref={"#pro-myfg-zuanshi"} />
                      </svg>
                    ) : (
                      ""
                    )}
                    {getTeamInfoWithMoney("版本名称") === "试用版"
                      ? "试用"
                      : ""} */}
                  </span>
                  {/* <div className="p">
                    剩余
                    <span>
                      {getTeamInfoWithMoney("剩余天数") < 0
                        ? 0
                        : getTeamInfoWithMoney("剩余天数")}
                    </span>
                    天
                  </div> */}
                  {getTeamInfoWithMoney("版本名称") === "试用版" ||
                  (getTeamInfoWithMoney("版本名称") !== "试用版" &&
                    getTeamInfoWithMoney("剩余天数") < 16 &&
                    getTeamInfoWithMoney("版本名称") !== "免费版") ? (
                    <div className="p">
                      剩余&nbsp;
                      <span>
                        {getTeamInfoWithMoney("剩余天数") < 0
                          ? 0
                          : getTeamInfoWithMoney("剩余天数")}
                      </span>
                      &nbsp;天
                    </div>
                  ) : (
                    ""
                  )}
                </div>

                {/* {getTeamInfoWithMoney("版本名称") === "试用版" ||
                (getTeamInfoWithMoney("版本名称") !== "试用版" &&
                  getTeamInfoWithMoney("剩余天数") < 16) ||
                getTeamInfoWithMoney("版本名称") === "免费版" ? (
                  <div
                    className="xfBtn"
                    onClick={() => {
                      this.setState({ teamMoneyEnd: true });
                    }}
                  >
                    续费/升级
                  </div>
                ) : (
                  ""
                )} */}
              </div>
              <ul className="header-menu">
                <li
                  className={act.indexOf("/pc_task") !== -1 ? "act" : ""}
                  onClick={() => {
                    Router.push("/pc_task");
                  }}
                >
                  任务
                </li>
                <li
                  className={act.indexOf("/pc_project") !== -1 ? "act" : ""}
                  onClick={() => {
                    Router.push("/pc_project");
                  }}
                >
                  项目
                </li>
                <li
                  className={
                    act.indexOf("/pc_census") !== -1 ||
                    act.indexOf("/pc_basic_statistics") !== -1
                      ? "act"
                      : ""
                  }
                  onClick={() => {
                    console.log(getTeamInfoWithMoney("版本名称"));
                    if (
                      getTeamInfoWithMoney("版本名称") === "免费版" ||
                      getTeamInfoWithMoney("版本名称") === "基础版"
                    ) {
                      Router.push("/pc_basic_statistics");
                    } else {
                      Router.push("/pc_census");
                    }
                  }}
                >
                  统计
                </li>
                <li
                  className={act.indexOf("/pc_dynamicNew") !== -1 ? "act" : ""}
                  onClick={() => {
                    Router.push("/pc_dynamicNew");
                  }}
                >
                  动态
                </li>
              </ul>
            </Col>
            <Col span={8}>
              <div
                className="setup"
                onClick={() => {
                  this.setState({ messageShow: true });
                }}
              >
                <span>通知({messageCount})</span>
              </div>
              <div
                className="setup"
                onClick={() => {
                  Router.push("/pc_help");
                }}
              >
                <span>帮助</span>
              </div>
              <Dropdown
                overlay={menu}
                trigger={["click"]}
                placement="topCenter"
              >
                <div className="setup">
                  <span>设置</span>
                </div>
              </Dropdown>
              <div className="menu_down">
                {user.photo ? (
                  <img className="img" src={user.photo} />
                ) : (
                  <div className="user">{user.nickname}</div>
                )}
              </div>
            </Col>
            {messageShow ? (
              <Message
                closeCallBack={() => {
                  this.setState({ messageShow: false });
                }}
                messageCountOnChange={val => {
                  this.setState({ messageCount: val });
                }}
              />
            ) : (
              ""
            )}
            {feedShow ? (
              <Feedback
                feedbackShow={feedShow}
                closeCallBack={() => {
                  this.setState({ feedShow: false });
                }}
              />
            ) : (
              ""
            )}
            {projectManage ? (
              <TagManage
                type="3"
                title="项目标签管理"
                closedCallBack={() => {
                  this.setState({ projectManage: false });
                }}
                canEdit={isAysc}
              />
            ) : (
              ""
            )}
            {publicManage ? (
              <TagManageTask
                type="2"
                title="任务标签管理"
                canEdit={isAysc}
                closedCallBack={() => {
                  this.setState({ publicManage: false });
                }}
              />
            ) : (
              ""
            )}
            {/* {personManage ? (
              <TagManage
                type="1"
                title="个人标签管理"
                closedCallBack={() => {
                  this.setState({ personManage: false });
                }}
              />
            ) : (
              ""
            )} */}
            {authoriShow ? (
              <Authorization
                closedCallBack={() => {
                  this.setState({ authoriShow: false });
                }}
              />
            ) : (
              ""
            )}
          </Row>
        </Header>
      </div>
    );
  }
}
