import React from "react";
import { Select } from "antd";
import stylesheet from "styles/components/project/operatePerm/index.scss";
import { oneOf } from "core/utils/util";
const { OptGroup } = Select;
const Option = Select.Option;

/**
 * @name
 * @description 维护操作权限
 * @callback handleProjectInfoChange (必填)  返回projectCreateInfo
 */
export default class OperatePerm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      maxlength: 50,
      currentLength: 0,
      projectCreateInfo: {},
      textWarning: false,
      createList: [
        {
          value: "1",
          name: "团队所有人"
        },
        {
          value: "2",
          name: "项目负责人"
        },
        {
          value: "3",
          name: "项目内成员"
        },
        {
          value: "4",
          name: "项目管理员"
        }
      ],
      createChecked: ["1"],
      editChecked: ["1"],
      deleteChecked: ["1"],
      editList: [
        {
          value: "1",
          name: "团队所有人"
        },
        {
          value: "2",
          name: "项目负责人"
        },
        {
          value: "3",
          name: "项目内成员"
        },
        {
          value: "4",
          name: "项目管理员"
        },
        {
          value: "5",
          name: "任务创建人"
        },
        {
          value: "6",
          name: "任务指派人"
        },
        {
          value: "7",
          name: "任务负责人"
        },
        {
          value: "8",
          name: "任务确认人"
        }
      ]
    };
  }
  componentWillMount() {
    const { projectCreateInfo } = this.props;
    this.setState({
      projectCreateInfo: projectCreateInfo
    });
  }
  componentDidMount() {}
  //成功回调方法
  handleSelectChange() {
    const {
      projectCreateInfo,
      createChecked,
      editChecked,
      deleteChecked
    } = this.state;
    projectCreateInfo.createChecked = createChecked;
    projectCreateInfo.editChecked = editChecked;
    projectCreateInfo.deleteChecked = deleteChecked;
    this.setState({
      projectCreateInfo: projectCreateInfo
    });
    this.props.handleProjectInfoChange(projectCreateInfo);
  }
  handleCreateChange(value) {
    if (oneOf("1", value)) {
      this.setState({
        createChecked: ["1"]
      });
    } else {
      this.setState({
        createChecked: value
      });
    }
    this.handleSelectChange();
    //     debugger;
    //     this.setState({
    //       createChecked: value
    //     });
  }
  handleEditChange(value) {
    if (oneOf("1", value)) {
      this.setState({
        editChecked: ["1"]
      });
    } else {
      this.setState({
        editChecked: value
      });
    }
    this.handleSelectChange();
  }
  handleDeleteChange(value) {
    if (oneOf("1", value)) {
      this.setState({
        deleteChecked: ["1"]
      });
    } else {
      this.setState({
        deleteChecked: value
      });
    }
    this.handleSelectChange();
  }
  render() {
    const {
      createList,
      editList,
      createChecked,
      editChecked,
      deleteChecked
    } = this.state;
    return (
      <div className="OpearatePerm">
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        <section>
          <div className="top_title">
            <span>项目名称</span>
            <span className="top_title_info">
              谁可以在项目内创建任务，包含任务的导入与复制
            </span>
          </div>
          <div className="top_content">
            <Select
              mode="multiple"
              value={createChecked}
              style={{ width: "100%" }}
              onChange={value => {
                this.handleCreateChange(value);
              }}
            >
              {createList.map((item, index) => {
                return (
                  <Option
                    key={"create" + index}
                    value={item.value}
                    disabled={item.disabled}
                  >
                    {item.name}
                  </Option>
                );
              })}
            </Select>
          </div>
        </section>
        <section>
          <div className="top_title">
            <span>修改任务</span>
            <span className="top_title_info">
              谁可以修改任务，包含任务的重启、移动与终止
            </span>
          </div>
          <div className="top_content">
            <Select
              mode="multiple"
              style={{ width: "100%" }}
              value={editChecked}
              onChange={value => {
                this.handleEditChange(value);
              }}
            >
              {editList.map((item, index) => {
                return (
                  <Option
                    key={"create" + index}
                    value={item.value}
                    disabled={item.disabled}
                  >
                    {item.name}
                  </Option>
                );
              })}
            </Select>
          </div>
        </section>
        <section>
          <div className="top_title">
            <span>删除任务</span>
            <span className="top_title_info">谁可以删除任务</span>
          </div>
          <div className="top_content">
            <Select
              value={deleteChecked}
              style={{ width: "100%" }}
              onChange={value => {
                this.handleDeleteChange(value);
              }}
              mode="multiple"
            >
              <Option value="1">团队所有人</Option>
              <OptGroup label="项目人员">
                <Option value="2" style={{ marginLeft: "10px" }}>
                  项目负责人
                </Option>
                <Option value="3" style={{ marginLeft: "10px" }}>
                  项目管理员
                </Option>
                <Option value="4" style={{ marginLeft: "10px" }}>
                  项目内成员
                </Option>
              </OptGroup>
              <OptGroup label="任务人员">
                <Option value="5" style={{ marginLeft: "10px" }}>
                  任务创建人
                </Option>
                <Option value="6" style={{ marginLeft: "10px" }}>
                  任务指派人
                </Option>
                <Option value="7" style={{ marginLeft: "10px" }}>
                  任务负责人
                </Option>
                <Option value="8" style={{ marginLeft: "10px" }}>
                  任务确认人
                </Option>
              </OptGroup>
            </Select>
          </div>
        </section>
      </div>
    );
  }
}
