import { combineReducers } from "redux";
import project from "./project";
import task from "./task";
import statistics from "./statistics";
const rootReducer = combineReducers({
  project,
  task,
  statistics
});

export default rootReducer;
