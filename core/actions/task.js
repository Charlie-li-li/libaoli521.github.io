
export const TASK_SORT = 'TASK_SORT';

// 任务排序保存默认
export function setTaskSortVal(data) {
    return {
        type: TASK_SORT,
        payload: data
    }
}