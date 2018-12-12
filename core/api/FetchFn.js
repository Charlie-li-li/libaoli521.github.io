import "isomorphic-fetch";
import React from "react";
import { message } from "antd";
export default class FetchFn extends React.Component {
  static fetchFn(opt, cb, error) {
    let type = opt.type;

    const urls = [
      {
        url: "/statistics/downLoadTaskByStatus",
        fileName: "任务分布表"
      },
      {
        url: "/statistics/downLoadTaskByProject",
        fileName: "项目分布表"
      },
      ,
      {
        url: "/statistics/downLoadPendByProject",
        fileName: "项目待办统计表"
      },
      {
        url: "/statistics/downLoadPendByPerson",
        fileName: "人员待办统计表"
      },
      ,
      {
        url: "/statistics/downLoadNumByProject",
        fileName: "项目绩效统计表（按任务数）"
      },
      ,
      {
        url: "/statistics/downLoadNumByPerson",
        fileName: "人员绩效统计表（按任务数）"
      },
      {
        url: "/statistics/downLoadContentByProject",
        fileName: "项目绩效统计表（按绩效值）"
      },
      {
        url: "/statistics/downLoadContentByPerson",
        fileName: "人员绩效统计表（按绩效值）"
      }
    ];
    let option = { method: "get", credentials: "include" };
    option.headers = {
      Accept: "application/json,text/plain, */*",
      "Content-Type": "application/json; charset=utf-8"
    };
    if (type == "post") {
      option.method = "post";
      option.body = JSON.stringify(opt.data);
    }
    if (type == "file") {
      option.method = "post";
      option.body = opt.data;
    }
    let fileName = "";
    fetch(opt.url, option)
      .then(function(response) {
        if (
          !response.ok ||
          (response.url && response.url.indexOf("/antvip/login") != -1)
        ) {
          error(response.status);
        } else {
          let data;
          let urlObj = urls.filter(
            item => item.url.indexOf(response.url.split("ant-cgi")[1]) > -1
          );
          if (response.url && urlObj.length > 0 && urlObj[0].fileName) {
            fileName = urlObj[0].fileName + ".xlsx";
            data = response.blob();
          } else {
            data = response.json();
          }

          return data;
        }
      })
      .then(function(json) {
        if (json.type == "application/x-msdownload") {
          var a = document.createElement("a");
          a.download = fileName;
          a.href = window.URL.createObjectURL(json);
          a.click();
          return;
        }
        if (json && json.success) {
          if (cb) {
            if (json.data) {
              cb(json.data);
            } else {
              cb(true);
            }
          }
        } else {
          if (json) {
            message.info(json.errmsg);
            cb({ err: true }); // 后台报错
          } else {
            cb({ err: true }); // 网络报错
          }
        }
      })
      .catch(function(ex) {
        if (ex.description == "无效字符") {
          error(ex);
        }
        if (opt.type == "get") {
          error(ex);
        } else {
          //message.info('网络好像断喽');
          console.log("通信失败", ex);
        }
      });
  }
}
