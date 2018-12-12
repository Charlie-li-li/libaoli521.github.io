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
import NullView from "../nullView";
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
    const chart1Datas = [];
    if (this.props.chartData && this.props.chartData.length > 0) {
      this.props.chartData.map((iten, i) => {
        chart1Datas.push(iten);
      });
      this.setState({ chartData: chart1Datas });
    }
  }

  componentDidMount() {
    window.onresize = () => {
      this.charts.resize();
    };
    setTimeout(() => {
      this.chart();
    });
  }

  componentWillReceiveProps(nextProps) {
    const chart1Datas = [];
    if (nextProps.chartData && nextProps.chartData.length > 0) {
      nextProps.chartData.map((iten, i) => {
        chart1Datas.push(iten);
      });
      this.setState({ chartData: chart1Datas }, () => {
        this.chart();
      });
    }
  }

  componentWillUnmount() {}

  chart(isDraw) {
    this.charts = this.props.colorType
      ? echarts.init(
          this.refs.chart2,
          this.props.colorType && this.props.colorType
        )
      : echarts.init(this.refs.chart1);
    if (isDraw === "重绘") {
      this.charts.resize();
      return false;
    }
    const { chartData } = this.state;
    let chartDatas = [];
    if (chartData.length > 0) {
      chartData.map((item, i) => {
        chartDatas.push(item);
      });
    }
    var option = {
      title: {
        x: "center"
      },
      tooltip: {
        trigger: "item",
        formatter: function(params, ticket, callback) {
          var res = "";
          if (!params.data.key3) {
            res =
              `<div style="width:10px;height:10px;display:inline-block;margin-right:10px;border-radius:50%;background:${
                params.color
              }"></div>` +
              `<div style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;word-break:normal;display: inline-block;max-width:200px;line-height:12px;">${
                params.name
              }</div>` +
              " : " +
              params.value +
              `${
                params.name == "已完成"
                  ? "<br/>" +
                    `<div style="padding-left:20px;display:inline-block;">提前:</div>` +
                    `${params.data.key1}`
                  : ""
              }` +
              `${
                params.name == "已终止"
                  ? ""
                  : "<br/>" +
                    `<div style="padding-left:20px;display:inline-block;">逾期:</div>` +
                    `${params.data.key}`
              }` +
              "<br/>";
          } else {
            res =
              `<div style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;word-break:normal;display: inline-block;max-width:200px;line-height:12px;"><div style="width:10px;height:10px;display:inline-block;margin-right:10px;border-radius:50%;background:${
                params.color
              }"></div>${params.name}</div>` +
              " : " +
              params.value +
              "<br/>" +
              `<div style="padding-left:20px;display:inline-block;">待指派:${
                params.data.key
              }</div>` +
              "<br/>" +
              `<div style="padding-left:20px;display:inline-block;">进行中:${
                params.data.key1
              }</div>` +
              "<br/>" +
              `<div style="padding-left:20px;display:inline-block;">待确认:${
                params.data.key2
              }</div>` +
              "<br/>" +
              `<div style="padding-left:20px;display:inline-block;">已完成:${
                params.data.key3
              }</div>` +
              "<br/>" +
              `<div style="padding-left:20px;display:inline-block;">已终止:${
                params.data.key4
              }</div>` +
              "<br/>";
          }
          return res;
        }
      },
      calculable: false,
      series: [
        {
          type: "pie",
          radius: "80%",
          center: ["43%", "50%"],
          label: {
            show: false
          },
          labelLine: {
            normal: {
              show: false
            }
          },
          data: chartDatas,
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)"
            }
          }
        }
      ]
    };
    this.charts.setOption(option);
  }
  render() {
    const { chartData } = this.state;

    return (
      <div className="chartTaskBox">
        <style dangerouslySetInnerHTML={{ __html: stylesheet }} />

        <div className="chart">
          <div className="titleName">
            {this.props.title ? this.props.title : ""}
          </div>
          <div className="chart-area">
            <div className="chart-imgBox">
              <div
                className="chart-img"
                ref={this.props.colorType ? "chart2" : "chart1"}
              />
            </div>
            {this.props.imgListShow ? (
              <div className="chart-textBox">
                <ul>
                  {chartData.length > 0
                    ? chartData.map((item, i) => {
                        return (
                          <li key={i}>
                            <div
                              className="text-color"
                              style={{ background: item.itemStyle.color }}
                            />
                            <div className="text-name">{item.name}</div>
                            <div className="text-num">{item.value}</div>
                          </li>
                        );
                      })
                    : ""}
                </ul>
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    );
  }
}
