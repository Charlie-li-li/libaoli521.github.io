export const PROJECT_SEARCH = "PROJECT_SEARCH";
export const STATE_CHART = "STATE_CHART";
export const PROJECT_CHART = "PROJECT_CHART";
export const PROJECT_PROGESS_CHART = "PROJECT_PROGESS_CHART";

// 项目筛选条件
export function setProjectSeachVal(data) {
  return {
    type: PROJECT_SEARCH,
    payload: data
  };
}
//项目待办按状态统计
export function setStateVal(data) {
  return {
    type: STATE_CHART,
    payload: data
  };
}
//项目待办按项目统计
export function setProjectVal(data) {
  return {
    type: PROJECT_CHART,
    payload: data
  };
}
//项目进展统计
export function setProjectProgessVal(data) {
  return {
    type: PROJECT_PROGESS_CHART,
    payload: data
  };
}
