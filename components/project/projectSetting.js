import React from "react";
import {
  Modal,
  Input,
  Radio,
  Icon,
  message,
  Button,
  Popover,
  Menu,
  Item
} from "antd";
import UserInfoSetting from "components/project/userInfoSetting/index";
import PersonelArea from "components/project/personnelAreas/index";
import OperatePerm from "components/project/operatePerm/index";

import stylesheet from "styles/components/project/projectSetting.scss";
import RightBottomButton from "components/project/rightBottomButton/index";
import {
  createProject,
  getProjectCreateInfoById,
  deleteProject
} from "../../core/service/project.service";
// import { getByteLen } from "../core/utils/util";
// import TagComponent from "../components/tag";
// import dingJS from "../core/utils/dingJSApi";
import Storage from "../../core/utils/storage";

const { TextArea } = Input;

const RadioGroup = Radio.Group;
const confirm = Modal.confirm;

/*
 * （选填） projectId:''                                          // 如果没传，就是新创建项目，如果传了，就是项目设置
 * （必填） updateOkCallback({id:'',name:'',icon:'',fzrName:''})  // 提交成功之后回调函数，返回项目数据
 * （必填） closedCallBack()                                      // 关闭回调
 */

export default class projectCreate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      projectId: "",
      MenuList: [
        {
          type: "book",
          name: "基本信息",
          mark: "a"
        },
        {
          type: "book",
          name: "人员范围",
          mark: "b"
        },
        {
          type: "book",
          name: "操作权限",
          mark: "c"
        },
        {
          type: "book",
          name: "默认值",
          mark: "d"
        },
        {
          type: "book",
          name: "绩效系数",
          mark: "e"
        },
        {
          type: "book",
          name: "更多选项",
          mark: "f"
        }
      ],
      // jurisdiction: false, //是否可以删除
      projectCreateInfo: {
        proSelectedTags: [], //标签详情数据
        category: "0",
        id: "",
        memberofpros: [],
        opentype: "0",
        jurisdiction: false, //是否可以删除
        proname: "",
        proremark: "",
        attstr04: "#pro-myfg-1020", //项目图标
        labelIds: [] //[id,id] 项目分类id集合(数组)
      },
      activeNum: "a",
      modalTitleText: "项目设置",
      okTxt: "保存"
    };
  }
  componentWillMount() {
    if (this.props.projectId) {
      this.setState({
        projectId: this.props.projectId,
        modalTitleText: "创建项目",
        okTxt: "保存"
      });

      this.getProjectCreateInfo(this.props.projectId);
    } else {
      const user = Storage.get("user");
      let { projectCreateInfo } = this.state;
      projectCreateInfo.memberofpros = [
        {
          user: user,
          rtype: "2"
        },
        {
          user: user,
          rtype: "1"
        },
        {
          user: user,
          rtype: "0"
        }
      ];
      this.setState({ projectCreateInfo: projectCreateInfo });
      this.setState({
        modalTitleText: "项目设置",
        okTxt: "创建"
      });
    }
  }
  handleOk = e => {
    const { projectCreateInfo } = this.state;
    this.props.updateOkCallback(projectCreateInfo);
  };

  handleCancel = e => {
    console.log(e);
    this.props.closedCallBack();
  };

  getProjectCreateInfo(id) {
    let { projectCreateInfo } = this.state;
    getProjectCreateInfoById(id, data => {
      if (data.err) {
        return false;
      }
      if (data) {
        projectCreateInfo.id = id;
        projectCreateInfo.proname = data.ant.proname;
        projectCreateInfo.proremark = data.ant.proremark;
        if (data.ant.attstr04 === "" || data.ant.attstr04 === undefined) {
          projectCreateInfo.attstr04 = "#pro-myfg-1000";
        } else {
          projectCreateInfo.attstr04 = data.ant.attstr04;
        }
        projectCreateInfo.opentype = data.ant.opentype;
        data.label.map((item, index) => {
          if (item.label) {
            projectCreateInfo.labelIds.push(item.label.id);
          }
        });
        // setUpButton 权限
        if (data.ant.setUpButton) {
          projectCreateInfo.jurisdiction = true;
        } else {
          projectCreateInfo.jurisdiction = false;
        }
        projectCreateInfo.memberofpros = data.users;

        const proSelectedTags = [];
        data.label.map(item => {
          proSelectedTags.push({
            id: item.label.id,
            name: item.label.labelname,
            type: "2",
            color: item.label.color
          });
        });
        projectCreateInfo.proSelectedTags = proSelectedTags;
        this.setState({
          projectCreateInfo: projectCreateInfo
        });
      }
    });
  }
  handleProjectInfoChange(options) {
    console.log(options);
  }
  handleRightContent() {
    const { projectCreateInfo, activeNum } = this.state;

    switch (activeNum) {
      case "a":
        return (
          <UserInfoSetting
            projectCreateInfo={projectCreateInfo}
            handleProjectInfoChange={info => {
              this.handleProjectInfoChange(info);
            }}
          />
        );
        break;
      case "b":
        return (
          <PersonelArea
            projectCreateInfo={projectCreateInfo}
            handleProjectInfoChange={info => {
              this.handleProjectInfoChange(info);
            }}
          />
        );
        break;
      case "c":
        return (
          <OperatePerm
            projectCreateInfo={projectCreateInfo}
            handleProjectInfoChange={info => {
              this.handleProjectInfoChange(info);
            }}
          />
        );
        break;
      default:
        break;
    }
  }
  render() {
    const { MenuList, modalTitleText, okTxt } = this.state;

    return (
      <div>
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        <Modal
          title={modalTitleText}
          className="project-create"
          destroyOnClose="true"
          visible={this.state.visible}
          //   onOk={this.handleOk}
          //   onCancel={this.handleCancel}
          width="600"
          maskClosable="false"
          style={{
            top: "220px"
          }}
          maskStyle={{
            background: "rgba(255,255,255,0)"
          }}
          footer={null}
          closable={false}
        >
          <div className="projectModalContent">
            <Menu style={{ width: 110 }} defaultSelectedKeys={["0"]}>
              {MenuList &&
                MenuList.map((item, index) => {
                  return (
                    <Menu.Item
                      key={index}
                      onClick={e => {
                        this.setState({ activeNum: item.mark });
                      }}
                    >
                      <Icon type={item.type} />
                      {item.name}
                    </Menu.Item>
                  );
                })}
            </Menu>
            <div className="modalcontentRight">
              <div className="rightTop">{this.handleRightContent()}</div>

              <RightBottomButton
                handleCancel={() => {
                  this.handleCancel();
                }}
                handleOk={() => {
                  this.handleOk();
                }}
                okTxt={okTxt}
              />
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}
