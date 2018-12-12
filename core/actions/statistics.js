import HttpClient from "../api/HttpClient";

export const SORT_DATA = "SORT_DATA";
export const TASK_AGENT = "TASK_AGENT";
export const TASKPEND_LIST = "TASKPEND_LIST";
export const TASKNUM_LIST = "TASKNUM_LIST";
export const TASKPERSON_LIST = "TASKPERSON_LIST";
export const PERFORMACNCEPRO_LIST = "PERFORMACNCEPRO_LIST";
export const PRERFORMANCEPER_LIST = "PRERFORMANCEPER_LIST";
export const TASKPEND_CHART = "TASKPEND_CHART";
export const NUMBYPROJECT_CHART = "NUMBYPROJECT_CHART";
export const NUMBYPERSON_CHART = "NUMBYPERSON_CHART";
export const CONTENTPROJECT_CHART = "CONTENTPROJECT_CHART";
export const CONTENTPERSON_CHART = "CONTENTPERSON_CHART";
export const HEADER_DATA = "HEADER_DATA";
export const BARPRO_LIST = "BARPRO_LIST";
export const PROJECT_LIST = "PROJECT_LIST";
export const TASK_AGENTBOTTOM = "TASK_AGENTBOTTOM";

// 左侧 全部项目列表
export function getProjectListByTypeTag(param, fn) {
  return dispatch => {
    HttpClient.AjaxPost("/project/getProjectResult", param, list => {
      if (fn) {
        fn(list);
      }
      dispatch({
        type: "SORT_DATA",
        payload: list
      });
    });
  };
}

// 获取头部和 任务分布统计数据
export function getProjectStatistics(param = {}, fn) {
  return dispatch => {
    HttpClient.AjaxPost("/project/getStatisticsIndex", param, list => {
      if (fn) {
        fn(list);
      }
      dispatch({
        type: "TASK_AGENT",
        payload: list
      });
    });
  };
}
// 获取头部和 任务分布统计数据最后面三个
export function getLeftContent(param = {}, fn) {
  return dispatch => {
    HttpClient.AjaxPost("/calculate/getLeftContent", param, list => {
      if (fn) {
        fn(list);
      }
      dispatch({
        type: "TASK_AGENTBOTTOM",
        payload: list
      });
    });
  };
}
//待办统计 按项目
export function getPendByProject(data = {}, callback) {
  return dispatch => {
    HttpClient.AjaxPost("/calculate/getPendByProject", data, list => {
      dispatch({
        type: BARPRO_LIST,
        payload: list
      });
    });
  };
}

//根据项目id查询待办统计（按人员）
export function getPendStatistics(projectIds = {}, callback) {
  return dispatch => {
    HttpClient.AjaxPost("/calculate/getPendStatistics", projectIds, list => {
      if (callback) callback(list);
      dispatch({
        type: TASKPEND_LIST,
        payload: list
      });
    });
  };
}

//绩效按项目
// export function getNumByProject(data) {
//   return {
//     type: TASKNUM_LIST,
//     payload: data
//   };
// }

//绩效按项目
export function getNumByProject(
  type,
  projectIds = undefined,
  attdate01,
  attdate02,
  callback
) {
  return dispatch => {
    HttpClient.AjaxPost(
      "/calculate/getNumByProject",
      { type, projectIds, attdate01, attdate02 },
      list => {
        if (callback) callback(list);
        dispatch({
          type: TASKNUM_LIST,
          payload: list && list.taskNumList
        });
      }
    );
  };
}

//绩效按人员taskPersonList
export function getNumByPerson(
  type,
  projectIds = undefined,
  attdate01,
  attdate02,
  callback
) {
  return dispatch => {
    HttpClient.AjaxPost(
      "/calculate/getNumByPerson",
      { type, projectIds, attdate01, attdate02 },
      list => {
        if (callback) callback(list);
        dispatch({
          type: TASKPERSON_LIST,
          payload: list && list.taskNumList
        });
      }
    );
  };
}

// export function getNumByPerson(data) {
//   return {
//     type: TASKPERSON_LIST,
//     payload: data
//   };
// }

//根据项目id查询 绩效统计(绩效值) 按项目

export function getContentByProject(
  type,
  projectIds = undefined,
  attdate01,
  attdate02,
  callback
) {
  return dispatch => {
    HttpClient.AjaxPost(
      "/calculate/getContentByProject",
      { type, projectIds, attdate01, attdate02 },
      list => {
        if (callback) callback(list);
        dispatch({
          type: PERFORMACNCEPRO_LIST,
          payload: list && list.taskContentList
        });
      }
    );
  };
}
//根据项目id查询 绩效统计(绩效值) 按人员
export function getContentByPerson(
  type,
  projectIds = undefined,
  attdate01,
  attdate02,
  callback
) {
  return dispatch => {
    HttpClient.AjaxPost(
      "/calculate/getContentByPerson",
      { projectIds, attdate01, attdate02, type },
      list => {
        if (callback) callback(list);
        dispatch({
          type: PRERFORMANCEPER_LIST,
          payload: list && list.tasContentList
        });
      }
    );
  };
}
//查询全部projectId
export function getProjectList(type = "1", labelId = [], callback) {
  return dispatch => {
    HttpClient.AjaxPost(
      "/project/getProjectResult",
      { type, labelId },
      list => {
        if (callback) callback(list);
        let newArr = [];
        list.projectList &&
          list.projectList.map(item => {
            newArr.push(item.id);
          });
        dispatch({
          type: PROJECT_LIST,
          payload: newArr
        });
      }
    );
  };
}
//绩效绩效值按项目统计performancePro
// export function getContentByProject(data) {
//   return {
//     type: PERFORMACNCEPRO_LIST,
//     payload: data
//   };
// }
//绩效统计绩效值按人员performancePer
// export function getContentByPerson(data) {
//   return {
//     type: PRERFORMANCEPER_LIST,
//     payload: data
//   };
// }
//项目待办按人员taskPendList
export function setTaskPendList(data) {
  return {
    type: TASKPEND_CHART,
    payload: data
  };
}
//绩效按项目taskNumList
export function setNumByProjectList(data) {
  return {
    type: NUMBYPROJECT_CHART,
    payload: data
  };
}
//绩效按人员getNumByPerson
export function setNumByPersonList(data) {
  return {
    type: NUMBYPERSON_CHART,
    payload: data
  };
}
//绩效按项目统计getContentByProject
export function setContentByProjectList(data) {
  return {
    type: CONTENTPROJECT_CHART,
    payload: data
  };
}
//绩效统计绩效值按人员getContentByPerson
export function setContentByPersonList(data) {
  return {
    type: CONTENTPERSON_CHART,
    payload: data
  };
}
//头部统计数据
export function setHeaderData(data) {
  return {
    type: HEADER_DATA,
    payload: data
  };
}
