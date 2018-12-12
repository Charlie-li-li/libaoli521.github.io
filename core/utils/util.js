import { message } from "antd";

// 下拉加载
let flag = true;
export function listScroll(e) {
  let scrollTop = Math.ceil(Math.round(e.target.scrollTop));
  let clientHeight = Math.ceil(Math.round(e.target.clientHeight));
  let scrollHeight = Math.ceil(Math.round(e.target.scrollHeight));
  if (
    scrollTop + clientHeight == scrollHeight ||
    scrollTop + clientHeight == scrollHeight - 1 ||
    scrollTop + clientHeight == scrollHeight + 1
  ) {
    if (flag) {
      flag = false;
      setTimeout(function() {
        flag = true;
      }, 1000);
      return true; // 滑到底了
    }
  } else {
    return false; // 没滑到底
  }
}

// 日期转字符串
export function dateToString(date, type) {
  const year = date.getFullYear();
  const month = add0(date.getMonth() + 1);
  const day = add0(date.getDate());
  const hour = add0(date.getHours());
  const minute = add0(date.getMinutes());
  const second = add0(date.getSeconds());
  if (type === "datetime") {
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  } else if (type === "date") {
    return `${year}-${month}-${day}`;
  }
}
function add0(No) {
  if (No < 10 && No > 0) {
    return "0" + No;
  } else {
    return No;
  }
}

// html5字符串转DOM元素
export function stringToText(string, returnType) {
  if (string) {
    string.replace(/<!--.*-->/g, "");
    let dom = document.createElement("div");
    dom.innerHTML = string;
    clearTag(dom, "style");
    clearTag(dom, "xml");
    clearTag(dom, "script");
    if (returnType === "innerText") {
      let text = dom.innerText;
      return text; //.replace(/\n/g, '');
    } else if (returnType === "img") {
      let imgs = dom.querySelectorAll("img");
      let imgList = [];
      for (let i = 0; i < imgs.length; i++) {
        imgList.push(imgs[i].src);
      }
      return imgList;
    }
  } else {
    if (returnType === "img") {
      return [];
    } else if (returnType === "innerText") {
      return "";
    }
  }
}
export function clearTag(element, tagName) {
  const elems = element.querySelectorAll(tagName);
  Array.from(elems).forEach(e => e.parentNode.removeChild(e));
}

// html5字符串 删除对应的IMG
export function htmlStringDellImgByUrl(string, url) {
  let dom = document.createElement("div");
  dom.innerHTML = string;
  var img = dom.querySelector(`img[src="${url}"]`);
  //dom.removeChild(img);
  const p = img.parentNode;
  p.removeChild(img);
  return dom.innerHTML;
}

// 粘贴图片 返回图片地址
export function pasteImg(e, callback) {
  if (!(e.clipboardData && e.clipboardData.items)) {
    return "";
  }
  for (var i = 0, len = e.clipboardData.items.length; i < len; i++) {
    var item = e.clipboardData.items[i];
    if (item.kind === "file") {
      var f = item.getAsFile();
      var reader = new FileReader();
      reader.onload = function(e) {
        callback(e.target.result);
      };
      reader.readAsDataURL(f);
    }
  }
}

// 设置状态样式
export function stateColor(stateId, className) {
  // 0未完成  1正常完成  2待确认  3未指派  4已终止 8逾期完成 9提前完成
  let classname = "";
  let name = "";
  if (stateId === "0") {
    classname = className + " state_jxz";
    name = "进行中";
  } else if (stateId === "1") {
    classname = className + " state_ywc";
    name = "按时完成";
  } else if (stateId === "2") {
    classname = className + " state_dqr";
    name = "待确认";
  } else if (stateId === "3") {
    classname = className + " state_wzp";
    name = "未指派";
  } else if (stateId === "4") {
    classname = className + " state_yzz";
    name = "已终止";
  } else if (stateId === "7") {
    classname = className + " state_yyq";
    name = "已逾期";
  } else if (stateId === "8") {
    classname = className + " state_yqwc";
    name = "逾期完成";
  } else if (stateId === "9") {
    classname = className + " state_tqwc";
    name = "提前完成";
  }
  return <div className={classname}>{name}</div>;
}

// 设置状态样式
export function stateColorWithTime(stateId, endTime) {
  // 0未完成  1正常完成  2待确认  3未指派  4已终止 7已逾期 8逾期完成 9提前完成
  let color = "";
  if (stateId === "7") {
    color = "#f95a60";
  } else if (
    (stateId === "0" || stateId === "2" || stateId === "3") &&
    endTime
  ) {
    const endDate = new Date(endTime);
    const now = new Date();
    if (endDate.toDateString() === now.toDateString() || endDate < now) {
      color = "#f95a60";
    }
  }
  return color;
}

// 免登 里面处理字符的，原来的复制过来的
export function getQueryString(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  var r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}

// 根据颜色代码返回样式名字 标签组名
export function getTagTitColorByColorCode(colorCode) {
  let code = "";
  switch (colorCode) {
    case "fdbb78":
      code = "tag_tit01_fdbb78";
      break;
    case "f29b76":
      code = "tag_tit02_f29b76";
      break;
    case "75ccff":
      code = "tag_tit03_75ccff";
      break;
    case "89c997":
      code = "tag_tit04_89c997";
      break;
    case "c8c4fc":
      code = "tag_tit05_c8c4fc";
      break;
    case "f5222d":
      code = "tag_tit06_F5222D";
      break;
    case "795548":
      code = "tag_tit07_795548";
      break;
    case "666666":
      code = "tag_tit08_666666";
      break;
    default:
      code = "tag_tit01_fdbb78";
      break;
  }
  return code;
}

// 根据颜色代码返回样式名字   /* type: 2 公共标签，1个人标签 */
export function getTagColorByColorCode(type, colorCode) {
  let code = "";
  switch (colorCode) {
    case "fdbb78":
      code = type === "1" ? "tag_my01_fdbb78" : "tag_all01_fdbb78";
      break;
    case "f29b76":
      code = type === "1" ? "tag_my02_f29b76" : "tag_all02_f29b76";
      break;
    case "75ccff":
      code = type === "1" ? "tag_my03_75ccff" : "tag_all03_75ccff";
      break;
    case "89c997":
      code = type === "1" ? "tag_my04_89c997" : "tag_all04_89c997";
      break;
    case "c8c4fc":
      code = type === "1" ? "tag_my05_c8c4fc" : "tag_all05_c8c4fc";
      break;
    case "f5222d":
      code = type === "1" ? "tag_my06_f5222d" : "tag_all06_f5222d";
      break;
    case "795548":
      code = type === "1" ? "tag_my07_795548" : "tag_all07_795548";
      break;
    case "666666":
      code = type === "1" ? "tag_my08_666666" : "tag_all08_666666";
      break;
    default:
      code = type === "1" ? "tag_my01_fdbb78" : "tag_all01_fdbb78";
      break;
  }
  return code;
}

//返回标签分类颜色
export function getStringTagColor(item) {
  if (item && item.color) {
    return "#" + item.color;
  }
  let color = "#7265e6";
  if (item && item.id) {
    if (item.type != "1") {
      if (item) {
        let pids = item.id.charAt(item.id.length - 1);
        if (isNaN(pids)) {
          color = "#fdbb78";
        } else {
          if (parseInt(pids) > 4) {
            color = "#c8c4fc";
          } else {
            color = "#89c997";
          }
        }
      } else {
        color = "#75ccff";
      }
    }
  }
  return color;
}

// 版本到期判断
import Storage from "./storage";
export function getTeamInfoWithMoney(type) {
  const user = Storage.get("user");
  let data = {
    buyUserCount: 100,
    synUserCount: 100,
    buyDate: "2017-08-30",
    endDate: "2018-08-30",
    remainderDays: 100,
    buyVersion: "MFB",
    ordercreatesource: "",
    orderId: ""
  };
  //   let data = null;
  if (user && user.antIsvCorpSuite) {
    data = user.antIsvCorpSuite;
  } else {
    return "初始化隐藏";
  }
  /*const data = {
        buyUserCount:100,
        synUserCount:910,
        buyDate:'2017-08-30',
        endDate:'2018-08-30',
        remainderDays:10,
        buyVersion:'JCB',
        ordercreatesource:''
    };*/
  let returnTxt = "";
  let returnTxt1 = "";

  /*
   * buyUserCount: 购买人数
   * synUserCount: syn同步人数
   * endDate: 到期日期
   * buyDate: 购买日期
   * remainderDays: 剩余天数
   * buyVersion: 购买版本
   * ordercreatesource: 订单渠道 DRP钉钉订单 非DRP就是运营订单
   */

  switch (type) {
    case "是否钉钉订单":
      returnTxt =
        data.orderId.length === 40 || data.orderId.length === 21 ? false : true;
      break;
    case "购买日期":
      returnTxt = data.buyDate;
      break;
    case "到期日期":
      returnTxt = data.endDate;
      break;
    case "是否超限": // 表示人数是否超限
      if (data.synUserCount > data.buyUserCount) {
        returnTxt = [true, data.buyUserCount, data.synUserCount];
      } else {
        returnTxt = [false, data.buyUserCount, data.synUserCount];
      }
      break;
    case "是否可用": // 表示高级功能是否可用
      switch (data.buyVersion) {
        case "SYB":
          returnTxt = true;
          break;
        case "JCB":
          returnTxt = false;
          break;
        case "ZYB":
          returnTxt = true;
          break;
        case "MFB":
          returnTxt = false;
          break;
      }
      break;
    case "版本名称":
      switch (data.buyVersion) {
        case "SYB":
          returnTxt = "试用版";
          break;
        case "JCB":
          returnTxt = "基础版";
          break;
        case "ZYB":
          returnTxt = "专业版";
          break;
        case "MFB":
          returnTxt = "免费版";
          break;
      }
      break;
    case "剩余天数":
      returnTxt = data.remainderDays;
      break;
    case "专业版提示":
      returnTxt = [
        "专业版功能",
        "图表化项目管理、批量便捷操作、多维度数据统计、WBS文件系统等都为蚂蚁分工专业版功能，同时还有更多高级功能将陆续开放。"
      ];
      break;
    case "续费提示":
      let name = "";
      switch (data.buyVersion) {
        case "SYB":
          name = "试用版";
          break;
        case "JCB":
          name = "基础版";
          break;
        case "ZYB":
          name = "专业版";
          break;
        case "MFB":
          name = "免费版";
          break;
      }
      if (data.buyVersion === "ZYB") {
        returnTxt = [
          "续费升级",
          `您公司当前使用的是&nbsp;<b>蚂蚁分工${name}</b>，授权有效期截止于&nbsp;<b>${
            data.endDate
          }</b>&nbsp;日；最大可授权人数为&nbsp;<b>${
            data.buyUserCount
          }</b>&nbsp;人，目前已授权&nbsp;<b>${data.synUserCount}</b>&nbsp;人。`
        ];
      } else if (data.buyVersion === "JCB") {
        returnTxt = [
          "续费升级",
          `您公司当前使用的是&nbsp;<b>蚂蚁分工${name}</b>，授权有效期截止于&nbsp;<b>${
            data.endDate
          }</b>&nbsp;日；您可以提前续费或升级到功能更为强大的专业版。`
        ];
      } else if (data.buyVersion === "SYB") {
        returnTxt = [
          "续费升级",
          `您公司当前使用的是&nbsp;<b>蚂蚁分工${name}</b>，授权有效期截止于&nbsp;<b>${
            data.endDate
          }</b>&nbsp;日；您可提前付费升级到经济实惠的基础版或功能强大的专业版。`
        ];
      } else if (data.buyVersion === "MFB") {
        returnTxt = [
          "续费升级",
          `<div class='free'>您公司当前使用的是&nbsp;<b>蚂蚁分工免费版</b>，免费版包含任务协作的完整功能，可轻度用 于日常工作中任务的有序指派和跟进。</div>
                    <div class='basics'>如您的团队项目和任务数量较多，可升级为经济实惠的&nbsp;<b>蚂蚁分工基础版</b>，基础版不限使用人数、不限项目数量、不限任务数量。</div>
                     我们更建议您升级到功能强大的&nbsp;<b>蚂蚁分工专业版</b>，专业版具有批量任务操作、甘特图、多维度数据统计图表等专业功能，助您提高协同工作效率、提升项目管理水平。`,
          data.buyVersion
        ];
      }
      break;
    case "人数超限提示":
      returnTxt = [
        "使用人数超限",
        `您公司管理员授权的使用人数已经超出了版本上限，当前版本最大可授权人数为&nbsp;<b>${
          data.buyUserCount
        }</b>&nbsp;人，目前已授权&nbsp;<b>${
          data.synUserCount
        }</b>&nbsp;人。请管理员及时在钉钉后台进行团队的授权管理，或升级到可容纳更多人员的规格。`
      ];
      break;
    case "人数超限提示":
      returnTxt = [
        "使用人数超限",
        `您公司管理员授权的使用人数已经超出了版本上限，当前版本最大可授权人数为&nbsp;<b>${
          data.buyUserCount
        }</b>&nbsp;人，目前已授权&nbsp;<b>${
          data.synUserCount
        }</b>&nbsp;人。请管理员及时在钉钉后台进行团队的授权管理，或升级到可容纳更多人员的规格。`
      ];
      break;
    case "即将到期提示":
      if (data.buyVersion === "ZYB") {
        returnTxt = [
          "专业版即将到期",
          `您公司于&nbsp;<b>${
            data.buyDate
          }</b>&nbsp;购买的蚂蚁分工专业版将在&nbsp;<b>${
            data.remainderDays == 0 ? "明天" : data.remainderDays + "天后"
          }</b>&nbsp;到期，为了不影响您公司的正常使用，请您提前进行续费或购买其他规格。`
        ];
      } else if (data.buyVersion === "JCB") {
        returnTxt = [
          "基础版即将到期",
          `您公司于&nbsp;<b>${
            data.buyDate
          }</b>&nbsp;开始使用的蚂蚁分工基础版将在&nbsp;<b>${
            data.remainderDays == 0 ? "明天" : data.remainderDays + "天后"
          }</b>&nbsp;到期，为了不影响您公司的正常使用，请您提前进行续费或升级到功能更加全面的专业版。
                    `
        ];
      } else if (data.buyVersion === "SYB") {
        returnTxt = [
          "试用即将到期",
          `<div class='free'>您公司于&nbsp;<b>${
            data.buyDate
          }</b>&nbsp;开始试用的蚂蚁分工专业版将在&nbsp;<b>${
            data.remainderDays == 0 ? "明天" : data.remainderDays + "天后"
          }</b>&nbsp;到期，请及时购买升级。</div>
                    <div class='basics'>如您需要轻量化的任务协同，可购买经济实惠的&nbsp;<b>蚂蚁分工基础版</b>，基础版不限使用人数、不限项目数量、不限任务数量。</div>
                    我们建议您升级到功能强大的&nbsp;<b>蚂蚁分工专业版</b>，专业版具有批量任务操作、甘特图、多维度数据统计图表等专业功能，助您提高协同工作效率、量化员工绩效、提升项目管理。
                    `
        ];
      }
      break;
    case "已到期提示":
      if (data.buyVersion === "ZYB") {
        returnTxt = [
          "专业版已到期",
          `您公司于&nbsp;<b>${
            data.buyDate
          }</b>&nbsp;购买的蚂蚁分工专业版已经到期，感谢您的支持和信任，请您及时续费或购买其他规格。`
        ];
      } else if (data.buyVersion === "JCB") {
        returnTxt = [
          "基础版已到期",
          `您公司于&nbsp;<b>${
            data.buyDate
          }</b>&nbsp;购买的蚂蚁分工基础版已经到期，感谢您的支持和信任,请您及时续费或升级到功能更加全面的专业版。`
        ];
      } else if (
        data.buyVersion === "SYB" &&
        (data.orderId.length === 40 || data.orderId.length === 21)
      ) {
        returnTxt = [
          "蚂蚁分工",
          `<div class='free'><b>蚂蚁分工免费版</b>，免费版包含任务协作的完整功能，可轻度用于日常工作中任务的有序之指派和跟进。</div>
                    <div class='basics'><b>蚂蚁分工基础版</b>，经济实惠的基础版在满足任务协作功能的同时，不限使用人数、不限项目数量、不限任务数量。</div>
                    <div><b>蚂蚁分工专业版</b>，功能强大的专业版具有批量任务操作、甘特图、多维度数据统计图表等专业功能，助您提高协同工作效率、量化员工绩效、提升项目管理。</div>
                    `
        ];
      } else if (
        data.buyVersion === "SYB" &&
        (data.orderId.length != 40 || data.orderId.length != 21)
      ) {
        returnTxt = [
          "试用已到期",
          `<div class='free'>您公司于&nbsp;<b>${
            data.buyDate
          }</b>&nbsp;开始体验试用的蚂蚁分工专业版已到期，请及时购买升级。</div>
                    <div class='basics'>如您需要轻量化的任务协同，可购买经济实惠的&nbsp;<b>蚂蚁分工基础版</b>，基础版不限使用人数、不限项目数量、不限任务数量。</div>
                    我们建议您升级到功能强大的&nbsp;<b>蚂蚁分工专业版</b>，专业版具有批量任务操作、甘特图、多维度数据统计图表等专业功能，助您提高协同工作效率、量化员工绩效、提升项目管理。
                    `
        ];
      }
      break;
  }
  return returnTxt;
}

// 只允许输入正整数和浮点数
export function onlyNumber(obj) {
  obj.value = obj.value
    .replace(/[^\d\.]/g, "")
    .replace(".", "a")
    .replace(/\./g, "")
    .replace("a", ".");
  if (obj.value[0] === ".") {
    obj.value = "0" + obj.value;
  }
}

// 网络错误提示
export function isLoadingErr() {
  return "网络错误，请重试";
}

// 本地上传 图片大小和格式限制
export function beforeUpload(file) {
  const isJPG =
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    file.type === "image/bmp" ||
    file.type === "image/gif" ||
    !file.type;
  if (!isJPG) {
    message.error("只能上传图片（jpg,png,bmp,gif）!");
  }
  const isLt2M = file.size / 1024 / 1024 < 2 || !file.size;
  if (!isLt2M) {
    message.error("图片不能大于2M!");
  }
  return isJPG && isLt2M;
}

// 返回中文字符长度
export function getByteLen(val) {
  if (val) {
    var len = 0;
    for (var i = 0; i < val.length; i++) {
      var a = val.charAt(i);
      a.match(/[^\x00-\xff]/gi);
      len += 2;
    }
    return Math.round(len / 2);
  } else {
    return 0;
  }
}
/**
 * @description 用userid判断是否是登陆者自己本人
 * @param {string 必填} userid 需要比较的userid
 * @param {string 必填} corpid 需要比较的corpid
 * @returns {boolean}
 */
export function isOwnAccount(userid = "", corpid = "") {
  const user = Storage.get("user");
  if (user == null || userid == undefined) {
    console.log("未能从storage中获取到user数据");
    return false;
  }
  if (
    !(
      userid != "" &&
      userid == user.userid &&
      corpid != "" &&
      corpid == user.antIsvCorpSuite.corpid
    )
  ) {
    console.log("isNotOwnAccount");
    return true;
  } else {
    console.log("isOwnAccount");
  }
}

/**
 * @description参数是否是其中之一
 * @param {*string} value
 * @param {*array} validList
 * @returns {*boolean}
 */
export function oneOf(value, validList) {
  for (let i = 0; i < validList.length; i++) {
    if (value == validList[i]) {
      return true;
    }
  }
  return false;
}

/**
 *@description 文件大小进行格式化,
 * @param {*文件大小 B} filesize
 * @returns {*文件大小格式化} 如果小于1kb返回<1KB,如果小于1M,向下取整，返回整数KB,如果大于1M返回两位小数，类似1.31M
 */
export function FormatSize(fileSize) {
  if (fileSize < 1024) {
    return "<1KB";
  } else {
    var arrUnit = ["B", "KB", "M", "G", "T", "P"];
    var powerIndex = Math.log2(fileSize) / 10;
    powerIndex = Math.floor(powerIndex);
    // index should in the unit range!
    var len = arrUnit.length;
    powerIndex = powerIndex < len ? powerIndex : len - 1;
    var sizeFormatted = fileSize / Math.pow(2, powerIndex * 10);
    if (powerIndex == "1") {
      sizeFormatted = Math.floor(sizeFormatted);
    } else {
      sizeFormatted = sizeFormatted.toFixed(2);
    }

    return sizeFormatted + " " + arrUnit[powerIndex];
  }
}
// 计算屏幕根字大小
/*export function setHtmlFontSize(){
    //document.documentElement.style.fontSize = window.screen.width / 100 + 'px';
    document.documentElement.style.fontSize = document.documentElement.clientWidth / 100 + 'px';
}*/
