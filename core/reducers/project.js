import * as types from "../actions/project";

const initialState = {
  projectSearchVal: {},
  stateChartVal: {},
  projectChartVal: [],
  projectProgessVal: []
};

export default function project(state = initialState, action = {}) {
  switch (action.type) {
    case types.PROJECT_SEARCH:
      return Object.assign({}, state, { projectSearchVal: action.payload });
    case types.STATE_CHART:
      return Object.assign({}, state, { stateChartVal: action.payload });
    case types.PROJECT_CHART:
      return Object.assign({}, state, { projectChartVal: action.payload });
    case types.PROJECT_PROGESS_CHART:
      return Object.assign({}, state, { projectProgessVal: action.payload });
    default:
      return state;
  }
}
