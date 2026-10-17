import {z} from 'zod';
const text = z.string().trim().min(1).max(80);
const project = z.object({name: text, tasks: z.array(text).max(8)}).strict();
const task = z.object({title: text}).strict();
const login = z.object({username: z.enum(['ana', 'bruno']), password: z.string().min(1).max(128)}).strict();
function parse(schema, value) {
  const result = schema.safeParse(value);
  if (!result.success) throw new Error('schema');
  return result.data;
}
export const parseProject = value => parse(project, value);
export const parseTask = value => parse(task, value);
export const parseLogin = value => parse(login, value);
export const parsePayment = value => parse(z.object({id: z.string().min(1), amount: z.number().finite()}).strict(), value);
