import { Upload, Icon, message } from "antd";
import React from "react";
import stylesheet from "styles/components/project/UserInfoSetting/uploadAvatar.scss";
function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
}

function beforeUpload(file) {
  const isJPEG = file.type === "image/jpeg";
  const isPng = file.type === "image/png";
  const isJPG = file.type === "image/jpg";
  if (isJPG || isPng || isJPEG) {
    console.log(file.type);
  } else {
    message.error("请选择正确的文件格式!");
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("图片最大为2MB!");
  }
  return isJPG && isLt2M;
}

export default class Avatar extends React.Component {
  state = {
    loading: false
  };

  handleChange = info => {
    console.log(info);
    if (info.file.status === "uploading") {
      this.setState({ loading: true });
      return;
    }
    if (info.file.status === "done") {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj, imageUrl => {
        this.setState({
          imageUrl,
          loading: false
        });
      });
    }
  };

  render() {
    const uploadButton = (
      <div>
        <Icon type={this.state.loading ? "loading" : "plus"} />
        <div className="ant-upload-text">上传图片</div>
      </div>
    );
    const imageUrl = this.state.imageUrl;
    return (
      <div id="uploadAvatat">
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        <Upload
          name="avatar"
          listType="picture-card"
          className="avatar-uploader"
          showUploadList={false}
          action="//jsonplaceholder.typicode.com/posts/"
          beforeUpload={beforeUpload}
          onChange={this.handleChange}
        >
          {imageUrl ? <img src={imageUrl} alt="avatar" /> : uploadButton}
        </Upload>
      </div>
    );
  }
}
