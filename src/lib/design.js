// 设计台常量：统一任务表的阶段、优先级、标签

// 统一三阶段（排期任务 / 手动需求共用）
export const TASK_STAGE = {
  todo:  { key: 'todo',  label: '待办',   color: 'orange', dot: '#f59e0b' },
  doing: { key: 'doing', label: '进行中', color: 'blue',   dot: '#3b6ef6' },
  done:  { key: 'done',  label: '已完成', color: 'green',  dot: '#22c55e' },
}
export const TASK_STAGES = ['todo', 'doing', 'done']
export function stageMeta(k) { return TASK_STAGE[k] || TASK_STAGE.todo }

// 运营排期在设计台里的固定标签（自动派单）
export const AUTO_TAG = '运营自动'
// 初始标签集合（可在新增需求时扩展）
export const BASE_TAGS = ['运营自动', '社媒', '物料设计']

// 排期 design_status <-> 统一阶段
export const PLAN_TO_STAGE = { pending: 'todo', doing: 'doing', done: 'done' }
export const STAGE_TO_PLAN = { todo: 'pending', doing: 'doing', done: 'done' }

// 标签配色（Badge 仅支持 slate/blue/green/orange/red）
export function tagColor(tag) {
  if (tag === AUTO_TAG) return 'blue'
  if (tag === '社媒') return 'orange'
  if (tag === '物料设计') return 'slate'
  return 'slate'
}

// 优先级
export const PRIORITY = {
  low:    { key: 'low',    label: '低', color: 'slate' },
  normal: { key: 'normal', label: '中', color: 'blue' },
  high:   { key: 'high',   label: '高', color: 'red' },
}
export const PRIORITY_LIST = Object.values(PRIORITY)
export function priorityMeta(k) { return PRIORITY[k] || PRIORITY.normal }
