// 设计台常量：排期设计任务状态、需求状态、优先级

// 运营排期 → 设计任务的推进：待设计 -> 设计中 -> 已交付
export const DESIGN_STATUS = {
  pending: { key: 'pending', label: '待设计', color: 'orange', dot: '#f59e0b' },
  doing:   { key: 'doing',   label: '设计中', color: 'blue',   dot: '#3b6ef6' },
  done:    { key: 'done',    label: '已交付', color: 'green',  dot: '#22c55e' },
}
export const DESIGN_COLUMNS = ['pending', 'doing', 'done']
export function designStatusMeta(k) { return DESIGN_STATUS[k] || DESIGN_STATUS.pending }

// 设计师自建需求：待办 -> 进行中 -> 完成
export const REQ_STATUS = {
  todo:  { key: 'todo',  label: '待办',   color: 'slate', dot: '#94a3b8' },
  doing: { key: 'doing', label: '进行中', color: 'blue',  dot: '#3b6ef6' },
  done:  { key: 'done',  label: '已完成', color: 'green', dot: '#22c55e' },
}
export const REQ_COLUMNS = ['todo', 'doing', 'done']
export function reqStatusMeta(k) { return REQ_STATUS[k] || REQ_STATUS.todo }

// 优先级
export const PRIORITY = {
  low:    { key: 'low',    label: '低', color: 'slate' },
  normal: { key: 'normal', label: '中', color: 'blue' },
  high:   { key: 'high',   label: '高', color: 'red' },
}
export const PRIORITY_LIST = Object.values(PRIORITY)
export function priorityMeta(k) { return PRIORITY[k] || PRIORITY.normal }
