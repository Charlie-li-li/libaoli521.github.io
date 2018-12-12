import React from "react";
import stylesheet from "styles/views/code.scss";

export default class QrCode extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div className="code" id="code">
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
        <div style={{ textAlign: "center", paddingTop: 40, width: "100%" }}>
          <img
            style={{ width: "300px", border: "1px solid #eee" }}
            src="./static/react-static/pcvip/imgs/qrcode.jpg"
          />
        </div>
      </div>
    );
  }
}
