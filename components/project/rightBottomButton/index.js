import React from "react";
import { Button } from "antd";

import stylesheet from "styles/components/project/rightBottomButton/index.scss";
export default class RightBottomButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cancelText: "取消",
      okText: "保存",
      delectText: "删除"
    };
  }
  componentWillMount() {
    const { okText } = this.state;
    if (this.props.okTxt !== okText) {
      this.setState({
        okText: this.props.okTxt
      });
    }
  }
  render() {
    const { cancelText, delectText, okText } = this.state;
    return (
      <div className="rightBottomButton">
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        <Button
          type="primary"
          onClick={() => {
            this.props.handleOk();
          }}
        >
          {okText}
        </Button>
        <Button type="danger">{delectText}</Button>
        <Button
          onClick={() => {
            this.props.handleCancel();
          }}
        >
          {cancelText}
        </Button>
      </div>
    );
  }
}
