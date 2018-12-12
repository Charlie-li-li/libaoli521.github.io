import React from "react";
import {
  Modal,
  Input,
  Radio,
  Icon,
  message,
  Button,
  Popover,
  Tabs,
  Menu,
  Item
} from "antd";
const { TextArea } = Input;
const TabPane = Tabs.TabPane;
import stylesheet from "styles/components/project/UserInfoSetting/index.scss";
import IconSetting from "components/project/userInfoSetting/iconsetting";
import TagComponent from "components/tag";
/**
 * @name
 * @description 维护人员基本信息
 * @callback handleProjectInfoChange (必填) 删除标签 返回标签列表
 */
export default class UserInfoSetting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      maxlength: 50,
      currentLength: 0,
      projectCreateInfo: {},
      textWarning: false
    };
  }
  componentWillMount() {
    const { projectCreateInfo } = this.props;
    this.setState({
      projectCreateInfo: projectCreateInfo
    });
    console.log(projectCreateInfo);
  }
  componentDidMount() {}
  //成功回调方法
  handleProjectInfoChange(index) {
    const { projectCreateInfo } = this.state;
    let taglist = projectCreateInfo.proSelectedTags;
    let labellist = projectCreateInfo.labelIds;
    taglist.splice(index, 1);
    labellist.splice(index, 1);
    projectCreateInfo.labelIds = labellist;
    projectCreateInfo.proSelectedTags = taglist;
    this.setState({
      projectCreateInfo: projectCreateInfo
    });
    this.props.handleProjectInfoChange(projectCreateInfo);
  }
  //更新项目名称
  changeProjectName(name) {
    const { projectCreateInfo } = this.state;
    let nameLength = name.trim().length;
    if (nameLength >= 40) {
      this.setState({
        currentLength: nameLength,
        textWarning: true
      });
    } else {
      this.setState({
        currentLength: nameLength,
        textWarning: false
      });
    }
    projectCreateInfo.proname = name;
    this.setState({
      projectCreateInfo: projectCreateInfo
    });
    this.props.handleProjectInfoChange(projectCreateInfo);
  }
  //更新项目描述
  changeProjectMark(description) {
    const { projectCreateInfo } = this.state;
    projectCreateInfo.proremark = description;
    this.setState({
      projectCreateInfo: projectCreateInfo
    });
    this.props.handleProjectInfoChange(projectCreateInfo);
  }
  iconcontent() {}
  handleReturnImage() {}
  addLabel() {}
  tagChangeCallBack(val) {
    console.log(val);
    const { projectCreateInfo } = this.state;
    let taglist = [];
    let labellist = [];
    val.map(item => {
      taglist.push({
        id: item.id,
        name: item.labelname,
        type: "2",
        color: item.color
      });

      labellist.push(item.id);
    });
    projectCreateInfo.proSelectedTags = val;
    projectCreateInfo.labelIds = labellist;
    this.setState({ projectCreateInfo: projectCreateInfo });
    this.props.handleProjectInfoChange(projectCreateInfo);
  }
  render() {
    const {
      currentLength,
      maxlength,
      projectCreateInfo,
      textWarning
    } = this.state;
    console.log(projectCreateInfo.jurisdiction);
    return (
      <div className="userInfoSetting">
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        <section>
          <div className="top_title">
            <span>项目名称</span>
            <span className="project_icon">
              项目图标
              <Popover
                placement="bottom"
                content={
                  <IconSetting
                    handleReturnImage={res => {
                      this.handleReturnImage();
                    }}
                  />
                }
                trigger="hover"
              >
                <div className="project_icon_avater">
                  <svg className="project_icon_avater_img" aria-hidden="true">
                    <use xlinkHref={projectCreateInfo.attstr04} />
                  </svg>
                </div>
              </Popover>
            </span>
          </div>
          <div className="top_content">
            <div className="top_content_input_box">
              <Input
                placeholder="精简的项目名称有助于筛选"
                className="top_content_input"
                onChange={e => {
                  this.changeProjectName(e.target.value);
                }}
                maxLength="50"
              />
              {textWarning ? (
                <div className="top_content_input_after">
                  <span>{currentLength}</span>
                  <span>/</span>
                  <span className="maxlength">{maxlength}</span>
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        </section>
        <section>
          <div className="top_title">
            <span>项目简介</span>
          </div>
          <div className="top_content">
            <TextArea
              className="top_content_area"
              placeholder="关于项目的简要介绍"
              onChange={e => {
                this.changeProjectMark(e.target.value);
              }}
            />
          </div>
        </section>
        <section>
          <TagComponent
            isProjectTypes={true}
            poverPosition="topLeft"
            tagSelecteds={projectCreateInfo.proSelectedTags}
            tagChangeCallBack={val => {
              this.tagChangeCallBack(val);
            }}
            canEdit={projectCreateInfo.jurisdiction}
            showTagTilte={true}
          />
        </section>
      </div>
    );
  }
}
// <div className="top_content">
//             {projectCreateInfo &&
//               projectCreateInfo.proSelectedTags &&
//               projectCreateInfo.proSelectedTags.map((item, index) => {
//                 return (
//                   <label
//                     className="top_content_label textMore"
//                     onClick={() => {
//                       this.handleProjectInfoChange(index);
//                     }}
//                     key={item.id}
//                   >
//                     {item.name}
//                   </label>
//                 );
//               })}
//           </div>
