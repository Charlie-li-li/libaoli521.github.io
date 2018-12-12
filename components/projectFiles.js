import React from "react";
import { Icon, Input, Spin } from "antd";

import stylesheet from "../styles/components/projectFiles.scss";
import { getFileListByProjectId } from "../core/service/project.service";
import { listScroll, oneOf, FormatSize } from "../core/utils/util";
import dingJS from "../core/utils/dingJSApi";
import NullView from "./nullView";
import moment from "moment";
const Search = Input.Search;
/*
 * projectId:''                  // 项目ID
 */

export default class ProjectFiles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      parentId: "",
      loading: false,
      loadingCount: 0,
      fileBoxList: [],
      fileList: [],
      fileBread: [],
      fileNowPage: 1,
      fileAllPage: 0,
      projectName: ""
    };
  }

  componentWillMount() {
    this.getFileList(this.props.projectId, "", 1);
    this.setState({
      projectName: this.props.projectName
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.projectId !== this.props.projectId) {
      this.setState({
        fileBoxList: [],
        fileList: [],
        fileBread: [],
        fileNowPage: 1,
        fileAllPage: 0,
        parentId: "0"
      });
      this.getFileList(nextProps.projectId, "重来", 1);
    }
    if (nextProps.projectName != this.props.projectName) {
      this.setState({
        projectName: nextProps.projectName
      });
    }
  }

  componentWillUnmount() {
    this.setState = (state, callback) => {
      return;
    };
  }

  getFileList(projectId, parentId, pageNo, searchTxt = "") {
    this.setState({ loading: true });
    if (!projectId) {
      projectId = this.props.projectId;
    }
    if (parentId === "") {
      parentId = this.state.parentId;
      if (parentId === "") {
        parentId = "0";
      }
    } else if (parentId === "重来" || parentId === null) {
      parentId = "0";
    } else {
      this.setState({ parentId: parentId });
    }
    if (!pageNo) {
      pageNo = 1;
    }
    getFileListByProjectId(
      projectId,
      parentId,
      50,
      pageNo,
      res => {
        if (res.err) {
          this.setState({ loadingCount: "err", loading: false });
          return false;
        }

        if (res.treeData.list) {
          if (res.treeData.pageNo === 1) {
            this.setState({ fileBoxList: res.treeData.list });
          } else {
            const { fileBoxList } = this.state;
            res.treeData.list.map(item => {
              if (fileBoxList.filter(val => val.id === item.id).length === 0) {
                fileBoxList.push(item);
              }
            });
            this.setState({ fileBoxList: fileBoxList });
          }
          //this.setState({filesCount:res.treeData.count});
        } else {
          this.setState({ fileBoxList: [] });
        }

        this.setState({
          fileBread:
            res.parentList && res.parentList.length >= 0
              ? res.parentList
              : ["1"],
          fileList: res.fileList ? res.fileList : [],
          fileNowPage: res.treeData ? res.treeData.pageNo : 1,
          fileAllPage: res.treeData ? res.treeData.last : 0
        });

        //this.setState({filesCount:res.fileCount});

        if (this.state.loadingCount === "err") {
          this.setState({ loadingCount: 0 });
        } else {
          this.setState({ loadingCount: this.state.loadingCount + 1 });
        }
        this.setState({ loading: false });
      },
      searchTxt
    );
  }

  onScroll(e) {
    const { fileNowPage, fileAllPage } = this.state;
    const isOnBottom = listScroll(e);
    if (isOnBottom && fileNowPage < fileAllPage) {
      this.getFileList("", "", 1);
    }
  }
  createFileIcon(fileType) {
    //     let filecolor = "rgb(91, 174, 246)";
    let initfileType = new String(fileType);
    if (initfileType.length > 1) {
      initfileType =
        initfileType.substr(0, 1).toUpperCase() + initfileType.substr(1);
    } else {
      initfileType = initfileType.toUpperCase();
    }
    let audioArr = [
      "wav",
      "mp3",
      "au",
      "aif",
      "aiff",
      "ram",
      "wma",
      "mmf",
      "amr",
      "aac",
      "flac"
    ];
    let radioArr = [
      "avi",
      "mov",
      "asf",
      "wmv",
      "navi",
      "3gp",
      "ra",
      "ram",
      "mkv",
      "flv",
      "f4v",
      "rmvb",
      "webm",
      "mp4"
    ];
    let imageArr = [
      "jpg",
      "png",
      "jpeg",
      "bmp",
      "pcx",
      "tif",
      "tga",
      "exif",
      "fpx",
      "svg",
      "cdr",
      "pcd",
      "dxf",
      "ufo",
      "esp",
      "ai",
      "hdri",
      "raw",
      "wmf",
      "flic",
      "emp",
      "ico"
    ];
    let excelArr = ["xlsx"];
    let wordArr = ["doc", "docx"];
    let nomalArr = ["pdf", "ppt", "rar", "psd", "txt", "zip", "word"];
    if (oneOf(fileType, audioArr)) {
      fileType = "audio";
    } else if (oneOf(fileType, radioArr)) {
      fileType = "radio";
    } else if (oneOf(fileType, excelArr)) {
      fileType = "excel";
    } else if (oneOf(fileType, wordArr)) {
      fileType = "word";
    } else if (oneOf(fileType, imageArr)) {
      fileType = "image";
    } else if (oneOf(fileType, nomalArr)) {
    } else {
      fileType = "others";
    }
    console.log(fileType);
    //此处要做判断，看是什么类型
    //     let fileTypeClass = `iconfont icon-file-${fileType} fileIcon`;
    let fileTypeClass = `#icon-file-${fileType}`;
    if (fileType === "others") {
      return (
        <div className="download downloadOthers">
          <div>{initfileType}</div>
        </div>
      );
    } else {
      return (
        <svg className="download" aria-hidden="true">
          <use xlinkHref={fileTypeClass} />
        </svg>
      );
    }
  }
  /**
   * 生成filebreadlist标签组件
   */
  filesBreadList() {
    const { fileBread, projectName } = this.state;
    if (fileBread && fileBread.length > 0) {
      return (
        <div className="filesBread">
          {fileBread.map((item, i) => {
            if (i === fileBread.length - 1) {
              return (
                <span
                  key={item.id}
                  className="textMore"
                  style={{ color: "#BDBDBD" }}
                >
                  {item.taskname}
                </span>
              );
            } else {
              return (
                <label key={item.id}>
                  <span
                    className="textMore"
                    style={{ color: "#424242" }}
                    onClick={() => {
                      this.getFileList("", item.id, 1);
                    }}
                  >
                    {item.taskname}
                  </span>
                  <Icon type="right" />
                </label>
              );
            }
          })}
        </div>
      );
    } else {
      return (
        <div className="filesBread">
          <span className="textMore" style={{ color: "#BDBDBD" }}>
            {projectName}
          </span>
        </div>
      );
    }
  }

  render() {
    const {
      loading,
      fileBoxList,
      fileBread,
      fileList,
      searchTxt,
      loadingCount
    } = this.state;

    return (
      <div className="projectFiles">
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        <div className="filesTop">
          {this.filesBreadList()}
          <div className="filesSearch">
            <Search
              placeholder="文件搜索"
              onSearch={value => {
                this.setState({ parentId: "" });
                this.getFileList("", null, 1, value);
              }}
              style={{ width: 200 }}
            />
          </div>
        </div>
        <div className="filesBottom">
          <div className="table_tit">
            <div className="table_tr">
              <div className="table_td table_td_more">文件名</div>
              <div className="table_td">上传人</div>
              <div className="table_td">文件类型</div>
              <div className="table_td table_data_handle">最后更新</div>
              <div className="table_td">大小</div>
            </div>
          </div>
          {/*<div className="p">
                        共计： {filesCount} 
                    </div>*/}
          <div
            className="table_cont"
            onScroll={e => {
              this.onScroll(e);
            }}
          >
            <Spin spinning={loading} />
            {fileList.map((item, index) => {
              return (
                <div className="table_tr" key={item.id}>
                  <div
                    className="table_td table_td_Load table_td_more textMore"
                    onClick={() => {
                      dingJS.previewImage(item);
                    }}
                  >
                    {/* <Icon type="download" className="download" /> */}
                    {this.createFileIcon(item.fileType)}
                    <span style={{ color: " #424242", fontSize: "16px" }}>
                      {item.fileName}
                    </span>
                  </div>
                  <div className="table_td">{item.createBy.name}</div>
                  <div
                    className="table_td table_td_Load"
                    onClick={() => {
                      dingJS.previewImage(item);
                    }}
                  >
                    {item.type === "0" ? "描述文件" : ""}
                    {item.type === "1" ? "讨论文件" : ""}
                    {item.type === "3" ? "成果文件" : ""}
                    {item.type === "5" ? "过程文件" : ""}
                  </div>

                  <div className="table_td table_data_handle">
                    {/* {moment(new Date(item.updateDate), "YYYY/MM/DD HH:mm")} */}
                    {moment(item.updateDate).format("YYYY/MM/DD HH:mm")}
                  </div>
                  <div className="table_td">{FormatSize(item.fileSize)}</div>
                </div>
              );
            })}
            {fileBoxList.map(item => {
              return (
                <div className="table_tr" key={item.id}>
                  <div className="table_td_more table_td textMore">
                    {/* <Icon type="folder" className="fileIcon" /> */}

                    <svg className="fileIcon" aria-hidden="true">
                      <use xlinkHref="#icon-file-folder" />
                    </svg>

                    <span
                      onClick={() => {
                        this.getFileList("", item.id, 1);
                      }}
                      style={{ color: " #424242", fontSize: "16px" }}
                    >
                      <span
                        style={{
                          margin: "0 3px 0 0",
                          color: " #424242",
                          fontSize: "16px"
                        }}
                      >
                        {item.attstr02 ? item.attstr02 : item.rank}
                      </span>
                      &nbsp;-&nbsp;
                      <span
                        style={{
                          margin: "0 0 0 3px",
                          color: " #424242",
                          fontSize: "16px"
                        }}
                      >
                        {item.taskname}
                      </span>
                    </span>
                  </div>

                  <div className="table_td">---</div>
                  <div className="table_td">---</div>
                  <div className="table_td table_data_handle">
                    {moment(item.updateDate).format("YYYY/MM/DD HH:mm")}
                  </div>
                  <div className="table_td">---</div>
                </div>
              );
            })}
            {fileList.length === 0 &&
              fileBoxList.length === 0 &&
              loadingCount !== "err" && <NullView />}
            {fileList.length === 0 &&
              fileBoxList.length === 0 &&
              loadingCount === "err" && (
                <NullView
                  isLoadingErr={true}
                  restLoadingCallBack={() => {
                    this.getFileList(this.props.projectId, "", 1);
                  }}
                />
              )}
          </div>
        </div>
      </div>
    );
  }
}
