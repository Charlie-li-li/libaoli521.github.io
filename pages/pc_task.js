import React from "react";
import withRedux from "next-redux-wrapper";
import { bindActionCreators } from "redux";
import { initStore } from "../store";
import {
  Layout,
  Menu,
  Icon,
  Button,
  Checkbox,
  Select,
  Radio,
  Spin,
  Dropdown,
  DatePicker,
  Input,
  message,
  Popover,
  Modal
} from "antd";
import moment from "moment";
import { LocaleProvider } from "antd";
import zh_CN from "antd/lib/locale-provider/zh_CN";

import stylesheet from "styles/views/task.scss";
import Head from "../components/header";
import TaskList from "../components/taskList";
import TaskDetail from "../components/taskDetails";
import MoreTaskEdit from "../components/moreTaskEdit";
import TagSelect from "../components/tagSelect";
import TaskCreate from "../components/taskCreate";
import * as taskAction from "../core/actions/task";
import {
  getTaskListByCondition,
  getDictsByTypes,
  getLimtTask
} from "../core/service/task.service";
import { getProListByType } from "../core/service/project.service";
import {
  listScroll,
  dateToString,
  getTeamInfoWithMoney,
  onlyNumber,
  isLoadingErr,
  getTagColorByColorCode
} from "../core/utils/util";
import Storage from "../core/utils/storage";
import UserTag from "../components/userTag";
import dingJS from "../core/utils/dingJSApi";
import MoneyEnd from "../components/moneyEnd";
import NullView from "../components/nullView";
import VersionUpdate from "../components/versionUpdate";
import ProjectSelect from "../components/projectSelect";

const { Content } = Layout;
const SubMenu = Menu.SubMenu;
const { Option } = Select;
const { RangePicker } = DatePicker;
const InputGroup = Input.Group;
const Search = Input.Search;
const RadioGroup = Radio.Group;
const dateFormat = "YYYY-MM-DD";
class Task extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      taskSearch: {
        // 任务查询
        group: "evolve",
        labelId: [],
        menuType: "sub1",
        panelId: ["0"],
        projectIds: [],
        search: "",
        planTimeSear: {
          start: "",
          end: ""
        },
        worktimeSear: {
          min: "",
          max: ""
        },
        flowContenSear: {
          min: "",
          max: ""
        },
        planTime: "",
        flowConten: "",
        taskPlanTime: "",
        userResponse: {},
        userFlow: {},
        userCreate: {},
        userAssign: {},
        userSear: {
          type: "0" /* 负责人0 确认人1 关注人2 指派人3 创建人4          */,
          userIds: []
        },
        sortType: "1"
      },
      selectedUsers: [],
      taskSearchStateAct: "0" /* 默认选中未完成 */,
      dicts: {} /* 字典数据 */,
      dictsLoading: false,

      taskListNowPage: 1, // 任务列表
      taskListAllPage: 0,
      taskList: [],
      taskCount: "", //当前任务数
      taskListLoading: false,
      taskListLoadingCount: 0,
      taskListMoreLoading: false,
      taskListHideOpt: [
        "user"
      ] /* 因为默认是选中我负责的，所以任务列表不显示负责人名字 */,
      showOkTask: false,
      showTaskBox: false,
      hideTaskIds: [],

      taskDetailShow: false, // 详情页
      animateClass: "",
      detailPageTaskId: "",
      detailPageProjectId: "",

      projectList: [], // 项目
      projectListNowPage: 1,
      projectListAllPage: 0,
      projectListLoading: false,
      projectListMoreLoading: false,
      projectSelecteds: [],

      tagSelecteds: [], // 标签
      tagComponentShow: false,

      topSearchOptions: ["项目", "标签", "负责人", "截止日期"], // 顶部 自定义选项
      topSearchDownMenuShow: false,

      moreTaskEditShow: false,
      allSearchBoxShow: false,
      checkTaskIds: [],

      taskCreateShow: false,
      taskSelectShow: false,
      moreSelectShow: false,
      allSearchChildShow: false,
      projectSelectShow: false,
      selectedProject: [], //项目

      taskFlowShow: false,
      taskWorkTime: false,
      workMin: "",
      workMax: "",
      flowMin: "",
      flowMax: "",
      value: 1,

      dateShow: false,
      weekShow: false,
      monthShow: false,
      rangePickerShow: false,

      versionAlert: false, // 是否显示专业版提示
      versionUpdateShow: false, // 是否显示版本更新说明
      buyDay15Show: false, // 是否显示15天到期提醒
      taskMax: 0,
      available: true,
      taskFlowBox: [],
      taskWorkBox: [],
      selectedFlow: [],
      selectedWork: [],
      noProjectShow: false,
      noTagShow: false,
      everyFlowShow: false,
      everyWorkShow: false,
      stopPlanTimeShow: false,
      flowIndex: "0",
      workIndex: "0",
      count: 0,
      saveValue: "",
      taskSelectCenShow: false,
      taskPlanTimeSel: false,
      visible: false,
      versionShow: false,
      pickerShow: false,
      focus: false
    };
  }

  componentWillMount() {
    this.getDicts();
    this.getProjectList(1);
  }
  componentWillReceiveProps(nextProps) {}
  componentDidMount() {
    const { taskSearch } = this.state;
    const saveSortValue = Storage.getLocal("saveSort");
    const showOkTask = Storage.getLocal("showOkTask");
    const showTaskBox = Storage.getLocal("showTaskBox");
    taskSearch.sortType = saveSortValue;
    this.setState({
      taskSearch: taskSearch,
      saveValue: saveSortValue,
      count: 0,
      showOkTask:showOkTask,
      showTaskBox:showTaskBox
    });
    this.returnValue(saveSortValue);
    this.getTaskList(1, 30, taskSearch);
    if (getTeamInfoWithMoney("版本名称") === "免费版") {
      this.getLimt();
    }
    const saveFlow = Storage.getLocal("saveTaskFlow");
    const saveWork = Storage.getLocal("saveTaskWork");
    this.setState({ taskFlowBox: saveFlow, taskWorkBox: saveWork });
    dingJS.authDingJsApi();
    this.getSearchOptByStorage();
    const buyDay15AlertDate = Storage.getLocal("buyDay15AlertDate");
    if (
      buyDay15AlertDate !== dateToString(new Date(), "date") &&
      getTeamInfoWithMoney("剩余天数") < 16 &&
      getTeamInfoWithMoney("剩余天数") > -1
    ) {
      this.setState({ buyDay15Show: true });
    } else {
      this.setState({ buyDay15Show: false });
    }

    const versionUpdateShow = Storage.getLocal("versionUpdateShow");
    if (versionUpdateShow == true || versionUpdateShow == false) {
      this.setState({ versionUpdateShow: versionUpdateShow });
    } else {
      this.setState({ versionUpdateShow: true });
    }
  }

  componentWillUnmount() {
    this.setState = (state, callback) => {
      return;
    };
  }
  getLimt() {
    getLimtTask(data => {
      if (data.err) {
        return false;
      }
      this.setState({
        taskMax: data.projectMax,
        available: data.success
      });
    });
  }
  //免费版任务限制
  freeTaskLimit() {
    const { available } = this.state;
    if (getTeamInfoWithMoney("版本名称") === "免费版") {
      this.getLimt();
      if (!available) {
        this.setState({ visible: true });
      }
    }
  }
  // 获取公共字典数据
  getDicts() {
    this.setState({ dictsLoading: true });
    const dictNames =
      "ant_taskinfo_flow,ant_taskinfo_state,ant_taskinfo_coefficienttype,ant_task_home_planTime,ant_task_home_workTime";
    getDictsByTypes(dictNames, data => {
      if (data.err) {
        return false;
      }
      this.setState({ dicts: data });
      this.setState({ dictsLoading: false });
    });
  }

  // 获取缓存的自定义选项
  getSearchOptByStorage() {
    const storageOpt = Storage.getLocal("searchOpt");
    if (storageOpt) {
      this.setState({ topSearchOptions: storageOpt });
    }
  }

  getTaskList(pageNo, pageSize = 30, search) {
    this.setState({ hideTaskIds: [] });

    if (!pageNo) {
      pageNo = 1;
    }
    if (!search) {
      search = this.state.taskSearch;
    }
    if (pageNo === 1) {
      this.setState({ taskListLoading: true });
    } else {
      this.setState({ taskListMoreLoading: true });
    }
    if (search.menuType === "all") {
      search.menuType = "";
    }

    getTaskListByCondition(pageNo, pageSize, search, data => {
      if (data.err) {
        this.setState({ taskListLoadingCount: "err" });
        this.setState({ taskListLoading: false, taskListMoreLoading: false });

        if (pageNo > 1) {
          message.error(isLoadingErr());
        }
        return false;
      }
      if (data.taskinfos) {
        if (data.taskinfos.pageNo === 1) {
          if (data.taskinfos.list) {
            this.setState({ taskList: data.taskinfos.list });
          } else {
            this.setState({ taskList: [] });
          }
        } else {
          let newPageTasks = JSON.parse(JSON.stringify(this.state.taskList));
          if (data.taskinfos.list) {
            data.taskinfos.list.map((item, i) => {
              newPageTasks.push(item);
            });
          }
          this.setState({ taskList: newPageTasks });
        }
        let taskCount = data.taskinfos.count ? data.taskinfos.count : "0";
        this.setState({
          taskListNowPage: data.taskinfos.pageNo,
          taskListAllPage: data.taskinfos.last,
          taskCount: taskCount
        });
      } else {
        this.setState({
          taskList: [],
          taskListNowPage: 1,
          taskListAllPage: 0,
          taskCount: "0"
        });
      }
      this.setState({ taskListLoading: false, taskListMoreLoading: false });
      if (this.state.taskListLoadingCount === "err") {
        this.setState({ taskListLoadingCount: 1 });
      } else {
        this.setState({
          taskListLoadingCount: this.state.taskListLoadingCount + 1
        });
      }
    });
  }

  getProjectList(pageNo) {
    if (pageNo === 1) {
      this.setState({ projectListLoading: true });
    } else {
      this.setState({ projectListMoreLoading: true });
    }
    getProListByType("1", pageNo, data => {
      if (data.err) {
        return false;
      }
      if (data.pageNo === 1) {
        this.setState({ projectList: data.projects });
      } else {
        let projectList = JSON.parse(JSON.stringify(this.state.projectList));
        data.projects.map(item => {
          projectList.push(item);
        });
        this.setState({ projectList: projectList });
      }
      this.setState({
        projectListAllPage: data.last,
        projectListNowPage: data.pageNo
      });
      this.setState({
        projectListLoading: false,
        projectListMoreLoading: false
      });
    });
  }

  projectSelectedOnChange(val) {
    this.setState({ projectSelecteds: val });
    let { taskSearch } = this.state;
    taskSearch.projectIds = val;
    this.setState({ taskSearch: taskSearch });
    if (taskSearch.menuType !== "") {
      this.getTaskList(1, 30, taskSearch);
      this.refs.bottomBox.scrollTop = 0;
    }
  }

  searchAllTask() {
    let { taskSearch } = this.state;
    this.getTaskList(1, 30, taskSearch);
  }

  allChecked(e) {
    let checkTaskIds = [];
    if (e.target.checked) {
      this.state.taskList.map((item, i) => {
        if (
          item.taskinfo.state !== "1" &&
          item.taskinfo.state !== "4" &&
          item.taskinfo.state !== "2"
        ) {
          checkTaskIds.push(item.taskinfo.id);
        }
      });
    }
    this.setState({ checkTaskIds: checkTaskIds });
  }

  selectedUsersOnchange(users) {
    this.setState({ selectedUsers: JSON.parse(JSON.stringify(users)) });
    let { taskSearch } = this.state;
    taskSearch.userSear.userIds = [];
    users.map(item => {
      taskSearch.userSear.userIds.push(item.id);
    });
    this.setState({ taskSearch: taskSearch });
  }
  cancelMoreEdit() {
    this.setState({
      moreTaskEditShow: false,
      moreTaskEditShow: false,
      checkTaskIds: []
    });
  }
  moreTaskEdit() {
    const { moreTaskEditShow } = this.state;
    if (moreTaskEditShow) {
      this.setState({
        moreTaskEditShow: false,
        moreTaskEditShow: false,
        checkTaskIds: []
      });
    } else {
      this.setState({ moreTaskEditShow: true });
    }
  }
  //显示右上内容
  contentChange(val) {
    if (val == "sub1") {
      return "我负责的";
    } else if (val == "my_add") {
      return "我创建的";
    } else if (val == "my_be") {
      return "我指派的";
    } else if (val == "my_succeed") {
      return "我确认的";
    } else if (val == "my_attention") {
      return "我关注的";
    }
  }
  //选人
  selUser(title) {
    let selectedUsers = [];
    let { taskSearch } = this.state;
    if (title === "负责人") {
      selectedUsers.push(taskSearch.userResponse);
    } else if (title === "确认人") {
      selectedUsers.push(taskSearch.userFlow);
    } else if (title === "创建人") {
      selectedUsers.push(taskSearch.userCreate);
    } else if (title === "指派人") {
      selectedUsers.push(taskSearch.userAssign);
    }
    const that = this;
    console.log("钉钉选中的人" + selectedUsers);
    dingJS.selectUser(
      selectedUsers,
      "请选择" + title,
      data => {
        console.log("钉钉返回的人" + data);
        const user = data[0];
        if (title === "负责人") {
          if (user.emplId !== taskSearch.userResponse.userid) {
            taskSearch.userResponse.userid = user.emplId;
            taskSearch.userResponse.name = user.name;
            taskSearch.userResponse.photo = user.avatar;
            that.setState({ taskSearch: taskSearch });
          }
          this.getTaskList(1, 30, taskSearch);
        } else if (title === "确认人") {
          if (user.emplId !== taskSearch.userFlow.userid) {
            taskSearch.userFlow.userid = user.emplId;
            taskSearch.userFlow.name = user.name;
            taskSearch.userFlow.photo = user.avatar;
            that.setState({ taskSearch: taskSearch });
          }
          this.getTaskList(1, 30, taskSearch);
        } else if (title === "创建人") {
          if (user.emplId !== taskSearch.userCreate.userid) {
            taskSearch.userCreate.userid = user.emplId;
            taskSearch.userCreate.name = user.name;
            taskSearch.userCreate.photo = user.avatar;
            that.setState({ taskSearch: taskSearch });
          }
          this.getTaskList(1, 30, taskSearch);
        } else if (title === "指派人") {
          if (user.emplId !== taskSearch.userAssign.userid) {
            taskSearch.userAssign.userid = user.emplId;
            taskSearch.userAssign.name = user.name;
            taskSearch.userAssign.photo = user.avatar;
            that.setState({ taskSearch: taskSearch });
          }
          this.getTaskList(1, 30, taskSearch);
        }
      },
      false
    );
    this.refs.bottomBox.scrollTop = 0;
  }
  deleteUser(title) {
    const { taskSearch } = this.state;
    if (title === "负责人") {
      for (var key in taskSearch.userResponse) {
        delete taskSearch.userResponse[key];
      }
      this.setState({ taskSearch: taskSearch });
    } else if (title === "确认人") {
      for (var key in taskSearch.userFlow) {
        delete taskSearch.userFlow[key];
      }
      this.setState({ taskSearch: taskSearch });
    } else if (title === "创建人") {
      for (var key in taskSearch.userCreate) {
        delete taskSearch.userCreate[key];
      }
      this.setState({ taskSearch: taskSearch });
    } else if (title === "指派人") {
      for (var key in taskSearch.userAssign) {
        delete taskSearch.userAssign[key];
      }
      this.setState({ taskSearch: taskSearch });
    }
    this.getTaskList(1, 30, taskSearch);
    this.refs.bottomBox.scrollTop = 0;
  }

  workSearch(type) {
    const {
      taskSearch,
      workMin,
      workMax,
      flowMin,
      flowMax,
      taskFlowBox,
      taskWorkBox
    } = this.state;
    switch (type) {
      case "flow":
        if (flowMin !== "" && flowMax !== "") {
          if (flowMin <= flowMax) {
            taskSearch.flowContenSear.min = flowMin;
            taskSearch.flowContenSear.max = flowMax;
          } else {
            taskSearch.flowContenSear.min = flowMax;
            taskSearch.flowContenSear.max = flowMin;
          }
          taskSearch.flowConten = "";
          let firstTaskFlow = [];
          if (taskFlowBox && taskFlowBox.length > 0) {
            taskFlowBox.push({
              min: flowMin,
              max: flowMax
            });
          } else {
            firstTaskFlow.push({
              min: flowMin,
              max: flowMax
            });
            this.setState({ taskFlowBox: firstTaskFlow });
          }
          if (taskFlowBox && taskFlowBox.length > 3) {
            let newTaskFlow = taskFlowBox.slice(
              taskFlowBox.length - 3,
              taskFlowBox.length
            );
            this.state.flowIndex = 2;
            this.setState({ taskFlowBox: newTaskFlow });
            Storage.setLocal("saveTaskFlow", newTaskFlow);
          } else if (
            taskFlowBox &&
            taskFlowBox.length > 1 &&
            taskFlowBox.length <= 3
          ) {
            if (taskFlowBox.length === 2) {
              this.state.flowIndex = 1;
            } else {
              this.state.flowIndex = 2;
            }
            Storage.setLocal("saveTaskFlow", taskFlowBox);
          } else {
            this.state.flowIndex = 0;
            Storage.setLocal("saveTaskFlow", firstTaskFlow);
          }
          this.setState({
            taskFlowShow: false,
            everyFlowShow: true,
            taskSearch: taskSearch,
            flowMin: "",
            flowMax: ""
          });
        } else {
          message.info("请输入任务绩效筛选范围！");
        }
        break;
      case "work":
        if (workMin !== "" && workMax !== "") {
          if (workMin <= workMax) {
            taskSearch.worktimeSear.min = workMin;
            taskSearch.worktimeSear.max = workMax;
          } else {
            taskSearch.worktimeSear.min = workMax;
            taskSearch.worktimeSear.max = workMin;
          }
          taskSearch.planTime = "";
          let firstTaskWork = [];
          if (taskWorkBox && taskWorkBox.length > 0) {
            taskWorkBox.push({
              min: workMin,
              max: workMax
            });
          } else {
            firstTaskWork.push({
              min: workMin,
              max: workMax
            });
            this.setState({ taskWorkBox: firstTaskWork });
          }
          if (taskWorkBox && taskWorkBox.length > 3) {
            let newTaskWork = taskWorkBox.slice(
              taskWorkBox.length - 3,
              taskWorkBox.length
            );
            this.state.workIndex = 2;
            this.setState({ taskWorkBox: newTaskWork });
            Storage.setLocal("saveTaskWork", newTaskWork);
          } else if (
            taskWorkBox &&
            taskWorkBox.length > 1 &&
            taskWorkBox.length <= 3
          ) {
            if (taskWorkBox.length === 2) {
              this.state.workIndex = 1;
            } else {
              this.state.workIndex = 2;
            }
            Storage.setLocal("saveTaskWork", taskWorkBox);
          } else {
            this.state.workIndex = 0;
            Storage.setLocal("saveTaskWork", firstTaskWork);
          }
          this.setState({
            taskWorkTime: false,
            everyWorkShow: true,
            taskSearch: taskSearch,
            workMin: "",
            workMax: ""
          });
        } else {
          message.info("请输入计划工期筛选范围");
        }
        break;
    }
    if (
      (flowMin !== "" && flowMax !== "") ||
      (workMin !== "" && workMax !== "")
    ) {
      this.getTaskList(1, 30, taskSearch);
      this.refs.bottomBox.scrollTop = 0;
    }
  }
  flowSearch(type, min, max) {
    this.findIndex(type, min, max);
    const {
      taskFlowBox,
      taskWorkBox,
      taskSearch,
      everyFlowShow,
      everyWorkShow,
      flowIndex,
      workIndex
    } = this.state;
    if (type == "flow") {
      if (taskFlowBox && taskFlowBox.length > 0) {
        taskFlowBox.map((ite, i) => {
          if (ite.min === min && ite.max === max) {
            if (everyFlowShow && flowIndex === i) {
              taskSearch.flowContenSear.min = "";
              taskSearch.flowContenSear.max = "";
              taskSearch.flowConten = "";
              this.setState({ everyFlowShow: false });
            } else {
              if (min <= max) {
                taskSearch.flowContenSear.min = min;
                taskSearch.flowContenSear.max = max;
              } else {
                taskSearch.flowContenSear.min = max;
                taskSearch.flowContenSear.max = min;
              }
              taskSearch.flowConten = "";
              this.setState({ everyFlowShow: true });
            }
            this.setState({ taskSearch: taskSearch });
          }
        });
      }
    } else if (type == "work") {
      if (taskWorkBox && taskWorkBox.length > 0) {
        taskWorkBox.map((tim, i) => {
          if (tim.min === min && tim.max === max) {
            if (everyWorkShow && workIndex === i) {
              taskSearch.worktimeSear.min = "";
              taskSearch.worktimeSear.max = "";
              taskSearch.planTime = "";
              this.setState({ everyWorkShow: false });
            } else {
              if (min <= max) {
                taskSearch.worktimeSear.min = min;
                taskSearch.worktimeSear.max = max;
              } else {
                taskSearch.worktimeSear.min = max;
                taskSearch.worktimeSear.max = min;
              }
              taskSearch.planTime = "";
              this.setState({ everyWorkShow: true });
            }
            this.setState({ taskSearch: taskSearch });
          }
        });
      }
    }
    this.getTaskList(1, 30, taskSearch);
  }
  taskFlow(type, tip, e) {
    const { workMin, workMax, flowMin, flowMax } = this.state;
    if (type == "work") {
      if (tip == "min") {
        this.setState({ workMin: e.target.value });
      } else if (tip == "max") {
        this.setState({ workMax: e.target.value });
      }
    } else if (type == "flow") {
      if (tip == "min") {
        this.setState({ flowMin: e.target.value });
      } else if (tip == "max") {
        this.setState({ flowMax: e.target.value });
      }
    }
  }
  deleteProject(id) {
    const { selectedProject, taskSearch } = this.state;
    if (selectedProject.length > 0) {
      selectedProject.map((item, index) => {
        if (item.id === id) {
          selectedProject.splice(index, 1);
          taskSearch.projectIds.splice(index, 1);
        }
      });
      this.setState({ selectedProject: selectedProject });
    }
    this.getTaskList(1, 30, taskSearch);
    this.refs.bottomBox.scrollTop = 0;
  }
  deleteTag(id) {
    const { tagSelecteds, taskSearch } = this.state;
    if (tagSelecteds.length > 0) {
      tagSelecteds.map((item, index) => {
        if (item.id === id) {
          tagSelecteds.splice(index, 1);
          taskSearch.labelId.splice(index, 1);
        }
      });
      this.setState({ tagSelecteds: tagSelecteds });
    }
    this.getTaskList(1, 30, taskSearch);
    this.refs.bottomBox.scrollTop = 0;
  }
  getNickNameByName(name) {
    let str = name.replace(/[^\u4e00-\u9fa5]/gi, "");
    let nickname = str.substr(str.length - 2);
    return nickname;
  }
  valMenu(val) {
    if (val == "1") {
      this.setState({ allSearchChildShow: false });
    } else if (val == "2") {
      this.setState({ allSearchChildShow: true });
    }
  }
  sortTask(type) {
    const { taskSearch } = this.state;
    if (type === 1) {
      taskSearch.sortType = "1";
    } else if (type === 2) {
      taskSearch.sortType = "2";
    } else if (type === 3) {
      taskSearch.sortType = "3";
    } else if (type === 4) {
      taskSearch.sortType = "4";
    }
    this.setState({ taskSearch: taskSearch, value: type });
    this.getTaskList(1, 30, taskSearch);
    this.refs.bottomBox.scrollTop = 0;
  }
  returnValue(val) {
    switch (val) {
      case "1":
        this.state.value = 1;
        this.setState({ value: this.state.value });
        break;
      case "2":
        this.state.value = 2;
        this.setState({ value: 2 });
        break;
      case "3":
        this.state.value = 3;
        this.setState({ value: 3 });
        break;
      case "4":
        this.state.value = 4;
        this.setState({ value: 4 });
        break;
    }
  }
  saveSort(val) {
    const { taskSearch } = this.state;
    this.props.setTaskSortVal(val);
    Storage.setLocal("saveSort", val);
    message.success("保存成功");
    this.returnValue(val);
  }
  getWeek(date, days) {
    let newTime = date + days * 24 * 60 * 60 * 1000;
    newTime = new Date(newTime);
    let y = newTime.getFullYear();
    let m = newTime.getMonth() + 1;
    let d = newTime.getDate();
    if (m <= 9) {
      m = "0" + m;
    }
    if (d <= 9) {
      d = "0" + d;
    }
    let creatDate = y + "-" + m + "-" + d;
    return creatDate;
  }
  mGetDate() {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = new Date(year, month, 0);
    return day.getDate();
  }
  getMonth(day) {
    let newDate = new Date();
    let year = newDate.getFullYear();
    let month = newDate.getMonth() + 1;
    let days = year + "-" + month + "-" + day;
    return days;
  }
  changeDateSort(type) {
    const { taskSearch, dateShow, weekShow, monthShow } = this.state;
    let newDate = new Date();
    switch (type) {
      case "date":
        let start = dateToString(newDate, "date");
        let end = dateToString(newDate, "date");
        if (dateShow) {
          taskSearch.planTimeSear = {
            start: "",
            end: ""
          };
          this.setState({ dateShow: false });
        } else {
          taskSearch.planTimeSear = {
            start: start,
            end: end
          };
          taskSearch.taskPlanTime = "";
          this.setState({ dateShow: true });
        }
        this.setState({
          weekShow: false,
          monthShow: false,
          rangePickerShow: false,
          taskPlanTimeSel: true,
          taskSearch: taskSearch
        });
        break;
      case "week":
        let newStart = newDate.valueOf();
        let startDate = this.getWeek(newStart, -(newDate.getDay() - 1));
        let endDate = this.getWeek(newStart, 7 - newDate.getDay());
        if (weekShow) {
          taskSearch.planTimeSear = {
            start: "",
            end: ""
          };
          this.setState({ weekShow: false });
        } else {
          taskSearch.planTimeSear = {
            start: startDate,
            end: endDate
          };
          taskSearch.taskPlanTime = "";
          this.setState({ weekShow: true });
        }
        this.setState({
          dateShow: false,
          monthShow: false,
          rangePickerShow: false,
          taskPlanTimeSel: true,
          taskSearch: taskSearch
        });
        break;
      case "month":
        let startMonth = this.getMonth(1);
        let endMonth = this.getMonth(this.mGetDate());
        if (monthShow) {
          taskSearch.planTimeSear = {
            start: "",
            end: ""
          };
          this.setState({ monthShow: false });
        } else {
          taskSearch.planTimeSear = {
            start: startMonth,
            end: endMonth
          };
          taskSearch.taskPlanTime = "";
          this.setState({ monthShow: true });
        }
        this.setState({
          dateShow: false,
          weekShow: false,
          rangePickerShow: false,
          taskPlanTimeSel: true,
          taskSearch: taskSearch
        });
        break;
    }
    this.getTaskList(1, 30, taskSearch);
  }
  clearSortType(type) {
    const { taskSearch } = this.state;
    let min = "";
    let max = "";
    switch (type) {
      case "stopDate":
        taskSearch.planTimeSear = {
          start: "",
          end: ""
        };
        if (taskSearch.taskPlanTime == "5") {
          taskSearch.taskPlanTime = "";
        } else {
          taskSearch.taskPlanTime = "5";
        }
        this.setState({
          dateShow: false,
          weekShow: false,
          monthShow: false,
          taskSearch: taskSearch
        });
        this.getTaskList(1, 30, taskSearch);
        break;
      case "taskFlow":
        taskSearch.flowContenSear = {
          min: "",
          max: ""
        };
        if (taskSearch.flowConten == "4") {
          taskSearch.flowConten = "";
        } else {
          taskSearch.flowConten = "4";
        }
        this.setState({
          taskSearch: taskSearch,
          flowMin: min,
          flowMax: max,
          everyFlowShow: false
        });
        this.getTaskList(1, 30, taskSearch);
        break;
      case "planTime":
        taskSearch.worktimeSear = {
          min: "",
          max: ""
        };
        if (taskSearch.planTime == "4") {
          taskSearch.planTime = "";
        } else {
          taskSearch.planTime = "4";
        }
        this.setState({
          taskSearch: taskSearch,
          workMax: max,
          workMin: min,
          everyWorkShow: false
        });
        this.getTaskList(1, 30, taskSearch);
        break;
    }
  }
  searchSort() {
    const { allSearchBoxShow } = this.state;
    if (allSearchBoxShow) {
      this.setState({ allSearchBoxShow: false });
    } else {
      this.setState({ allSearchBoxShow: true });
    }
  }
  findIndex(type, min, max) {
    const { taskFlowBox, taskWorkBox } = this.state;
    if (type == "flow") {
      for (let i = 0; i < taskFlowBox.length; i++) {
        let item = taskFlowBox[i];
        if (item.min == min && item.max == max) {
          this.setState({ flowIndex: i });
          break;
        }
      }
    } else if (type == "work") {
      for (let i = 0; i < taskWorkBox.length; i++) {
        let item = taskWorkBox[i];
        if (item.min == min && item.max == max) {
          this.setState({ workIndex: i });
          break;
        }
      }
    }
  }
  clickButton() {
    const { count } = this.state;
    this.setState({ count: count + 1 });
  }
  taskSelectCen() {
    const { taskSelectCenShow } = this.state;
    if (taskSelectCenShow) {
      this.setState({ taskSelectCenShow: false });
    } else {
      this.setState({ taskSelectCenShow: true });
    }
  }
  hideCompleted(e) {
    Storage.setLocal("showOkTask", e.target.checked);
    this.setState({ showOkTask: e.target.checked });
  }
  hideTaskBag(e) {
    Storage.setLocal("showTaskBox", e.target.checked);
    this.setState({ showTaskBox: e.target.checked });
  }
  // 右边上部分 筛选内容渲染
  right_top_render() {
    const {
      taskSearch,
      taskList,
      taskCount,
      selectedProject,
      taskFlowShow,
      taskWorkTime,
      allSearchBoxShow,
      allSearchChildShow,
      moreSelectShow,
      showOkTask,
      showTaskBox,
      moreTaskEditShow,
      topSearchDownMenuShow,
      checkTaskIds,
      selectedUsers,
      projectList,
      projectSelecteds,
      dictsLoading,
      projectListMoreLoading,
      projectListLoading,
      taskSearchStateAct,
      projectListAllPage,
      projectListNowPage,
      tagSelecteds,
      topSearchOptions,
      dicts,
      workMin,
      workMax,
      flowMin,
      flowMax,
      sortType,
      taskPlanTimeSel,
      saveValue,
      dateShow,
      weekShow,
      monthShow,
      rangePickerShow,
      taskSelectCenShow,
      pickerShow,
      taskFlowBox,
      taskWorkBox,
      projectSelectShow,
      noProjectShow,
      noTagShow,
      tagComponentShow,
      everyFlowShow,
      everyWorkShow,
      flowIndex,
      workIndex,
      stopPlanTimeShow,
      count
    } = this.state;
    const userType = (
      <Menu>
        <Menu.Item>
          <a
            onClick={() => {
              this.valChange("userType", "0");
            }}
          >
            负责人
          </a>
        </Menu.Item>
        <Menu.Item>
          <a
            onClick={() => {
              this.valChange("userType", "1");
            }}
          >
            确认人
          </a>
        </Menu.Item>
        {/*
        <Menu.Item>
          <a onClick={()=>{this.valChange('userType','2')}}>关注人</a>
        </Menu.Item>
        */}
        <Menu.Item>
          <a
            onClick={() => {
              this.valChange("userType", "3");
            }}
          >
            指派人
          </a>
        </Menu.Item>
        <Menu.Item>
          <a
            onClick={() => {
              this.valChange("userType", "4");
            }}
          >
            创建人
          </a>
        </Menu.Item>
      </Menu>
    );
    let actUserType = "请选择";
    if (taskSearch.userSear.type === "0") {
      actUserType = "负责人";
    } else if (taskSearch.userSear.type === "1") {
      actUserType = "确认人";
    } else if (taskSearch.userSear.type === "3") {
      actUserType = "指派人";
    } else if (taskSearch.userSear.type === "4") {
      actUserType = "创建人";
    } else {
      actUserType = "负责人";
    }
    const groupOpt = (
      <Menu>
        <Menu.Item key="evolve">
          <a
            onClick={() => {
              this.valChange("searGroupOpt", "evolve");
            }}
          >
            任务进展
          </a>
        </Menu.Item>
        <Menu.Item key="planTime">
          <a
            onClick={() => {
              this.valChange("searGroupOpt", "planTime");
            }}
          >
            截止日期
          </a>
        </Menu.Item>
        <Menu.Item key="coefficienttype">
          <a
            onClick={() => {
              this.valChange("searGroupOpt", "coefficienttype");
            }}
          >
            优先级
          </a>
        </Menu.Item>
        <Menu.Item key="flowConten">
          <a
            onClick={() => {
              this.valChange("searGroupOpt", "flowConten");
            }}
          >
            任务绩效
          </a>
        </Menu.Item>
        <Menu.Item key="worktime">
          <a
            onClick={() => {
              this.valChange("searGroupOpt", "worktime");
            }}
          >
            计划工期
          </a>
        </Menu.Item>
      </Menu>
    );
    let groupActName = "";
    let groupOptDict = [];
    switch (taskSearch.group) {
      case "evolve":
        groupActName = "任务进展";
        if (dicts.antTaskinfoStateList) {
          groupOptDict = JSON.parse(JSON.stringify(dicts.antTaskinfoStateList));
          /*if (showOkTask) {
            groupOptDict = groupOptDict.filter(val => (val.value !== '1' && val.value !== '4'));
          }*/
          if (
            taskSearch.menuType === "sub1" ||
            taskSearch.menuType === "my_be"
          ) {
            groupOptDict = groupOptDict.filter(val => val.value !== "3");
          }
        }
        break;
      case "planTime":
        groupActName = "截止日期";
        if (dicts.antTaskinfoStateList) {
          groupOptDict = JSON.parse(
            JSON.stringify(dicts.antTaskHomePlantimeList)
          );
        }
        break;
      case "coefficienttype":
        groupActName = "优先级";
        if (dicts.antTaskinfoStateList) {
          groupOptDict = JSON.parse(
            JSON.stringify(dicts.antTaskinfoCoefficienttypeList)
          );
        }
        break;
      case "flowConten":
        groupActName = "任务绩效";
        if (dicts.antTaskinfoStateList) {
          groupOptDict = JSON.parse(JSON.stringify(dicts.antTaskinfoFlowList));
        }
        break;
      case "worktime":
        groupActName = "计划工期";
        if (dicts.antTaskinfoStateList) {
          groupOptDict = JSON.parse(
            JSON.stringify(dicts.antTaskHomeWorktimeList)
          );
        }
        break;
    }
    groupOptDict.unshift({ id: "groupOptAll", value: "all", label: "全部" });
    const initTopSearchOpts = [
      "任务绩效",
      "计划工期",
      "确认人",
      "创建人",
      "指派人"
    ]; // '项目', '标签','负责人','截止日期'
    return (
      <div
        className="topBox"
        onClick={e => {
          e.preventDefault();
          this.setState({
            taskDetailShow: false,
            taskFlowShow: false,
            taskWorkTime: false
          });
        }}
      >
        <div
          className="titRow"
          onClick={() => {
            this.setState({
              allSearchBoxShow: false,
              taskFlowShow: false,
              taskWorkTime: false
            });
          }}
        >
          <h1>
            <span>
              {taskSearch.menuType === ""
                ? "全部任务"
                : this.contentChange(taskSearch.menuType)}
            </span>
            {taskSearch.search && (
              <span
                className="searchClose"
                onClick={() => {
                  let { taskSearch } = this.state;
                  taskSearch.search = "";
                  this.setState({ taskSearch: taskSearch });
                  this.getTaskList(1, "", taskSearch);
                }}
              >
                取消
              </span>
            )}
            {/* <Search
              placeholder="任务搜索"
              value={taskSearch.search}
              onFocus={() => {
                this.setState({ focus: true });
                this.cancelMoreEdit();
              }}
              onBlur={() => {
                this.setState({ focus: false });
              }}
              onChange={e => {
                let { taskSearch } = this.state;
                taskSearch.search = e.target.value;
                this.setState({ taskSearch: taskSearch });
              }}
              onSearch={value => {
                this.getTaskList(1, "", taskSearch);
              }}
              style={
                this.state.focus
                  ? { width: 300, transition: "width .35s linear" }
                  : { width: 200, transition: "width .35s linear" }
              }
            /> */}
            <Input
              // prefix='a'
              style={
                this.state.focus
                  ? {
                      width: 300,
                      transition: "width .35s linear",
                      float: "right"
                    }
                  : {
                      width: 200,
                      transition: "width .35s linear",
                      float: "right"
                    }
              }
              prefix={
                <i
                  className="iconfont icon-search"
                  style={{
                    fontSize: "16px",
                    color: "#08c",
                    height: "16px",
                    display: "flex",
                    color: "#bdbdbd",
                    lineHeight: "24px"
                  }}
                />
              }
              placeholder="任务搜索"
              value={taskSearch.search}
              onFocus={() => {
                this.setState({ focus: true });
                this.cancelMoreEdit();
              }}
              onBlur={() => {
                this.setState({ focus: false });
              }}
              onChange={e => {
                let { taskSearch } = this.state;
                taskSearch.search = e.target.value;
                this.setState({ taskSearch: taskSearch });
              }}
              onPressEnter={e => {
                this.getTaskList(1, "", taskSearch);
              }}
            />
            <div style={{ clear: "both" }} />
          </h1>
        </div>
        <div
          className={
            count == 0
              ? "noTaskSelect"
              : allSearchBoxShow
              ? "taskSelect animated_05s fadeInRightBig"
              : "taskSelect animated_Out fadeInRightBigOut"
          }
          onClick={e => {
            e.stopPropagation();
            this.setState({ taskSelectCenShow: false, pickerShow: true });
          }}
        >
          <div className="topMenu">
            <div
              className={allSearchChildShow ? "childMenu" : "childMenu blue"}
              onClick={() => {
                this.valMenu("1");
              }}
            >
              <span>筛选</span>
              <em />
            </div>
            <div
              className={allSearchChildShow ? "blue childMenu" : "childMenu"}
              onClick={() => {
                this.valMenu("2");
              }}
            >
              <span>排序</span>
              <em />
            </div>
            <div className="close">
              <Icon
                type="close"
                className="icon-close"
                onClick={() => {
                  this.setState({ allSearchBoxShow: false });
                }}
              />
            </div>
          </div>
          {allSearchChildShow ? (
            <div className="selectContent">
              <div className="sortBox">
                <RadioGroup
                  onChange={e => {
                    this.sortTask(e.target.value);
                  }}
                  value={this.state.value}
                >
                  <Radio value={1}>按更新时间最近</Radio>
                  {/* <Radio value={2}>按截止时间最近</Radio> */}
                  <Radio value={3}>按创建时间最早</Radio>
                  <Radio value={4}>按创建时间最晚</Radio>
                </RadioGroup>
              </div>
              <div className="sortBottom">
                <i className="iconfont icon-save" />
                <span
                  onClick={() => {
                    this.saveSort(taskSearch.sortType);
                  }}
                >
                  保存为默认排序
                </span>
              </div>
            </div>
          ) : (
            <div
              className="selectContent"
              onClick={() => {
                this.setState({ moreSelectShow: false });
              }}
            >
              <div className="allSort">
                {topSearchOptions.indexOf("项目") !== -1 ||
                taskSearch.menuType !== "" ? (
                  <div className="selectType">
                    <h3>
                      项目
                      {selectedProject && selectedProject.length > 0 ? (
                        <div>
                          <Icon
                            type="plus"
                            onClick={() => {
                              this.setState({ projectSelectShow: true });
                            }}
                          />
                        </div>
                      ) : (
                        ""
                      )}
                    </h3>
                    {selectedProject && selectedProject.length > 0 ? (
                      <div className="projectBox">
                        {selectedProject.map((item, i) => {
                          return (
                            <div key={item.id} className="textMore">
                              {item.name}
                              <div
                                className="projectCen"
                                onClick={() => {
                                  this.deleteProject(item.id);
                                }}
                              >
                                点击移除
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div
                        className="null"
                        onClick={() => {
                          this.setState({ projectSelectShow: true });
                        }}
                        onMouseOver={() => {
                          this.setState({ noProjectShow: true });
                        }}
                        onMouseOut={() => {
                          this.setState({ noProjectShow: false });
                        }}
                      >
                        {projectSelectShow || noProjectShow ? (
                          <span>选择项目</span>
                        ) : (
                          <span>未选项目</span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  ""
                )}
                {topSearchOptions.indexOf("标签") !== -1 ||
                taskSearch.menuType !== "" ? (
                  <div className="selectType">
                    <h3>
                      标签
                      {tagSelecteds && tagSelecteds.length > 0 ? (
                        <div>
                          <Icon
                            type="plus"
                            onClick={() => {
                              this.setState({ tagComponentShow: true });
                            }}
                          />
                        </div>
                      ) : (
                        ""
                      )}
                    </h3>
                    {tagSelecteds.length > 0 ? (
                      <div className="tagBox">
                        <ul>
                          {tagSelecteds.map((item, i) => {
                            return (
                              <li
                                className={
                                  "textMore " +
                                  getTagColorByColorCode("1", item.color)
                                }
                                key={item.id}
                              >
                                <span className="labelname">
                                  {item.labelname}
                                </span>
                                <span
                                  className="labelCen"
                                  onClick={() => {
                                    this.deleteTag(item.id);
                                  }}
                                >
                                  点击移除
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ) : (
                      <div
                        className="null"
                        onClick={() => {
                          this.setState({ tagComponentShow: true });
                        }}
                        onMouseOver={() => {
                          this.setState({ noTagShow: true });
                        }}
                        onMouseOut={() => {
                          this.setState({ noTagShow: false });
                        }}
                      >
                        {tagComponentShow || noTagShow ? (
                          <span>选择标签</span>
                        ) : (
                          <span>未选标签</span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  ""
                )}
                {(topSearchOptions.indexOf("负责人") !== -1 ||
                  taskSearch.menuType === "") &&
                stopPlanTimeShow ? (
                  <div className="selectType">
                    <h3>负责人</h3>
                    {taskSearch.userResponse.userid ? (
                      <div className="userBox">
                        <div className="userSel">
                          <div className="userName">
                            {taskSearch.userResponse.photo !== "" ? (
                              <img src={taskSearch.userResponse.photo} />
                            ) : (
                              <font>
                                {this.getNickNameByName(
                                  taskSearch.userResponse.name
                                )}
                              </font>
                            )}
                          </div>
                          <span>
                            {taskSearch.userResponse.name.slice(0, 3)}
                          </span>
                          <div
                            className="userCen"
                            onClick={() => {
                              this.deleteUser("负责人");
                            }}
                          >
                            点击移除
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="null"
                        onClick={() => {
                          this.selUser("负责人");
                        }}
                      >
                        <span className="choose">选择负责人</span>
                        <span className="noChoose">未选负责人</span>
                      </div>
                    )}
                  </div>
                ) : (
                  ""
                )}
                {(topSearchOptions.indexOf("截止日期") !== -1 ||
                  taskSearch.menuType === "") &&
                stopPlanTimeShow ? (
                  <div className="selectType">
                    <h3>截止日期</h3>
                    <div className="selectedList">
                      <ul>
                        <li
                          onClick={() => {
                            this.clearSortType("stopDate");
                          }}
                          style={{
                            cursor: "pointer",
                            height: "30px",
                            lineHeight: "30px"
                          }}
                        >
                          未设置
                          {taskSearch.planTimeSear.start === "" &&
                          taskSearch.planTimeSear.end === "" &&
                          taskSearch.taskPlanTime === "5" ? (
                            <Icon type="check" className="check" />
                          ) : (
                            ""
                          )}
                        </li>
                        <li
                          onClick={() => {
                            this.changeDateSort("date");
                          }}
                          style={{
                            cursor: "pointer",
                            height: "30px",
                            lineHeight: "30px"
                          }}
                        >
                          截止今天
                          {dateShow && taskPlanTimeSel ? (
                            <Icon type="check" className="check" />
                          ) : (
                            ""
                          )}
                        </li>
                        <li
                          onClick={() => {
                            this.changeDateSort("week");
                          }}
                          style={{
                            cursor: "pointer",
                            height: "30px",
                            lineHeight: "30px"
                          }}
                        >
                          截止本周
                          {weekShow && taskPlanTimeSel ? (
                            <Icon type="check" className="check" />
                          ) : (
                            ""
                          )}
                        </li>
                        <li
                          onClick={() => {
                            this.changeDateSort("month");
                          }}
                          style={{
                            cursor: "pointer",
                            height: "30px",
                            lineHeight: "30px"
                          }}
                        >
                          截止本月
                          {monthShow && taskPlanTimeSel ? (
                            <Icon type="check" className="check" />
                          ) : (
                            ""
                          )}
                        </li>
                        <li className="last">自定义</li>
                      </ul>
                    </div>
                    <div
                      className="dateBox"
                      style={
                        pickerShow
                          ? { color: "transparent" }
                          : { color: "rgba(0,0,0,.65)" }
                      }
                      onClick={e => {
                        e.stopPropagation();
                        this.setState({
                          rangePickerShow: true,
                          taskSelectCenShow: true
                        });
                      }}
                    >
                      {(taskSearch.planTimeSear.start ||
                        taskSearch.planTimeSear.end) &&
                      rangePickerShow ? (
                        <RangePicker
                          value={[
                            moment(taskSearch.planTimeSear.start, dateFormat),
                            moment(taskSearch.planTimeSear.end, dateFormat)
                          ]}
                          onChange={val => {
                            this.valChange("endTime", val);
                          }}
                          format={dateFormat}
                        />
                      ) : (
                        <RangePicker
                          value={[]}
                          onChange={val => {
                            this.valChange("endTime", val);
                          }}
                          format={dateFormat}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  ""
                )}
                {taskSearch.menuType === "" &&
                topSearchOptions.indexOf("任务绩效") !== -1 ? (
                  <div className="selectType">
                    <h3>任务绩效</h3>
                    <div className="selectedList">
                      <ul>
                        <li
                          style={{
                            cursor: "pointer",
                            height: "30px",
                            lineHeight: "30px"
                          }}
                          onClick={() => {
                            this.clearSortType("taskFlow");
                          }}
                        >
                          未设置
                          {taskSearch.flowContenSear.min === "" &&
                          taskSearch.flowContenSear.max === "" &&
                          taskSearch.flowConten === "4" ? (
                            <Icon type="check" className="check" />
                          ) : (
                            ""
                          )}
                        </li>
                        {JSON.parse(JSON.stringify(taskFlowBox)) &&
                        JSON.parse(JSON.stringify(taskFlowBox)).length > 0
                          ? JSON.parse(JSON.stringify(taskFlowBox)).map(
                              (item, i) => {
                                return (
                                  <li
                                    key={i}
                                    onClick={() => {
                                      this.flowSearch(
                                        "flow",
                                        item.min,
                                        item.max
                                      );
                                    }}
                                  >
                                    {item.min}
                                    {item.min !== "" && item.max !== ""
                                      ? "-"
                                      : ""}
                                    {item.max}
                                    {flowIndex === i && everyFlowShow ? (
                                      <Icon type="check" className="check" />
                                    ) : (
                                      ""
                                    )}
                                  </li>
                                );
                              }
                            )
                          : ""}
                        <li
                          className="last"
                          onClick={e => {
                            e.stopPropagation();
                            this.setState({ taskFlowShow: true });
                          }}
                        >
                          自定义
                        </li>
                      </ul>
                    </div>
                    {taskFlowShow ? (
                      <div
                        className="workTime"
                        onClick={e => {
                          e.stopPropagation();
                        }}
                      >
                        <div className="title">
                          <Icon
                            type="close"
                            onClick={() => {
                              this.setState({ taskFlowShow: false });
                            }}
                            className="close"
                          />
                          <div>自定义</div>
                          <Icon
                            type="check"
                            className="check"
                            onClick={() => {
                              this.workSearch("flow");
                            }}
                          />
                        </div>
                        <div className="contentBox">
                          <div className="start">
                            <Input
                              placeholder="0"
                              value={flowMin <= 10000 ? flowMin : ""}
                              onChange={e => {
                                onlyNumber(e.target);
                                this.taskFlow("flow", "min", e);
                              }}
                            />
                          </div>
                          <span>-</span>
                          <div className="end">
                            <Input
                              placeholder="10000"
                              value={flowMax <= 10000 ? flowMax : ""}
                              onChange={e => {
                                onlyNumber(e.target);
                                this.taskFlow("flow", "max", e);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                ) : (
                  ""
                )}
                {taskSearch.menuType === "" &&
                topSearchOptions.indexOf("计划工期") !== -1 ? (
                  <div className="selectType">
                    <h3>计划工期</h3>
                    <div className="selectedList">
                      <ul>
                        <li
                          onClick={() => {
                            this.clearSortType("planTime");
                          }}
                          style={{
                            cursor: "pointer",
                            height: "30px",
                            lineHeight: "30px"
                          }}
                        >
                          未设置
                          {taskSearch.worktimeSear.min === "" &&
                          taskSearch.worktimeSear.max === "" &&
                          taskSearch.planTime === "4" ? (
                            <Icon type="check" className="check" />
                          ) : (
                            ""
                          )}
                        </li>
                        {JSON.parse(JSON.stringify(taskWorkBox)) &&
                        JSON.parse(JSON.stringify(taskWorkBox)).length > 0
                          ? JSON.parse(JSON.stringify(taskWorkBox)).map(
                              (item, i) => {
                                return (
                                  <li
                                    key={i}
                                    onClick={() => {
                                      this.flowSearch(
                                        "work",
                                        item.min,
                                        item.max
                                      );
                                    }}
                                  >
                                    {item.min}
                                    {item.min !== "" && item.max !== ""
                                      ? "-"
                                      : ""}
                                    {item.max}
                                    {workIndex === i && everyWorkShow ? (
                                      <Icon type="check" className="check" />
                                    ) : (
                                      ""
                                    )}
                                  </li>
                                );
                              }
                            )
                          : ""}
                        <li
                          className="last"
                          onClick={e => {
                            e.stopPropagation();
                            this.setState({ taskWorkTime: true });
                          }}
                        >
                          自定义
                        </li>
                      </ul>
                    </div>
                    {taskWorkTime ? (
                      <div
                        className="workTime"
                        onClick={e => {
                          e.stopPropagation();
                        }}
                      >
                        <div className="title">
                          <Icon
                            type="close"
                            onClick={() => {
                              this.setState({ taskWorkTime: false });
                            }}
                            className="close"
                          />
                          <div>自定义</div>
                          <Icon
                            type="check"
                            className="check"
                            onClick={() => {
                              this.workSearch("work");
                            }}
                          />
                        </div>
                        <div className="contentBox">
                          <div className="start">
                            <Input
                              placeholder="0"
                              value={workMin <= 500 ? workMin : ""}
                              onChange={e => {
                                onlyNumber(e.target);
                                this.taskFlow("work", "min", e);
                              }}
                            />
                          </div>
                          <span>-</span>
                          <div className="end">
                            <Input
                              placeholder="500"
                              value={workMax <= 500 ? workMax : ""}
                              onChange={e => {
                                onlyNumber(e.target);
                                this.taskFlow("work", "max", e);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                ) : (
                  ""
                )}
                {taskSearch.menuType === "" &&
                topSearchOptions.indexOf("确认人") !== -1 ? (
                  <div className="selectType">
                    <h3>确认人</h3>
                    {taskSearch.userFlow.userid ? (
                      <div className="userBox">
                        <div className="userSel">
                          <div className="userName">
                            {taskSearch.userFlow.photo !== "" ? (
                              <img src={taskSearch.userFlow.photo} />
                            ) : (
                              <font>
                                {this.getNickNameByName(
                                  taskSearch.userFlow.name
                                )}
                              </font>
                            )}
                          </div>
                          <span>{taskSearch.userFlow.name.slice(0, 3)}</span>
                          <div
                            className="userCen"
                            onClick={() => {
                              this.deleteUser("确认人");
                            }}
                          >
                            点击移除
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="null"
                        onClick={() => {
                          this.selUser("确认人");
                        }}
                      >
                        <span className="choose">选择确认人</span>
                        <span className="noChoose">未选确认人</span>
                      </div>
                    )}
                  </div>
                ) : (
                  ""
                )}
                {taskSearch.menuType === "" &&
                topSearchOptions.indexOf("创建人") !== -1 ? (
                  <div className="selectType">
                    <h3>创建人</h3>
                    {taskSearch.userCreate.userid ? (
                      <div className="userBox">
                        <div className="userSel">
                          <div className="userName">
                            {taskSearch.userCreate.photo !== "" ? (
                              <img src={taskSearch.userCreate.photo} />
                            ) : (
                              <font>
                                {this.getNickNameByName(
                                  taskSearch.userCreate.name
                                )}
                              </font>
                            )}
                          </div>
                          <span>{taskSearch.userCreate.name.slice(0, 3)}</span>
                          <div
                            className="userCen"
                            onClick={() => {
                              this.deleteUser("创建人");
                            }}
                          >
                            点击移除
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="null"
                        onClick={() => {
                          this.selUser("创建人");
                        }}
                      >
                        <span className="choose">选择创建人</span>
                        <span className="noChoose">未选创建人</span>
                      </div>
                    )}
                  </div>
                ) : (
                  ""
                )}
                {taskSearch.menuType === "" &&
                topSearchOptions.indexOf("指派人") !== -1 ? (
                  <div className="selectType">
                    <h3>指派人</h3>
                    {taskSearch.userAssign.userid ? (
                      <div className="userBox">
                        <div className="userSel">
                          <div className="userName">
                            {taskSearch.userAssign.photo !== "" ? (
                              <img src={taskSearch.userAssign.photo} />
                            ) : (
                              <font>
                                {this.getNickNameByName(
                                  taskSearch.userAssign.name
                                )}
                              </font>
                            )}
                          </div>
                          <span>{taskSearch.userAssign.name.slice(0, 3)}</span>
                          <div
                            className="userCen"
                            onClick={() => {
                              this.deleteUser("指派人");
                            }}
                          >
                            点击移除
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="null"
                        onClick={() => {
                          this.selUser("指派人");
                        }}
                      >
                        <span className="choose">选择指派人</span>
                        <span className="noChoose">未选指派人</span>
                      </div>
                    )}
                  </div>
                ) : (
                  ""
                )}
                {taskSearch.menuType === "" ? (
                  <div
                    className="selectBox"
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <div className="mainOne">
                      {/* <Icon type="plus-circle" className="icon" onClick={()=>{this.setState({moreSelectShow:true})}}/> */}
                      <i className="icon iconfont icon-add" />
                      <span
                        onClick={() => {
                          this.setState({ moreSelectShow: true });
                        }}
                      >
                        添加筛选条件
                      </span>
                    </div>
                    {moreSelectShow ? (
                      <div className="addBox">
                        <div className="addTop">
                          <span>更多筛选</span>
                          <Icon
                            type="close"
                            className="closeMore"
                            onClick={() => {
                              this.setState({ moreSelectShow: false });
                            }}
                          />
                        </div>
                        <div className="addContent">
                          <ul>
                            {initTopSearchOpts.map((item, i) => {
                              return (
                                <li
                                  key={"searOpt" + i}
                                  onClick={() => {
                                    this.valChange("searOptAdd", item);
                                  }}
                                >
                                  <span>{item}</span>
                                  {topSearchOptions.indexOf(item) !== -1 ? (
                                    <Icon type="check" className="check" />
                                  ) : (
                                    ""
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                ) : (
                  ""
                )}
              </div>
              <div className="clearBox">
                {taskSearch.projectIds.length > 0 ||
                taskSearch.labelId.length > 0 ||
                taskSearch.planTimeSear.start !== "" ||
                taskSearch.planTimeSear.end !== "" ||
                taskSearch.worktimeSear.min !== "" ||
                taskSearch.worktimeSear.max !== "" ||
                taskSearch.flowContenSear.min !== "" ||
                taskSearch.flowContenSear.max !== "" ||
                JSON.stringify(taskSearch.userResponse) !== "{}" ||
                JSON.stringify(taskSearch.userFlow) !== "{}" ||
                JSON.stringify(taskSearch.userCreate) !== "{}" ||
                JSON.stringify(taskSearch.userAssign) !== "{}" ||
                taskSearch.planTime !== "" ||
                taskSearch.flowConten !== "" ||
                taskSearch.taskPlanTime !== "" ||
                taskSearch.sortType !== saveValue ? (
                  <span
                    className="clearSelect"
                    onClick={() => {
                      this.clearSearchByType("all");
                    }}
                  >
                    清除筛选
                  </span>
                ) : (
                  ""
                )}
                <span className="taskNum">已筛选出{taskCount}条</span>
              </div>
            </div>
          )}
        </div>
        <div className="listHeaderRow">
          <div
            className="listHeader"
            style={{ border: "0", padding: "15px 0" }}
          >
            {dictsLoading && taskSearch.menuType !== "" ? (
              <Icon
                type="loading"
                className="loadingIcon"
                style={{ float: "right", margin: "5px 0 0 15px" }}
              />
            ) : (
              ""
            )}
            <div className="radioGroup">
              {taskSearch.menuType !== "" ? (
                <Dropdown overlay={groupOpt}>
                  <a className="ant-dropdown-link" href="#">
                    {/*'按'+groupActName*/} <Icon type="caret-down" />
                  </a>
                </Dropdown>
              ) : (
                <div className="rad radOne" />
              )}
              {groupOptDict.length > 0 &&
                groupOptDict.map((item, i) => {
                  return (
                    <div
                      className={
                        item.value === taskSearchStateAct ? "rad act" : "rad"
                      }
                      key={item.id}
                      onClick={() => {
                        this.valChange("topRadio", item.value);
                      }}
                    >
                      {item.label}
                    </div>
                  );
                })}
              <Checkbox
                style={{ margin: "0 0 0 15px" }}
                className="disabled"
                checked={showOkTask}
                onChange={e => {
                  this.hideCompleted(e)
                }}
              >
                隐藏已完成
              </Checkbox>
              <Checkbox
                checked={showTaskBox}
                className="disabled"
                onChange={e => {
                  this.hideTaskBag(e)
                }}
              >
                隐藏任务包
              </Checkbox>
              {getTeamInfoWithMoney("是否可用") ? (
                <Button
                  onClick={() => {
                    this.moreTaskEdit();
                  }}
                  type={moreTaskEditShow ? "primary" : ""}
                >
                  {getTeamInfoWithMoney("版本名称") !== "专业版" ? (
                    <svg className="pro-icon zuanshi" aria-hidden="true">
                      <use xlinkHref={"#pro-myfg-zuanshi"} />
                    </svg>
                  ) : (
                    ""
                  )}
                  批量修改
                </Button>
              ) : (
                ""
              )}
              {!getTeamInfoWithMoney("是否可用") ? (
                <Button
                  onClick={() => {
                    this.setState({ versionAlert: true });
                  }}
                >
                  {getTeamInfoWithMoney("版本名称") !== "专业版" ? (
                    <svg className="pro-icon zuanshi" aria-hidden="true">
                      <use xlinkHref={"#pro-myfg-zuanshi"} />
                    </svg>
                  ) : (
                    ""
                  )}
                  批量修改
                </Button>
              ) : (
                ""
              )}
              <Button
                type={
                  allSearchBoxShow ||
                  ((taskSearch.projectIds.length > 0 ||
                    taskSearch.labelId.length > 0 ||
                    taskSearch.planTimeSear.start !== "" ||
                    taskSearch.planTimeSear.end !== "" ||
                    taskSearch.worktimeSear.min !== "" ||
                    taskSearch.worktimeSear.max !== "" ||
                    taskSearch.flowContenSear.min !== "" ||
                    taskSearch.flowContenSear.max !== "" ||
                    JSON.stringify(taskSearch.userResponse) !== "{}" ||
                    JSON.stringify(taskSearch.userFlow) !== "{}" ||
                    JSON.stringify(taskSearch.userCreate) !== "{}" ||
                    JSON.stringify(taskSearch.userAssign) !== "{}" ||
                    taskSearch.planTime !== "" ||
                    taskSearch.flowConten !== "" ||
                    taskSearch.taskPlanTime !== "") &&
                    !allSearchBoxShow)
                    ? "primary"
                    : ""
                }
                onClick={e => {
                  e.stopPropagation();
                  e.stopPropagation();
                  this.searchSort();
                  this.clickButton();
                }}
              >
                筛选排序
              </Button>
              {(taskSearch.projectIds.length > 0 ||
                taskSearch.labelId.length > 0 ||
                taskSearch.planTimeSear.start !== "" ||
                taskSearch.planTimeSear.end !== "" ||
                taskSearch.worktimeSear.min !== "" ||
                taskSearch.worktimeSear.max !== "" ||
                taskSearch.flowContenSear.min !== "" ||
                taskSearch.flowContenSear.max !== "" ||
                JSON.stringify(taskSearch.userResponse) !== "{}" ||
                JSON.stringify(taskSearch.userFlow) !== "{}" ||
                JSON.stringify(taskSearch.userCreate) !== "{}" ||
                JSON.stringify(taskSearch.userAssign) !== "{}" ||
                taskSearch.planTime !== "" ||
                taskSearch.flowConten !== "" ||
                taskSearch.taskPlanTime !== "" ||
                taskSearch.sortType !== saveValue) &&
              !allSearchBoxShow ? (
                <span
                  className="clearChoose"
                  onClick={() => {
                    this.clearSearchByType("all");
                  }}
                >
                  清除筛选
                </span>
              ) : (
                ""
              )}
            </div>
          </div>
          {moreTaskEditShow ? (
            <div className="listHeader" style={{ display: "flex" }}>
              <Checkbox
                checked={checkTaskIds.length === taskList.length ? true : false}
                onChange={e => {
                  this.allChecked(e);
                }}
              >
                全选
              </Checkbox>
              <span>已选择：{checkTaskIds.length}条</span>
              {/*<span>当前任务数：{taskCount}</span>*/}
              <div className="allBtnRow" style={{ flex: "1" }}>
                <MoreTaskEdit
                  editType="标签"
                  checkTaskIds={checkTaskIds}
                  updateCallBack={() => {
                    this.getTaskList(1, 30);
                  }}
                />
                <MoreTaskEdit
                  editType="负责人"
                  checkTaskIds={checkTaskIds}
                  updateCallBack={() => {
                    this.getTaskList(1, 30);
                  }}
                />
                <MoreTaskEdit
                  editType="确认人"
                  checkTaskIds={checkTaskIds}
                  updateCallBack={() => {
                    this.getTaskList(1, 30);
                  }}
                />
                {/* <Button type="primary" style={{ float: 'right', margin: '0' }} onClick={() => { this.cancelMoreEdit() }}>取消</Button> */}
                <Select
                  placeholder="更多修改"
                  style={{ width: 100, fontSize: "13px" }}
                  value={"更多修改"}
                >
                  <Option value="more1">
                    <MoreTaskEdit
                      editType="完成时间"
                      checkTaskIds={checkTaskIds}
                      updateCallBack={() => {
                        this.getTaskList(1, 30);
                      }}
                    />
                  </Option>
                  <Option value="more2">
                    <MoreTaskEdit
                      editType="计划工期"
                      checkTaskIds={checkTaskIds}
                      updateCallBack={() => {
                        this.getTaskList(1, 30);
                      }}
                    />
                  </Option>
                  <Option value="more4">
                    <MoreTaskEdit
                      editType="任务绩效"
                      checkTaskIds={checkTaskIds}
                      updateCallBack={() => {
                        this.getTaskList(1, 30);
                      }}
                    />
                  </Option>
                  <Option value="more3">
                    <MoreTaskEdit
                      editType="优先级"
                      checkTaskIds={checkTaskIds}
                      updateCallBack={() => {
                        this.getTaskList(1, 30);
                      }}
                    />
                  </Option>
                </Select>
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    );
  }

  valChange(type, val) {
    let {
      taskSearch,
      topSearchOptions,
      taskListHideOpt,
      tagSelecteds,
      selectedProject
    } = this.state;
    const taskSearchInitVal = {
      group: "evolve",
      labelId: [],
      menuType: taskSearch.menuType,
      projectIds: [],
      search: "",
      planTimeSear: {
        start: "",
        end: ""
      },
      worktimeSear: {
        min: "",
        max: ""
      },
      flowContenSear: {
        min: "",
        max: ""
      },
      planTime: "",
      flowConten: "",
      taskPlanTime: "",
      userResponse: {},
      userFlow: {},
      userCreate: {},
      userAssign: {},
      userSear: {
        type: "0",
        userIds: []
      },
      sortType: taskSearch.sortType
    };
    switch (type) {
      case "checkTask":
        const checkTaskIds = JSON.parse(JSON.stringify(val));
        this.setState({ checkTaskIds: checkTaskIds });
        break;
      case "leftMenu":
        this.cancelMoreEdit();
        // sub1我负责的,my_succeed我确认的,my_add我创建的,my_be我指派的,my_attention我关注的

        /*if (val === 'my_be' || val === 'sub1' || taskSearch.panelId[0] === '3' || val === 'my_succeed' || val === 'my_add' || val === 'my_attention') {
          taskSearch.panelId = [];
          this.setState({ taskSearch: taskSearch, taskSearchStateAct: 'all' });
        }*/

        //选中默认规则 我负责的---未完成  我确认的---待确认  我创建的---待指派  我指派的---未完成  我关注的---未完成
        if (val === "sub1") {
          taskSearch.panelId = ["0"];
          taskSearch = taskSearchInitVal;
          this.setState({
            taskSearchStateAct: "0",
            tagSelecteds: [],
            selectedProject: [],
            allSearchBoxShow: false,
            stopPlanTimeShow: false
          });
        } else if (val === "my_succeed") {
          taskSearch.panelId = ["2"];
          taskSearch = taskSearchInitVal;
          this.setState({
            taskSearchStateAct: "2",
            tagSelecteds: [],
            selectedProject: [],
            allSearchBoxShow: false,
            stopPlanTimeShow: false
          });
        } else if (val === "my_add") {
          taskSearch.panelId = ["3"];
          taskSearch = taskSearchInitVal;
          this.setState({
            taskSearchStateAct: "3",
            tagSelecteds: [],
            selectedProject: [],
            allSearchBoxShow: false,
            stopPlanTimeShow: false
          });
        } else if (val === "my_be") {
          taskSearch.panelId = ["0"];
          taskSearch = taskSearchInitVal;
          this.setState({
            taskSearchStateAct: "0",
            tagSelecteds: [],
            selectedProject: [],
            allSearchBoxShow: false,
            stopPlanTimeShow: false
          });
        } else if (val === "my_attention") {
          taskSearch.panelId = ["0"];
          taskSearch = taskSearchInitVal;
          this.setState({
            taskSearchStateAct: "0",
            tagSelecteds: [],
            selectedProject: [],
            allSearchBoxShow: false,
            stopPlanTimeShow: false
          });
        }

        if (val === "all") {
          taskSearch.menuType = "";
          taskSearch.group = "evolve"; // 只能按任务进展筛选
          taskListHideOpt = [];
          taskSearch.panelId = []; // 点击左侧全部按钮时，将panelId制空
          taskSearch.labelId = [];
          taskSearch.projectIds = [];

          this.setState({
            taskSearchStateAct: "all",
            tagSelecteds: [],
            selectedProject: [],
            allSearchBoxShow: false,
            stopPlanTimeShow: true
          });
        } else {
          taskSearch.menuType = val;
          if (val === "sub1") {
            taskSearch.panelId = ["0"];
            taskSearch = taskSearchInitVal;
            this.setState({
              taskSearchStateAct: "0",
              tagSelecteds: [],
              selectedProject: [],
              allSearchBoxShow: false,
              stopPlanTimeShow: false
            });
          } else if (val === "my_succeed") {
            taskSearch.panelId = ["2"];
            taskSearch = taskSearchInitVal;
            this.setState({
              taskSearchStateAct: "2",
              tagSelecteds: [],
              selectedProject: [],
              allSearchBoxShow: false,
              stopPlanTimeShow: false
            });
          } else if (val === "my_add") {
            taskSearch.panelId = ["3"];
            taskSearch = taskSearchInitVal;
            this.setState({
              taskSearchStateAct: "3",
              tagSelecteds: [],
              selectedProject: [],
              allSearchBoxShow: false,
              stopPlanTimeShow: false
            });
          } else if (val === "my_be") {
            taskSearch.panelId = ["0"];
            taskSearch = taskSearchInitVal;
            this.setState({
              taskSearchStateAct: "0",
              tagSelecteds: [],
              selectedProject: [],
              allSearchBoxShow: false,
              stopPlanTimeShow: false
            });
          } else if (val === "my_attention") {
            taskSearch.panelId = ["0"];
            taskSearch = taskSearchInitVal;
            this.setState({
              taskSearchStateAct: "0",
              tagSelecteds: [],
              selectedProject: [],
              allSearchBoxShow: false,
              stopPlanTimeShow: false
            });
          }
          if (val === "sub1") {
            taskListHideOpt = ["user"];
          } else {
            taskListHideOpt = [];
          }
          // 清空除项目和标签以外的筛选值
          taskSearch.planTimeSear = {
            start: "",
            end: ""
          };
          taskSearch.worktimeSear = {
            min: "",
            max: ""
          };
          taskSearch.flowContenSear = {
            min: "",
            max: ""
          };
          for (var key in taskSearch.userResponse) {
            delete taskSearch.userResponse[key];
          }
          for (var key in taskSearch.userFlow) {
            delete taskSearch.userFlow[key];
          }
          for (var key in taskSearch.userCreate) {
            delete taskSearch.userCreate[key];
          }
          for (var key in taskSearch.userAssign) {
            delete taskSearch.userAssign[key];
          }
          taskSearch.userSear = {
            type: "0" /* 负责人0 确认人1 关注人2 指派人3 创建人4          */,
            userIds: []
          };
        }
        this.setState({
          taskSearch: taskSearch,
          taskListHideOpt: taskListHideOpt
        });
        this.getTaskList(1, 30, taskSearch);
        this.refs.bottomBox.scrollTop = 0;
        break;
      case "searGroupOpt":
        taskSearch.group = val;
        taskSearch.panelId = [];
        this.setState({ taskSearch: taskSearch, taskSearchStateAct: "all" });
        this.getTaskList(1, 30, taskSearch);
        this.refs.bottomBox.scrollTop = 0;
        break;
      case "endTime":
        let start = "";
        let end = "";
        if (val.length > 0) {
          start = dateToString(val[0]._d, "date");
          end = dateToString(val[1]._d, "date");
          taskSearch.planTimeSear = {
            start: start,
            end: end
          };
          taskSearch.taskPlanTime = "";
        } else {
          taskSearch.planTimeSear = {
            start: "",
            end: ""
          };
        }
        this.setState({
          taskSearch: taskSearch,
          taskSelectCenShow: false,
          taskPlanTimeSel: false,
          dateShow: false,
          weekShow: false,
          monthShow: false,
          pickerShow: false
        });
        this.getTaskList(1, 30, taskSearch);
        break;
      case "userType":
        taskSearch.userSear.type = val;
        this.setState({ taskSearch: taskSearch });
        break;
      case "topRadio":
        this.cancelMoreEdit();
        if (val === "all") {
          taskSearch.panelId = [];
        } else {
          taskSearch.panelId = [val];
        }
        this.setState({ taskSearch: taskSearch, taskSearchStateAct: val });
        this.getTaskList(1, 30, taskSearch);
        this.refs.bottomBox.scrollTop = 0;
        break;
      case "searOpt":
        topSearchOptions.splice(topSearchOptions.indexOf(val), 1);
        this.setState({ topSearchOptions: topSearchOptions });
        Storage.setLocal("searchOpt", topSearchOptions);
        this.clearSearchByType(val);
        break;
      case "searOptAdd":
        if (topSearchOptions.indexOf(val) === -1) {
          topSearchOptions.push(val);
        } else {
          topSearchOptions.splice(topSearchOptions.indexOf(val), 1);
        }
        this.setState({ topSearchOptions: topSearchOptions });
        Storage.setLocal("searchOpt", topSearchOptions);
        break;
      case "tagChange":
        taskSearch.labelId = [];
        val.map(item => {
          taskSearch.labelId.push(item.id);
        });
        this.setState({ tagSelecteds: val, taskSearch: taskSearch });
        this.getTaskList(1, 30, taskSearch);
        this.refs.bottomBox.scrollTop = 0;
        break;
    }
  }

  scrollOnBottom(type, e) {
    const isOnButtom = listScroll(e);
    switch (type) {
      case "projectList":
        const { projectListAllPage, projectListNowPage } = this.state;
        if (isOnButtom && projectListNowPage < projectListAllPage) {
          this.getProjectList(projectListNowPage + 1);
        }
        break;
      case "taskList":
        const { taskListAllPage, taskListNowPage } = this.state;
        if (isOnButtom && taskListNowPage < taskListAllPage) {
          this.getTaskList(taskListNowPage + 1, 30);
        }
        break;
    }
  }

  taskClickCallBack(taskId, proId) {
    this.setState({ detailPageTaskId: taskId, detailPageProjectId: proId });
    if (!this.state.taskDetailShow) {
      this.setState({
        taskDetailShow: true,
        animateClass: "animated_05s fadeInRightBig"
      });
    }
    const _this = this;
    setTimeout(function() {
      _this.setState({ animateClass: "" });
    }, 500);
  }

  clearSearchByType(type) {
    let { taskSearch } = this.state;
    const taskSearchInitVal = {
      group: "evolve",
      labelId: [],
      menuType: taskSearch.menuType,
      panelId: taskSearch.panelId,
      projectIds: [],
      search: "",
      planTimeSear: {
        start: "",
        end: ""
      },
      worktimeSear: {
        min: "",
        max: ""
      },
      flowContenSear: {
        min: "",
        max: ""
      },
      planTime: "",
      flowConten: "",
      taskPlanTime: "",
      userResponse: {},
      userFlow: {},
      userCreate: {},
      userAssign: {},
      userSear: {
        type: "0",
        userIds: []
      },
      sortType: Storage.getLocal("saveSort")
    };
    this.returnValue(Storage.getLocal("saveSort"));
    switch (type) {
      case "all":
        taskSearch = taskSearchInitVal;
        this.setState({
          selectedProject: [],
          selectedUsers: [],
          dateShow: false,
          weekShow: false,
          monthShow: false,
          rangePickerShow: false,
          everyFlowShow: false,
          everyWorkShow: false
        });
        this.setState({ tagSelecteds: [] });
        this.getTaskList(1, 30, taskSearchInitVal);
        break;
      case "项目":
        taskSearch.projectIds = [];
        this.setState({ projectSelecteds: [] });
        break;
      case "标签":
        taskSearch.labelId = [];
        this.setState({ tagSelecteds: [] });
        break;
      case "计划工期":
        taskSearch.worktimeSear = taskSearchInitVal.worktimeSear;
        break;
      case "任务绩效":
        taskSearch.flowContenSear = taskSearchInitVal.flowContenSear;
        break;
      case "截止日期":
        taskSearch.planTimeSear = taskSearchInitVal.planTimeSear;
        break;
      case "负责人":
        taskSearch.userResponse = taskSearchInitVal.userResponse;
        break;
      case "确认人":
        taskSearch.userFlow = taskSearchInitVal.userFlow;
        break;
      case "创建人":
        taskSearch.userCreate = taskSearchInitVal.userCreate;
        break;
      case "指派人":
        taskSearch.userAssign = taskSearchInitVal.userAssign;
        break;
    }
    this.setState({ taskSearch: taskSearch });
  }

  taskUpdate(task) {
    let { taskList, hideTaskIds, taskSearch } = this.state;
    taskList.map((item, i) => {
      if (item.taskinfo.id === task.id) {
        if (task.delTask) {
          taskList.splice(i, 1);
          this.setState({ taskList: taskList });
          return false;
        }
        if (task.name) {
          taskList[i].taskinfo.taskname = task.name;
        }
        if (task.tags) {
          const labs = [];
          task.tags.map((lab, index) => {
            labs.push({
              id: lab.id,
              labelname: lab.name,
              color: lab.color,
              type: "1"
            });
          });
          taskList[i].labels = labs;
        }
        if (task.attention === true || task.attention === false) {
          taskList[i].taskinfo.collect = task.attention;
        }
        if (task.planEndTime !== undefined) {
          taskList[i].taskinfo.planEndTime = task.planEndTime;
        }
        if (task.realityEndTime !== undefined) {
          taskList[i].taskinfo.realityEndTime = task.realityEndTime;
        }
        if (task.milestone === "0" || task.milestone === "1") {
          taskList[i].taskinfo.milestone = task.milestone;
        }
        if (
          task.childSuccess > 0 ||
          task.childSuccess == 0 ||
          task.childCount > 0 ||
          task.childCount == 0
        ) {
          taskList[i].taskinfo.childSuccess = task.childSuccess;
          taskList[i].taskinfo.childCount = task.childCount;
        }
        if (task.talkCount > 0 || task.talkCount === 0) {
          taskList[i].taskinfo.leaveCount = task.talkCount;
        }
        if (task.state) {
          // 更新数据
          taskList[i].taskinfo.stateName = task.state;
          // 按任务进展
          if (taskSearch.group === "evolve") {
            // 未完成
            if (taskSearch.panelId[0] === "0") {
              if (task.state !== "0" && task.state !== "7") {
                this.hideTask(task, hideTaskIds);
              } else {
                this.showTask(task, hideTaskIds);
              }
              // 待确认
            } else if (taskSearch.panelId[0] === "2") {
              if (task.state !== "2") {
                this.hideTask(task, hideTaskIds);
              } else {
                this.showTask(task, hideTaskIds);
              }
              // 已完成
            } else if (taskSearch.panelId[0] === "1") {
              if (
                task.state !== "1" &&
                task.state !== "8" &&
                task.state !== "9"
              ) {
                this.hideTask(task, hideTaskIds);
              } else {
                this.showTask(task, hideTaskIds);
              }
              // 已终止
            } else if (taskSearch.panelId[0] === "4") {
              if (task.state !== "4") {
                this.hideTask(task, hideTaskIds);
              } else {
                this.showTask(task, hideTaskIds);
              }
              // 未指派
            } else if (taskSearch.panelId[0] === "3") {
              if (task.state !== "3") {
                this.hideTask(task, hideTaskIds);
              } else {
                this.showTask(task, hideTaskIds);
              }
            }
          }
        }
        // 删除/修改负责人
        if (task.fzr || task.fzr === "") {
          // 更新数据
          if (taskList[i].taskinfo.userResponse) {
            taskList[i].taskinfo.userResponse.name = task.fzr;
          } else {
            taskList[i].taskinfo.userResponse = {};
            taskList[i].taskinfo.userResponse.name = task.fzr;
          }
          // 我指派的
          if (taskSearch.menuType === "my_be") {
            if (task.fzr === "") {
              this.hideTask(task, hideTaskIds);
            } else {
              this.showTask(task, hideTaskIds);
            }
          }
          // 我负责的
          if (taskSearch.menuType === "sub1") {
            if (task.fzr === "") {
              this.hideTask(task, hideTaskIds);
            } else if (
              taskList[i].taskinfo.userResponse &&
              task.fzr === taskList[i].taskinfo.userResponse.name
            ) {
              this.showTask(task, hideTaskIds);
            }
          }
        }
        // 我确认的
        if (
          taskSearch.menuType === "my_succeed" &&
          (task.qrr === "" ||
            (item.taskinfo.userFlow &&
              task.qrr !== undefined &&
              task.qrr !== item.taskinfo.userFlow.name))
        ) {
          this.hideTask(task, hideTaskIds);
        } else if (
          taskSearch.menuType === "my_succeed" &&
          item.taskinfo.userFlow &&
          task.qrr !== undefined &&
          task.qrr === item.taskinfo.userFlow.name
        ) {
          this.showTask(task, hideTaskIds);
        }
        // 我关注的
        if (
          taskSearch.menuType === "my_attention" &&
          task.attention === false
        ) {
          this.hideTask(task, hideTaskIds);
        } else if (
          taskSearch.menuType === "my_attention" &&
          task.attention === true
        ) {
          this.showTask(task, hideTaskIds);
        }
        return false;
      }
    });
    this.setState({ taskList: taskList });
  }

  showTask(task, hideTaskIds) {
    const index = hideTaskIds.indexOf(task.id);
    if (index !== -1) {
      hideTaskIds.splice(index, 1);
      this.setState({ hideTaskIds: hideTaskIds });
    }
  }

  hideTask(task, hideTaskIds) {
    hideTaskIds.push(task.id);
    this.setState({ hideTaskIds: hideTaskIds });
  }
  selectProject(val) {
    const { taskSearch } = this.state;
    let projectIds = [];
    val.map(item => {
      projectIds.push(item.id);
    });
    taskSearch.projectIds = projectIds;
    this.setState({ taskSearch: taskSearch, selectedProject: val });
    this.getTaskList(1, 30, taskSearch);
    this.refs.bottomBox.scrollTop = 0;
  }

  render() {
    const {
      visible,
      versionShow,
      taskMax,
      taskSelectCenShow,
      available,
      taskList,
      taskListLoading,
      projectSelectShow,
      tagComponentShow,
      selectedProject,
      versionUpdateShow,
      hideTaskIds,
      versionAlert,
      tagSelecteds,
      buyDay15Show,
      showOkTask,
      showTaskBox,
      taskListLoadingCount,
      detailPageTaskId,
      taskCreateShow,
      animateClass,
      detailPageProjectId,
      checkTaskIds,
      moreTaskEditShow,
      taskSearch,
      taskDetailShow,
      taskListHideOpt,
      taskListMoreLoading,
      taskListAllPage,
      taskListNowPage
    } = this.state;
    let actType = "";
    if (taskSearch.menuType === "") {
      actType = ["all"];
    } else {
      actType = [taskSearch.menuType];
    }

    return (
      <LocaleProvider locale={zh_CN}>
        <Layout>
          <style dangerouslySetInnerHTML={{ __html: stylesheet }} />
          {taskSelectCenShow ? (
            <div
              className="taskSelectCen"
              onClick={() => {
                this.setState({ taskSelectCenShow: false, pickerShow: true });
              }}
            />
          ) : (
            ""
          )}
          <Head
            menuClickCallBack={val => {
              this.valChange("leftMenu", val);
            }}
            selectKey={taskSearch.menuType}
          />
          <Modal
            visible={visible}
            onCancel={() => {
              this.setState({ visible: false });
            }}
            footer={null}
            width={versionShow ? 850 : 520}
            closable={!versionShow}
            mask={true}
            className="limitModel"
            maskClosable={false}
            wrapClassName="limitModel"
            style={versionShow ? {} : { top: 260, height: "400px" }}
          >
            {versionShow ? (
              <div className="imgBox">
                <p>基础版&专业版功能对比</p>
                <Icon
                  type="close"
                  onClick={() => {
                    this.setState({ versionShow: false });
                  }}
                />
                <div className="img">
                  <img src="../static/react-static/pcvip/imgs/versionTable1.png?t=2.1" />
                  <img src="../static/react-static/pcvip/imgs/versionTable2.jpg?t=2.1" />
                </div>
              </div>
            ) : (
              ""
            )}
            <div
              className="writeBox"
              style={versionShow ? { display: "none" } : {}}
            >
              <p>
                <span className="limitMesg">用量信息</span>
                <span
                  onClick={() => {
                    this.setState({ versionShow: true });
                  }}
                  className="versionMeg"
                >
                  版本介绍
                </span>
              </p>
              <div className="myBorder" />
              <div className="text">
                <p>
                  您正在使用的是<b> 蚂蚁分工免费版</b>，免费版每月可创建
                  <b> 200 </b>条任务，本月任务用量已达版本上限。
                </p>
                <p>
                  如您的团队项目和任务数量较多，可升级为经济实惠的
                  <b> 蚂蚁分工基础版</b>
                  ，基础版不限使用人数、不限项目数量、不限任务数量。
                </p>
                <p>
                  我们更建议您升级到功能强大的<b> 蚂蚁分工专业版</b>
                  ，专业版具有批量任务操作、甘特图、多维度数据统计图表等专业功能，助您提高协同工作效率、提升项目管理水平。
                </p>
              </div>
              <div className="renew">
                <Popover
                  content={
                    <div>
                      {getTeamInfoWithMoney("是否钉钉订单") ? (
                        <div>
                          <img
                            src="../static/react-static/pcvip/imgs/ewmDing.png"
                            style={{
                              width: "200px",
                              height: "230px",
                              margin: "10px 0px 0 10px"
                            }}
                          />
                          <img
                            src="../static/react-static/pcvip/imgs/ewmMaYi.png"
                            style={{
                              width: "200px",
                              height: "230px",
                              margin: "10px 10px 0 40px"
                            }}
                          />
                        </div>
                      ) : (
                        <img
                          src="../static/react-static/pcvip/imgs/ewmMaYi.png"
                          style={{
                            width: "200px",
                            height: "230px",
                            margin: "10px 10px 0px 10px"
                          }}
                        />
                      )}
                    </div>
                  }
                  placement="top"
                  trigger="click"
                >
                  <Button
                    type="primary"
                    style={{ marginRight: "20px", height: "30px" }}
                  >
                    升级专业版
                  </Button>
                </Popover>
                <Popover
                  content={
                    <div>
                      {getTeamInfoWithMoney("是否钉钉订单") ? (
                        <div>
                          <img
                            src="../static/react-static/pcvip/imgs/ewmDing.png"
                            style={{
                              width: "200px",
                              height: "230px",
                              margin: "10px 0px 0 10px"
                            }}
                          />
                          <img
                            src="../static/react-static/pcvip/imgs/ewmMaYi.png"
                            style={{
                              width: "200px",
                              height: "230px",
                              margin: "10px 10px 0 40px"
                            }}
                          />
                        </div>
                      ) : (
                        <img
                          src="../static/react-static/pcvip/imgs/ewmMaYi.png"
                          style={{
                            width: "200px",
                            height: "230px",
                            margin: "10px 10px 0px 10px"
                          }}
                        />
                      )}
                    </div>
                  }
                  placement="top"
                  trigger="click"
                >
                  <Button type="primary" style={{ height: "30px" }}>
                    升级基础版
                  </Button>
                </Popover>
              </div>
            </div>
          </Modal>
          <Content>
            <div
              className={
                taskDetailShow
                  ? "taskDetailBox " + animateClass
                  : "taskDetailBoxRun animated_Out fadeInRightBigOut"
              }
            >
              <TaskDetail
                taskId={detailPageTaskId}
                projectId={detailPageProjectId}
                closeCallBack={() => {
                  this.setState({
                    taskDetailShow: false,
                    animateClass: "animated_Out fadeInRightBigOut"
                  });
                }}
                updatedTaskCallBack={val => {
                  if (val === "刷新" || val.taskCopyId || val.moveTaskId) {
                    this.getTaskList();
                  } else {
                    this.taskUpdate(val);
                  }
                }}
              />
            </div>
            {taskCreateShow ? (
              <TaskCreate
                closedCallBack={() => {
                  this.setState({ taskCreateShow: false });
                }}
                successCallBack={() => {
                  let search = this.state.taskSearch;
                  search.menuType = "my_add";
                  this.getTaskList(1, "", search);
                }}
              />
            ) : (
              ""
            )}
            {projectSelectShow ? (
              <ProjectSelect
                title={"选择项目"}
                closedCallBack={() => {
                  this.setState({ projectSelectShow: false });
                }}
                selectedProjects={selectedProject}
                selectedCallBack={val => {
                  this.selectProject(JSON.parse(JSON.stringify(val)));
                }}
              />
            ) : (
              ""
            )}
            {tagComponentShow ? (
              <TagSelect
                title="标签"
                type="1"
                selectedTags={tagSelecteds}
                closedCallBack={() => {
                  this.setState({ tagComponentShow: false });
                }}
                selectedCallBack={val => {
                  this.valChange("tagChange", val);
                }}
              />
            ) : (
              ""
            )}
            {versionUpdateShow &&
            !buyDay15Show &&
            !getTeamInfoWithMoney("是否超限")[0] &&
            (getTeamInfoWithMoney("剩余天数") > 0 ||
              getTeamInfoWithMoney("剩余天数") === 0) ? (
              <VersionUpdate />
            ) : (
              ""
            )}
            {getTeamInfoWithMoney("是否超限")[0] ? (
              <MoneyEnd
                alertText={getTeamInfoWithMoney("人数超限提示")}
                canClosed={false}
              />
            ) : (
              ""
            )}
            {versionAlert ? (
              <MoneyEnd
                alertText={getTeamInfoWithMoney("专业版提示")}
                closeCallBack={() => {
                  this.setState({ versionAlert: false });
                }}
              />
            ) : (
              ""
            )}
            {getTeamInfoWithMoney("剩余天数") < 0 ? (
              <MoneyEnd
                alertText={getTeamInfoWithMoney("已到期提示")}
                canClosed={false}
              />
            ) : (
              ""
            )}
            {!getTeamInfoWithMoney("是否超限")[0] && buyDay15Show ? (
              <MoneyEnd
                alertText={getTeamInfoWithMoney("即将到期提示")}
                closeCallBack={() => {
                  this.setState({ buyDay15Show: false });
                  Storage.setLocal(
                    "buyDay15AlertDate",
                    dateToString(new Date(), "date")
                  );
                }}
              />
            ) : (
              ""
            )}

            <div
              className="left_menu"
              onClick={() => {
                this.setState({ taskDetailShow: false });
              }}
            >
              {!available ? (
                <Button
                  size="large"
                  type="primary"
                  icon="plus-circle-o"
                  onClick={() => {
                    this.freeTaskLimit();
                  }}
                >
                  创建任务
                </Button>
              ) : (
                <Button
                  type="primary"
                  size="large"
                  icon="plus-circle-o"
                  onClick={() => {
                    this.cancelMoreEdit();
                    this.setState({ taskCreateShow: true });
                  }}
                >
                  创建任务
                </Button>
              )}
              <Menu
                defaultSelectedKeys={actType}
                selectedKeys={actType}
                openKeys={["wdrw"]}
                mode="inline"
              >
                <SubMenu
                  key="wdrw"
                  title={
                    <span>
                      <Icon type="idcard" />
                      <span>我的任务</span>
                    </span>
                  }
                >
                  <Menu.Item
                    key="sub1"
                    onClick={() => {
                      this.valChange("leftMenu", "sub1");
                    }}
                  >
                    我负责的
                  </Menu.Item>
                  <Menu.Item
                    key="my_add"
                    onClick={() => {
                      this.valChange("leftMenu", "my_add");
                    }}
                  >
                    我创建的
                  </Menu.Item>
                  <Menu.Item
                    key="my_be"
                    onClick={() => {
                      this.valChange("leftMenu", "my_be");
                    }}
                  >
                    我指派的
                  </Menu.Item>
                  <Menu.Item
                    key="my_succeed"
                    onClick={() => {
                      this.valChange("leftMenu", "my_succeed");
                    }}
                  >
                    我确认的
                  </Menu.Item>
                  <Menu.Item
                    key="my_attention"
                    onClick={() => {
                      this.valChange("leftMenu", "my_attention");
                    }}
                  >
                    我关注的
                  </Menu.Item>
                </SubMenu>
                {getTeamInfoWithMoney("是否可用") && (
                  <Menu.Item
                    key="all"
                    onClick={() => {
                      this.valChange("leftMenu", "all");
                    }}
                  >
                    {getTeamInfoWithMoney("版本名称") === "专业版" ? (
                      <Icon type="profile" />
                    ) : (
                      ""
                    )}
                    {getTeamInfoWithMoney("版本名称") !== "专业版" ? (
                      <svg className="pro-icon zuanshi" aria-hidden="true">
                        <use xlinkHref={"#pro-myfg-zuanshi"} />
                      </svg>
                    ) : (
                      ""
                    )}
                    全部任务
                  </Menu.Item>
                )}
                {!getTeamInfoWithMoney("是否可用") && (
                  <Menu.Item
                    key="all"
                    onClick={() => {
                      this.setState({ versionAlert: true });
                    }}
                  >
                    {getTeamInfoWithMoney("版本名称") !== "专业版" ? (
                      <svg className="pro-icon zuanshi" aria-hidden="true">
                        <use xlinkHref={"#pro-myfg-zuanshi"} />
                      </svg>
                    ) : (
                      ""
                    )}
                    全部任务
                  </Menu.Item>
                )}
              </Menu>
            </div>
            <div className="contBox">
              {this.right_top_render()}
              <div
                className="bottomBox"
                onScroll={e => {
                  this.scrollOnBottom("taskList", e);
                }}
                ref="bottomBox"
              >
                <Spin spinning={taskListLoading} />
                {taskList && taskList.length > 0 ? (
                  <TaskList
                    taskList={taskList}
                    hideOpt={taskListHideOpt}
                    taskClickCallBack={(taskId, proId) => {
                      this.cancelMoreEdit();
                      this.taskClickCallBack(taskId, proId);
                    }}
                    taskAttentionCallBack={task => {
                      this.taskUpdate(task);
                    }}
                    taskCheckedShow={moreTaskEditShow}
                    checkTaskIds={checkTaskIds}
                    checkingTaskCallBack={val => {
                      this.valChange("checkTask", val);
                    }}
                    hideOkTask={showOkTask}
                    hideTaskBox={showTaskBox}
                    hideTaskIds={hideTaskIds}
                  />
                ) : (
                  ""
                )}
                {taskList.length === 0 && taskListLoadingCount > 0 && (
                  <NullView />
                )}
                {taskList.length === 0 && taskListLoadingCount === "err" && (
                  <NullView
                    isLoadingErr={true}
                    restLoadingCallBack={() => {
                      this.getTaskList();
                    }}
                  />
                )}
                {!taskListMoreLoading &&
                taskListNowPage < taskListAllPage &&
                taskListLoadingCount !== "err" ? (
                  showOkTask && taskSearch.panelId[0] === "1" ? (
                    ""
                  ) : (
                    <div className="moreLoadingRow">下拉加载更多</div>
                  )
                ) : (
                  ""
                )}
                {!taskListMoreLoading &&
                taskListNowPage === taskListAllPage &&
                taskList.length > 0 &&
                taskListLoadingCount !== "err" ? (
                  <div className="moreLoadingRow">已经到底喽</div>
                ) : (
                  ""
                )}
                {taskListMoreLoading ? (
                  <div className="moreLoadingRow">
                    <Icon type="loading" className="loadingIcon" />
                    正在加载更多
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>
          </Content>
        </Layout>
      </LocaleProvider>
    );
  }
}

function mapStateToProps(state) {
  return {
    taskSortVal: state.task.taskSortVal
  };
}
const mapDispatchToProps = dispatch => {
  return {
    setTaskSortVal: bindActionCreators(taskAction.setTaskSortVal, dispatch)
  };
};

export default withRedux(initStore, mapStateToProps, mapDispatchToProps)(Task);
