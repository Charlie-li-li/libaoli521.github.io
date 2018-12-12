import React from "react";
import { Radio, Icon } from "antd";

const RadioGroup = Radio.Group;
import stylesheet from "styles/components/project/personnelAreas/index.scss";
const PersonList = ["负责人", "管理员", "参与成员"];
import dingJS from "core/utils/dingJSApi";
export default class PersonnelAreas extends React.Component {
  constructor(props) {
    super();
    this.state = {
      projectCreateInfo: null
    };
  }
  componentWillMount() {
    this.setState({
      projectCreateInfo: this.props.projectCreateInfo
    });
  }
  onChange = e => {
    const { projectCreateInfo } = this.state;

    projectCreateInfo.opentype = e.target.value;
    this.setState({
      projectCreateInfo: projectCreateInfo
    });
    this.props.handleProjectInfoChange(projectCreateInfo);
  };
  selUser(type, title, multiple) {
    // 0成员 1管理员 2负责人 负责人单选
    title = "请选择" + title;
    let { projectCreateInfo } = this.state;
    let selectUsers = [];
    let oldSelectUserIds = [];
    projectCreateInfo.memberofpros.map((item, i) => {
      if (item.rtype === type && item.delete != "1") {
        selectUsers.push(item.user);
        oldSelectUserIds.push(item.user.userid);
      }
    });
    console.log("本来选中的人:", selectUsers);
    const that = this;
    dingJS.selectUser(
      selectUsers,
      title,
      users => {
        if (users && users.length > 0) {
          if (type == "2") {
            let bb = true;
            projectCreateInfo.memberofpros.map((item, i) => {
              if (item.rtype == "2") {
                if (item.user.userid != users[0].emplId) {
                  item.delete = "1";
                } else {
                  bb = false;
                }
              }
            });
            if (bb) {
              projectCreateInfo.memberofpros.push({
                user: {
                  userid: users[0].emplId,
                  name: users[0].name
                },
                rtype: "2"
              });
            }
            that.setState({ projectCreateInfo: projectCreateInfo });
          } else {
            let selectUserIds = [];
            if (users && users.length > 0) {
              console.log(oldSelectUserIds, "oldSelectUserIds");
              users.map(item => {
                selectUserIds.push(item.emplId);
                if (oldSelectUserIds.indexOf(item.emplId) === -1) {
                  projectCreateInfo.memberofpros.push({
                    user: {
                      userid: item.emplId,
                      name: item.name
                    },
                    rtype: type
                  });
                  console.log(item, "添加的user");
                } else {
                  projectCreateInfo.memberofpros.map(it => {
                    if (
                      it.userid == item.emplId &&
                      type == it.rtype &&
                      it.delete == "1"
                    ) {
                      it.delete = "";
                      console.log(it, "删除后添加的user");
                    }
                  });
                }
              });
            }
            console.log(selectUserIds, "selectUserIds");
            projectCreateInfo.memberofpros.map(item => {
              if (
                selectUserIds.indexOf(item.user.userid) == -1 &&
                type == item.rtype
              ) {
                item.delete = "1";
                console.log(item, "要删除的user");
              }
            });
            that.setState({ projectCreateInfo: projectCreateInfo });
            that.props.handleProjectInfoChange(projectCreateInfo);
          }
        }
      },
      multiple
    );
  }
  editDel(id, rtype) {
    let { projectCreateInfo } = this.state;
    console.log(projectCreateInfo);
    projectCreateInfo.memberofpros.map(item => {
      if (item.user.userid === id && item.rtype === rtype) {
        item.delete = "1";
        return false;
      }
    });
    console.log(projectCreateInfo);
    this.setState({ projectCreateInfo: projectCreateInfo });
    this.props.handleProjectInfoChange(projectCreateInfo);
  }
  render() {
    const { projectCreateInfo } = this.state;
    return (
      <div className="personnelAreas">
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        <section>
          <div className="top_title">
            <span>可见范围</span>
          </div>
          <div className="top_content">
            <RadioGroup
              onChange={this.onChange}
              value={projectCreateInfo.opentype}
              disabled={!projectCreateInfo.jurisdiction}
            >
              <Radio
                value={"1"}
                checked={projectCreateInfo.opentype == "1" ? true : false}
              >
                团队所有人
              </Radio>
              <Radio
                value={"0"}
                checked={projectCreateInfo.opentype == "0" ? true : false}
              >
                仅项目成员
              </Radio>
            </RadioGroup>
          </div>
        </section>
        <section>
          <div className="top_title">
            <span>{PersonList[0]}</span>
          </div>
          <div className="top_content">
            <div className="top_content_person_box">
              <div className="top_content_left" style={{ marginTop: "4px" }}>
                {projectCreateInfo.jurisdiction ? (
                  <i
                    className="iconfont icon-add-personnel"
                    onClick={() => {
                      if (projectCreateInfo.jurisdiction) {
                        this.selUser("2", "负责人", false);
                      }
                    }}
                  />
                ) : (
                  ""
                )}
              </div>
              <div className="top_content_right">
                {projectCreateInfo.memberofpros.map(item => {
                  if (item.rtype === "2" && item.delete !== "1") {
                    return (
                      <div
                        className="person_item_box"
                        key={item.user.userid + "fzr"}
                      >
                        <Icon type="plus-circle" className="person_icon" />
                        <span className="person_name textMore">
                          {" "}
                          {item.user.name}
                        </span>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          </div>
        </section>
        <section>
          <div className="top_title">
            <span>{PersonList[1]}</span>
          </div>
          <div className="top_content">
            <div className="top_content_person_box">
              <div className="top_content_left" style={{ marginTop: "4px" }}>
                <i
                  className="iconfont icon-add-personnel"
                  onClick={() => {
                    if (projectCreateInfo.jurisdiction) {
                      this.selUser("1", "管理员", true);
                    }
                  }}
                />
              </div>

              <div className="top_content_right">
                {projectCreateInfo.memberofpros.map(item => {
                  if (item.rtype === "1" && item.delete !== "1") {
                    return (
                      <div
                        className="person_item_box"
                        key={item.user.userid + "fzr"}
                      >
                        <Icon type="plus-circle" className="person_icon" />
                        <span className="person_name textMore">
                          {" "}
                          {item.user.name}
                        </span>
                        {projectCreateInfo.jurisdiction && (
                          <svg
                            aria-hidden="true"
                            className="person_item_delete"
                            onClick={() => {
                              this.editDel(item.user.userid, item.rtype);
                            }}
                          >
                            <use xlinkHref="#pro-myfg-yichu" />
                          </svg>
                        )}
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          </div>
        </section>
        <section>
          <div className="top_title">
            <span>{PersonList[2]}</span>
          </div>
          <div className="top_content">
            <div className="top_content_person_box">
              {projectCreateInfo.jurisdiction ? (
                <div className="top_content_left" style={{ marginTop: "4px" }}>
                  <i
                    className="iconfont icon-add-personnel"
                    onClick={() => {
                      if (projectCreateInfo.jurisdiction) {
                        this.selUser("0", "成员", true);
                      }
                    }}
                  />
                </div>
              ) : (
                ""
              )}
              <div className="top_content_right">
                {projectCreateInfo.memberofpros.map(item => {
                  if (item.rtype === "0" && item.delete !== "1") {
                    return (
                      <div
                        className="person_item_box"
                        key={item.user.userid + "cy"}
                      >
                        <Icon type="plus-circle" className="person_icon" />
                        <span className="person_name textMore">
                          {" "}
                          {item.user.name}
                        </span>
                        {projectCreateInfo.jurisdiction && (
                          <svg
                            aria-hidden="true"
                            className="person_item_delete"
                            onClick={() => {
                              this.editDel(item.user.userid, item.rtype);
                            }}
                          >
                            <use xlinkHref="#pro-myfg-yichu" />
                          </svg>
                        )}
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}
