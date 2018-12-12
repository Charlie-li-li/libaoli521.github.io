import * as types from '../actions/task';

const initialState = {
	taskSortVal:''
};
export default function task(state = initialState, action = {}) {
	switch (action.type) {  
        case types.TASK_SORT: 
        	return Object.assign({}, state, { taskSortVal : action.payload });
	    default:
            return state;
	}
}

