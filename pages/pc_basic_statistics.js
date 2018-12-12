import React from "react";
import stylesheet from "styles/views/basic_statistics.scss";
import { LocaleProvider } from "antd";
import zh_CN from "antd/lib/locale-provider/zh_CN";
import { Layout } from "antd";
import Head from "../components/header";
const { Content } = Layout;
export default class BasicSTatistic extends React.Component {
  constructor(props) {
    super(props);
  }
  //组件初始化时只调用，以后组件更新不调用，整个生命周期只调用一次，此时可以修改state。
  componentWillMount() {}
  //组件渲染之后调用，只调用一次。
  componentDidMount() {}
  //组件初始化时不调用，组件接受新的props时调用。
  componentWillReceiveProps(nextProps) {}
  //   react性能优化非常重要的一环。组件接受新的state或者props时调用，
  //   我们可以设置在此对比前后两个props和state是否相同，
  //   如果相同则返回false阻止更新，
  //   因为相同的属性状态一定会生成相同的dom树，
  //   这样就不需要创造新的dom树和旧的dom树进行diff算法对比，节省大量性能，
  //   尤其是在dom结构复杂的时候
  shouldComponentUpdate(nextProps, nextState) {}
  //组件初始化时不调用，组件更新完成后调用，此时可以获取dom节点。
  componentDidUpdate() {}
  //组件初始化时不调用，只有在组件将要更新时才调用，此时可以修改state
  componentWillUpdata(nextProps, nextState) {}
  //组件将要卸载时调用，一些事件监听和定时器需要在此时清除。
  componentWillUnmount() {}
  goMarket() {
    DingTalkPC.biz.util.openLink({
      url:
        "https://appcenter.dingtalk.com/detail.html?goodsCode=FW_GOODS-1000928758&sig=1dd4423dcc3fd21efb63eaa1207ad963", //要打开链接的地址
      onSuccess: function(result) {
        /**/
      },
      onFail: function() {}
    });
  }
  render() {
    return (
      <LocaleProvider locale={zh_CN}>
        <Layout>
          <Head />
          <Content>
            <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
            <div className="basic-content">
              <div className="basic-content-top">
                <div className="basic-content-top-left" />
                <div
                  className="basic-content-top-right"
                  onClick={() => {
                    this.goMarket();
                  }}
                />
              </div>
              <div className="basic-content-main">
                <img
                  className="basic-content-main-img"
                  src="../static/react-static/pcvip/imgs/content.png"
                />
              </div>
            </div>
          </Content>
        </Layout>
      </LocaleProvider>
    );
  }
}
