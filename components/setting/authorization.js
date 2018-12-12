import React from "react";
import { Icon, Button, Modal, Popover } from "antd";

import stylesheet from "styles/components/setting/authorization.scss";
import { getTeamInfoWithMoney } from "../../core/utils/util";
import Storage from "../../core/utils/storage";
import { getLimtTask } from "../../core/service/task.service";
import SpecificationDemo from "../../components/SpecificationDemo";

export default class authorization extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      versionShow: false,
      synUserCount: 0,
      buyUserCount: 0,
      endDate: "",
      limitNum: 0,
      gifShouquan: false
    };
  }
  componentWillMount() {
    const user = Storage.get("user");
    this.setState({
      buyUserCount: user.antIsvCorpSuite.buyUserCount,
      synUserCount: user.antIsvCorpSuite.synUserCount,
      endDate: user.antIsvCorpSuite.endDate
    });
    if (getTeamInfoWithMoney("版本名称") === "免费版") {
      getLimtTask(data => {
        this.setState({ limitNum: data.projectMax });
      });
    }
  }
  componentWillReceiveProps(nextProps) {}
  componentWillUnmount() {}
  closeModal() {
    this.props.closedCallBack();
  }
  render() {
    const {
      versionShow,
      synUserCount,
      buyUserCount,
      endDate,
      limitNum,
      gifShouquan
    } = this.state;
    const alertText = [
      getTeamInfoWithMoney("版本名称") === "专业版"
        ? `您正在使用<b> 蚂蚁分工专业版</b>，授权有效期截止于<b>${endDate} </b>最大可授权人数为 ${buyUserCount} 人，目前已授权 ${synUserCount} 人。您可提前进行续费或升级到可容纳更多人员的规格。`
        : getTeamInfoWithMoney("版本名称") === "基础版"
        ? `您正在使用<b> 蚂蚁分工基础版</b>，授权有效期截止于<b>${endDate} </b> 日。您可提前续费或升级到功能更为强大的专业版。`
        : getTeamInfoWithMoney("版本名称") === "试用版"
        ? `您正在<b> 试用 </b>蚂蚁分工专业版，试用截止于<b>${endDate} </b> 日；您可提前付费升级 到经济实惠的基础版或功能强大的专业版。`
        : getTeamInfoWithMoney("版本名称") === "免费版"
        ? `<div class='free'>您正在使用的是<b> 蚂蚁分工免费版 </b>，免费版包含任务协作的完整功能，可轻度用
            于日常工作中任务的有序指派和跟进。免费版每月可创建 200 条任务，本月已
            经创建 ${limitNum} 条任务，还可创建${200 - limitNum} 条任务。</div>
        
            <div class='basic'>如您的团队项目和任务数量较多，可升级为经济实惠的<b> 蚂蚁分工基础版 </b>，基础
            版不限使用人数、不限项目数量、不限任务数量。</div>
        
            div>我们更建议您升级到功能强大的<b> 蚂蚁分工专业版 </b>，专业版具有批量任务操作、
            甘特图、多维度数据统计图表等专业功能，助您提高协同工作效率、提升项目。
            管理水平。</div>`
        : ""
    ];
    return (
      <Modal
        visible={true}
        closable={versionShow ? false : true}
        onCancel={() => {
          this.closeModal();
        }}
        width={versionShow ? 850 : 520}
        footer={null}
        mask={true}
        style={versionShow ? {} : { top: 260, height: "400px" }}
        maskClosable={false}
        wrapClassName="authorization"
      >
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        {versionShow ? (
          <div className="imgBox">
            <p>基础版&专业版功能对比</p>
            {versionShow ? (
              <Icon
                type="close"
                onClick={() => {
                  this.setState({ versionShow: false });
                }}
              />
            ) : (
              ""
            )}
            <div className="img">
              <img src="../static/react-static/pcvip/imgs/versionTable1.png?t=2.1" />
              <img src="../static/react-static/pcvip/imgs/versionTable2.jpg?t=2.1" />
            </div>
          </div>
        ) : (
          ""
        )}
        {gifShouquan ? (
          <SpecificationDemo
            closeCallBack={() => {
              this.setState({ gifShouquan: false });
            }}
          />
        ) : (
          ""
        )}

        <div
          className="writeBox"
          style={versionShow ? { display: "none" } : {}}
        >
          <p>
            <span className="name">授权信息</span>
            <span
              onClick={() => {
                this.setState({ versionShow: true });
              }}
              className="version"
            >
              版本介绍
            </span>
          </p>
          <div className="myBorder" />
          <div
            className="text"
            dangerouslySetInnerHTML={{ __html: alertText }}
          />
          <div className="renew">
            {getTeamInfoWithMoney("版本名称") === "专业版" ? (
              <div className="bottomButton">
                {/* <Popover
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
                    提前续费
                  </Button>
                </Popover> */}
                <span
                  className="shouquan"
                  onClick={() => {
                    this.setState({ gifShouquan: true });
                  }}
                >
                  如何管理授权？
                </span>
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
                              margin: "10px 0 0 10px"
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
                    升级规格
                  </Button>
                </Popover>
              </div>
            ) : getTeamInfoWithMoney("版本名称") === "基础版" ? (
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
                            margin: "10px 0 0 10px"
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
                  续费升级
                </Button>
              </Popover>
            ) : getTeamInfoWithMoney("版本名称") === "试用版" ? (
              <div className="bottomButton">
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
                              margin: "10px 0 0 10px"
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
                              margin: "10px 0 0 10px"
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
            ) : getTeamInfoWithMoney("版本名称") === "免费版" ? (
              <div className="bottomButton">
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
                              margin: "10px 0 0 10px"
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
                              margin: "10px 0 0 10px"
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
                    升级基础版
                  </Button>
                </Popover>
                <span
                  onClick={() => {
                    this.closeModal();
                  }}
                  style={{
                    color: "#BDBDBD",
                    cursor: "pointer"
                  }}
                >
                  继续使用免费版
                  <Icon type="right" />
                </span>
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      </Modal>
    );
  }
}
