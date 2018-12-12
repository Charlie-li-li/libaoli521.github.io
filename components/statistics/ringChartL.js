import React from "react";
import { Layout, LocaleProvider, Icon, Spin, DatePicker, Popover } from "antd";
import echarts from "echarts/lib/echarts";
import "echarts/lib/chart/bar";
import "echarts/lib/chart/pie";
import "echarts/lib/chart/line";
import "echarts/lib/component/tooltip";
import "echarts/lib/component/title";
import "echarts/lib/component/legend";
import "moment/locale/zh-cn";
import moment from "moment";

import stylesheet from "styles/components/statistics/ringChart.scss";
const option1 = {
  tooltip: {
    trigger: "item",
    formatter: "{a} <br/>{b} : {c} ({d}%)"
  },
  series: [
    {
      name: "访问来源",
      type: "pie",
      radius: "55%",
      center: ["50%", "60%"],
      data: [
        { value: 335, name: "直接访问" },
        { value: 310, name: "邮件营销" },
        { value: 234, name: "联盟广告" },
        { value: 135, name: "视频广告" },
        { value: 1548, name: "搜索引擎" }
      ],
      itemStyle: {
        emphasis: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: "rgba(0, 0, 0, 0.5)"
        }
      },
      labelLine: {
        show: false
      },
      label: { show: false }
    }
  ]
};
/**
 * (必填) chartData:[{value:'12223',    绘图需要的数值
                     name: "待指派",    
                     itemStyle: {
                          color: "#b2a4f4"   每个区域所代表的颜色
                     },
                     key: '89',        每个区域下分类的数据
                     key1:'45' ,
                     key2:'12' 
                     ...         
                     icon: "circle"},{},...]     //绘图需要传入的数据
 *  (选填) title:""     // 图表的标题
 * （选填）imgListShow:false     //是否需要图例    true:为有图例，  false:没有图例 ，默认：false
 * （选填）colorType:''    //绘图所需echarts颜色库类型   
 */
export default class ringChart extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      chartData: []
    };
  }

  componentWillMount() {
    console.log(this.props);
  }

  componentDidMount() {
    let refname = this.props.refname;
    let myChart = echarts.init(this.refs[refname]); //初始化echarts
    console.log(myChart);
    myChart.setOption({
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b} : {c} ({d}%)"
      },
      series: [
        {
          name: "访问来源",
          type: "pie",
          radius: "85%",
          center: ["50%", "50%"],
          data: [
            { value: 335, name: "直接访问" },
            { value: 310, name: "邮件营销" },
            { value: 234, name: "联盟广告" },
            { value: 135, name: "视频广告" },
            { value: 1548, name: "搜索引擎" }
          ],
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)"
            }
          },
          labelLine: {
            show: false
          },
          label: { show: false }
        }
      ]
    });
  }

  componentWillReceiveProps(nextProps) {}

  componentWillUnmount() {}

  render() {
    const { refname } = this.props;
    return <div ref={refname} style={{ width: "100 %", height: "100%" }} />;
  }
}
