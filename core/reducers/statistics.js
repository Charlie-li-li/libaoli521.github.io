import * as types from "../actions/statistics";

const initialState = {
  projectList: [],
  totalData: {},
  totalDataBottom: {},
  taskPendList: [],
  taskNumList: [],
  taskPersonList: [],
  performancePro: [],
  performancePer: [],
  taskPendChart: [],
  NumByProjectChart: [],
  NumByPersonChart: [],
  ContentProjectChart: [],
  ContentPersonChart: [],
  headerData: [],
  barChartProList: [],
  projectListAll: []
};

export default function task(state = initialState, action = {}) {
  switch (action.type) {
    case types.SORT_DATA:
      return Object.assign({}, state, {
        projectList: action.payload.projectList
      });

    case types.TASK_AGENT:
      return Object.assign({}, state, { totalData: action.payload });
    case types.TASK_AGENTBOTTOM:
      return Object.assign({}, state, { totalDataBottom: action.payload.data });

    case types.TASKPEND_LIST:
      return Object.assign({}, state, {
        taskPendList: action.payload
      });

    case types.TASKNUM_LIST:
      return Object.assign({}, state, {
        taskNumList: action.payload
      });

    case types.TASKPERSON_LIST:
      return Object.assign({}, state, {
        taskPersonList: action.payload
      });

    case types.PERFORMACNCEPRO_LIST:
      return Object.assign({}, state, {
        performancePro: action.payload
      });

    case types.PRERFORMANCEPER_LIST:
      return Object.assign({}, state, {
        performancePer: action.payload
      });
    case types.TASKPEND_CHART:
      return Object.assign({}, state, {
        taskPendChart: action.payload
      });
    case types.NUMBYPROJECT_CHART:
      return Object.assign({}, state, {
        NumByProjectChart: action.payload
      });
    case types.NUMBYPERSON_CHART:
      return Object.assign({}, state, {
        NumByPersonChart: action.payload
      });
    case types.CONTENTPROJECT_CHART:
      return Object.assign({}, state, {
        ContentProjectChart: action.payload
      });
    case types.CONTENTPERSON_CHART:
      return Object.assign({}, state, {
        ContentPersonChart: action.payload
      });
    case types.HEADER_DATA:
      return Object.assign({}, state, {
        headerData: action.payload
      });

    case types.BARPRO_LIST:
      return Object.assign({}, state, {
        barChartProList: action.payload
      });
    case types.PROJECT_LIST:
      return Object.assign({}, state, {
        projectListAll: action.payload
      });
    default:
      return state;
  }
}
