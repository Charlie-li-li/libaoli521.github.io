import React from "react";
import {
  Icon,
  Button,
  Select,
  Checkbox,
  Input,
  Cascader,
  message,
  Modal,
  Popover,
  Popconfirm
} from "antd";

import stylesheet from "styles/components/tagManage.scss";
import NullView from "../components/nullView";
import {
  getStringTagColor,
  getTagColorByColorCode,
  getTeamInfoWithMoney
} from "../core/utils/util";
import {
  getLabelList,
  findLabelUser,
  addLabel,
  updateLabel,
  updateLabelParent,
  deleteLabel,
  deleteAllLabel,
  addLabelUser,
  addProjectType,
  getProjectTypeList,
  updateProjectType,
  getPersonLabel,
  addPersonLabel,
  updatePersonLabel,
  deleteAllPersonLabel,
  getTagList
} from "../core/service/tag.service";
import { Spin } from "antd";
const option = Select.option;
const confirm = Modal.confirm;
/*****
 * type:1      //个人标签
 * type:2      //公共标签
 * type:3      //项目分类
 * closedCallBack()     //关闭弹层回调
 * title:''            //弹框标题显示
 * isEdit:        //是否可编辑
 * canEdit:      //是否是管理员
 * *****/
export default class tagManage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      exitShow: false, //添加标签分类是否显示
      addsecondShow: false, //添加二级标签是否显示
      colorList: [],
      tagList: [],
      tagIndex: "-1",
      tagTwoIndex: "0",
      labelIndex: "0",
      selectColor: "75ccff",
      greateLabelName: "",
      greateLabelTwoName: "",
      parentList: [],
      indexList: [],
      pid: "",
      twoEditShow: false,
      oneEditShow: false,
      deleteShow: false,
      projectManageLoading: false,
      publicTagLoading: false,
      personTagLoading: false,
      oneEditIndex: null,
      oneLabelOldName: null,
      twoLabelOldName: null,
      oneLabelEditName: null,
      twoLabelEditName: null,
      oneDeleteIconIndex: null,
      addLabelName: "", //新增分组名
      isEdit: true
    };
  }
  componentWillMount() {
    if (this.props.type == "3") {
      this.getProjectManage();
    } else if (this.props.type == "2") {
      this.getPublicTag();
      // this.getPersonLabel();
    } else if (this.props.type == "1") {
      this.getPersonLabel();
    }
    if (
      getTeamInfoWithMoney("版本名称") === "基础版" ||
      getTeamInfoWithMoney("版本名称") === "免费版"
    ) {
      this.setState({ isEdit: false });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.type == "3") {
      this.getProjectManage();
    } else if (nextProps.type == "2") {
      this.getPublicTag();
      // this.getPersonLabel();
    } else if (nextProps.type == "1") {
      this.getPersonLabel();
    }
  }
  componentWillUnmount() {
    this.setState = (state, callback) => {
      return;
    };
  }

  //获取项目分类
  getProjectManage() {
    this.setState({ projectManageLoading: true });
    getProjectTypeList(data => {
      if (data.err) {
        return false;
      }
      this.setState({
        colorList: data.colorList,
        tagList: data.labels,
        projectManageLoading: false
      });
    });
  }
  //获取公共标签
  getPublicTag() {
    this.setState({ publicTagLoading: true });
    getLabelList(data => {
      if (data.err) {
        return false;
      }
      this.setState({
        colorList: data.colorList,
        tagList: data.labels,
        publicTagLoading: false
      });
    });
  }
  //获取个人标签和任务标签
  getPersonLabel() {
    this.setState({ personTagLoading: true });
    getTagList(data => {
      if (data.err) {
        return false;
      }
      if (data) {
        this.setState({
          // parentList: data.labels,
          // pid: data.parentId,
          personTagLoading: false,
          // colorList: data.colorList,
          tagList: data,
          publicTagLoading: false
        });
      }
    });
  }
  changeColor(e) {
    this.setState({ selectColor: e });
  }
  //编辑标签颜色
  updateLabelColor(e, mainTag) {
    if (mainTag) {
      updateLabel(mainTag.labelname, mainTag.id, e, data => {
        if (data.err) {
          return false;
        }
        if (data) {
          message.success("修改成功");
          if (this.props.type == "3") {
            this.getProjectManage();
          } else if (this.props.type == "2") {
            this.getPublicTag();
          }
          this.setState({
            oneEditIndex: null,
            twoEditIndex: null,
            oneLabelEditName: null,
            twoLabelEditName: null
          });
        }
      });
    }
  }
  //删除标签或删除项目分类
  labelDelete(e, id) {
    e.stopPropagation();
    e.preventDefault();
    deleteLabel(id, data => {
      if (data.err) {
        return false;
      }
      if (data) {
        message.success("操作成功");
        this.setState({ delLabels: [] });
      }
      if (this.props.type == "3") {
        this.getProjectManage();
      } else if (this.props.type == "2") {
        this.getPublicTag();
      } else if (this.props.type == "1") {
        this.getPersonLabel();
      }
    });
  }
  //点击返回一级标签的下标
  labelClick(id) {
    const { tagList } = this.state;
    for (let i = 0; i < tagList.length; i++) {
      let item = tagList[i];
      if (item.id == id) {
        this.setState({ tagIndex: i });
        break;
      }
    }
  }
  //点击二级标签返回二级标签
  labelTwoClick(pid, id, index) {
    const { tagList, indexList, parentList, labelIndex } = this.state;
    var that = this;
    if (this.props.type == "1") {
      for (let i = 0; i < parentList.length; i++) {
        let item = parentList[i];
        if (item.id == id) {
          that.setState({ tagTwoIndex: i });
          if (indexList.indexOf(index) !== -1) {
            indexList.splice(indexList.indexOf(index), 1);
          } else {
            indexList.push(index);
          }
          this.setState({ indexList: indexList });
          break;
        }
      }
    } else {
      for (let j = 0; j < tagList.length; j++) {
        let tag = tagList[j];
        if (tag.id == pid) {
          this.setState({ labelIndex: j });
        }
      }
      for (var i = 0; i < tagList[labelIndex].parentList.length; i++) {
        const label = tagList[labelIndex].parentList[i];
        if (label.id == id) {
          that.setState({ tagTwoIndex: i });
          if (indexList.indexOf(index) !== -1) {
            indexList.splice(indexList.indexOf(index), 1);
          } else {
            indexList.push(index);
          }
          this.setState({ indexList: indexList });
          break;
        }
      }
    }
  }
  // 编辑标签
  labelEdit(id, name, labNo, color) {
    if (name && name.length > 16) {
      message.error("标签长度不能大于16个字符");
      return;
    }
    if (
      (labNo == "one" &&
        (name == this.state.oneLabelOldName || name == null)) ||
      (labNo == "two" && (name == null || name == this.state.twoLabelOldName))
    ) {
      this.setState({
        oneEditIndex: null,
        twoEditIndex: null,
        oneLabelEditName: null,
        twoLabelEditName: null
      });
    } else {
      updateLabel(name, id, color, data => {
        if (data.err) {
          return false;
        }
        if (this.props.type == "3") {
          this.getProjectManage();
        } else if (this.props.type == "2") {
          this.getPublicTag();
        } else if (this.props.type == "1") {
          this.getPersonLabel();
        }
        message.success("修改成功");
        this.setState({
          oneEditIndex: null,
          twoEditIndex: null,
          oneLabelEditName: null,
          twoLabelEditName: null
        });
      });
    }
  }
  //添加标签
  submitLabel(e, tag) {
    e.stopPropagation();
    e.preventDefault();
    const {
      tagList,
      selectColor,
      labelIndex,
      greateLabelName,
      greateLabelTwoName
    } = this.state;

    if (tag == "一级" && greateLabelTwoName && greateLabelTwoName.length > 16) {
      message.error("一级标签长度不能大于16个字符");
      return;
    }
    if (tag == "二级" && greateLabelName && greateLabelName.length > 16) {
      message.error("二级标签长度不能大于16个字符");
      return;
    }

    if (tag == "一级") {
      let name = greateLabelTwoName;
      let data = { labelname: name, color: selectColor };
      if (this.props.type == "3") {
        addProjectType(data, "", res => {
          if (res.err) {
            return false;
          }
          if (res) {
            message.success("添加成功");
            this.setState({ greateLabelTwoName: "" });
          }
          this.getProjectManage();
        });
      } else if (this.props.type == "2") {
        addLabel(data, "", res => {
          if (res.err) {
            return false;
          }
          if (res) {
            message.success("添加成功");
          }
          this.getPublicTag();
        });
      }
      this.setState({ exitShow: false });
    } else if (tag == "二级") {
      let pid = tagList[labelIndex].id;
      let name = greateLabelName;
      let data = { labelname: name, color: "" };
      if (this.props.type == "3") {
        addProjectType(data, pid, res => {
          if (res.err) {
            return false;
          }
          if (res) {
            message.success("添加成功");
          }
          this.getProjectManage();
        });
      } else if (this.props.type == "2") {
        addLabel(data, pid, res => {
          if (res.err) {
            return false;
          }
          if (res) {
            message.success("添加成功");
          }
          this.getPublicTag();
        });
      }
    }
  }
  //添加个人标签
  addPerson(e) {
    const { pid, greateLabelName } = this.state;
    let name = greateLabelName;
    addPersonLabel(name, pid, res => {
      if (res.err) {
        return false;
      }
      if (res) {
        message.success("添加成功");
      }
      this.getPersonLabel();
    });
    this.setState({ addsecondShow: false });
  }
  //添加标签方法
  addLabel(e, tag) {
    if (this.props.type == "1") {
      if (!e.target.value) {
        message.info("请输入标签名称");
        return;
      }
      this.addPerson(e);
    } else {
      this.submitLabel(e, tag);
    }
  }
  //提示弹框
  showConfirm(title, e, id) {
    const that = this;
    confirm({
      title: title,
      onOk() {
        that.labelDelete(e, id);
      },
      onCancel() {}
    });
  }
  render() {
    const {
      colorList,
      selectColor,
      tagList,
      exitShow,
      pid,
      twoLabelEditName,
      tagIndex,
      parentList,
      projectManageLoading,
      publicTagLoading,
      personTagLoading,
      addsecondShow,
      indexList,
      labelIndex,
      tagTwoIndex,
      oneEditIndex,
      greateLabelName,
      greateLabelTwoName,
      twoEditShow,
      oneEditShow,
      addLabelName,
      isEdit
    } = this.state;
    const that = this;
    return (
      <Modal
        title={this.props.title}
        visible={true}
        onCancel={() => {
          this.props.closedCallBack();
        }}
        width={800}
        wrapClassName="tagManageModal"
        footer={null}
      >
        <div
          className="manageBox"
          onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            this.setState({ exitShow: false });
          }}
        >
          <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
          <Spin
            spinning={
              projectManageLoading || publicTagLoading || personTagLoading
            }
          />
          <div className="tagListBox">
            {tagList && tagList.length > 0 ? (
              tagList.map((item, i) => {
                return (
                  <div className="tagList" key={item.id}>
                    <div className="tagTop">
                      {oneEditIndex == i && oneEditShow && false ? (
                        <Input />
                      ) : this.props.canEdit === "1" && isEdit ? (
                        <Popover
                          content={
                            <Input
                              className="addGroupName"
                              defaultValue={item.labelname}
                              onPressEnter={() => {
                                this.labelEdit(
                                  item.id,
                                  this.state.oneLabelEditName,
                                  "one",
                                  item.color
                                );
                                this.setState({ oneEditShow: false });
                              }}
                              onBlur={() => {
                                this.labelEdit(
                                  item.id,
                                  this.state.oneLabelEditName,
                                  "one",
                                  item.color
                                );
                                this.setState({ oneEditShow: false });
                              }}
                              onChange={e => {
                                that.setState({
                                  oneLabelEditName: e.target.value
                                });
                              }}
                            />
                          }
                          trigger="click"
                        >
                          <div
                            className="tagName"
                            onClick={() => {
                              this.setState({
                                oneEditIndex: i,
                                oneEditShow: true
                              });
                            }}
                          >
                            {item.labelname}
                          </div>
                        </Popover>
                      ) : (
                        <div className="tagName">{item.labelname}</div>
                      )}
                      <div className="colorSelect">
                        {this.props.canEdit === "1" && isEdit ? (
                          <Popover
                            content={
                              colorList && colorList.length > 0
                                ? colorList.map((color, value) => {
                                    return (
                                      <span key={color.id}>
                                        <div
                                          className={
                                            "selTagColor "
                                            // +
                                            // getTagColorByColorCode(
                                            //   "1",
                                            //   color.value
                                            // )
                                          }
                                          style={{
                                            backgroundColor: getStringTagColor(
                                              color
                                            )
                                              ? "#" + color.value
                                              : ""
                                          }}
                                          onClick={e => {
                                            this.updateLabelColor(
                                              color.value,
                                              item
                                            );
                                          }}
                                        />
                                      </span>
                                    );
                                  })
                                : ""
                            }
                            placement="topLeft"
                            trigger="click"
                          >
                            <div
                              className="selectCard "
                              style={{
                                backgroundColor: item.color
                                  ? "#" + item.color
                                  : ""
                              }}
                            />
                          </Popover>
                        ) : (
                          <div
                            className="selectCard"
                            style={{
                              backgroundColor: getStringTagColor(item)
                                ? "#" + getStringTagColor(item).substring(1)
                                : ""
                            }}
                          />
                        )}
                      </div>
                      {item.labelname !== "" &&
                      this.props.canEdit === "1" &&
                      isEdit ? (
                        <Popconfirm
                          title="是否删除该分组以及分组下的所有标签？"
                          onConfirm={e => {
                            this.labelDelete(e, item.id);
                          }}
                          okText="删除"
                          cancelText="取消"
                          placement="topRight"
                        >
                          <Icon type="delete" className="delete" />
                        </Popconfirm>
                      ) : (
                        ""
                      )}
                    </div>
                    <div className="tagBottom">
                      <ul>
                        {item.parentList && item.parentList.length > 0
                          ? item.parentList.map((tim, index) => {
                              return (
                                <li key={tim.id}>
                                  {tagIndex == i &&
                                  tagTwoIndex == index &&
                                  twoEditShow &&
                                  isEdit ? (
                                    <Input
                                      className="exitName"
                                      defaultValue={tim.labelname}
                                      autoFocus
                                      onPressEnter={() => {
                                        that.labelEdit(
                                          tim.id,
                                          that.state.twoLabelEditName,
                                          "two",
                                          item.color
                                        );
                                        this.setState({ twoEditShow: false });
                                      }}
                                      placeholder={tim.labelname}
                                      onChange={e => {
                                        that.setState({
                                          twoLabelEditName: e.target.value
                                        });
                                      }}
                                      onBlur={() => {
                                        that.labelEdit(
                                          tim.id,
                                          that.state.twoLabelEditName,
                                          "two",
                                          item.color
                                        );
                                        this.setState({ twoEditShow: false });
                                      }}
                                    />
                                  ) : (
                                    <div style={{ position: "relative" }}>
                                      <span
                                        className={
                                          "labelName textMore "
                                          // +
                                          // getTagColorByColorCode(
                                          //   "2",
                                          //   item.color
                                          // )
                                        }
                                        style={{
                                          color: getStringTagColor(item)
                                            ? "#" + item.color
                                            : "",
                                          border: `1px solid #${item.color}`,
                                          background: `#${item.color + "10"}`
                                        }}
                                        onClick={() => {
                                          this.setState({
                                            tagTwoIndex: index
                                          });
                                          this.labelClick(item.id);
                                          this.labelTwoClick(
                                            item.id,
                                            tim.id,
                                            index
                                          );
                                          {
                                            this.props.canEdit === "1"
                                              ? this.setState({
                                                  twoEditShow: true
                                                })
                                              : "";
                                          }
                                        }}
                                      >
                                        {tim.labelname}
                                      </span>
                                      {this.props.canEdit === "1" && isEdit ? (
                                        <Icon
                                          type="close"
                                          className="tagIcon"
                                          onClick={e => {
                                            this.labelDelete(e, tim.id);
                                          }}
                                        />
                                      ) : (
                                        ""
                                      )}
                                    </div>
                                  )}
                                </li>
                              );
                            })
                          : ""}
                        {labelIndex == i && addsecondShow ? (
                          <li>
                            <Input
                              className="secondInput"
                              onBlur={e => {
                                this.setState({ addsecondShow: false });
                                this.addLabel(e, "二级");
                                this.setState({ greateLabelName: "" });
                              }}
                              value={greateLabelName}
                              autoFocus
                              onPressEnter={e => {
                                this.setState({ addsecondShow: false });
                                this.addLabel(e, "二级");
                                this.setState({ greateLabelName: "" });
                              }}
                              onChange={e => {
                                this.setState({
                                  greateLabelName: e.target.value
                                });
                              }}
                            />
                          </li>
                        ) : (
                          ""
                        )}
                        {this.props.canEdit === "1" && isEdit ? (
                          <li
                            className="addSecond"
                            onClick={() => {
                              this.setState({
                                addsecondShow: true,
                                labelIndex: i
                              });
                            }}
                          >
                            添加新标签
                          </li>
                        ) : (
                          ""
                        )}
                      </ul>
                    </div>
                  </div>
                );
              })
            ) : (
              <NullView />
            )}
          </div>

          <div className="addTagTitle-row">
            <div
              className="addTagTitle"
              onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                this.setState({ exitShow: true });
              }}
            >
              {this.props.canEdit === "1" && isEdit ? (
                <Popover
                  content={
                    <Input
                      placeholder="输入分组名"
                      className="addGroupName"
                      onPressEnter={e => {
                        this.submitLabel(e, "一级");
                      }}
                      value={greateLabelTwoName}
                      onChange={e => {
                        this.setState({ greateLabelTwoName: e.target.value });
                      }}
                    />
                  }
                  trigger="click"
                  visible={exitShow}
                >
                  <span className="add">添加分组</span>
                </Popover>
              ) : isEdit ? (
                <span>仅管理员可以编辑</span>
              ) : (
                <span>专业版可添加分组、标签及修改标签名</span>
              )}
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}
