export interface ITask {
  id: number;
  uuid: string;
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  goalId: number;
  goalName: string;
  status: string;
}

export interface CRUDAction<T> {
  action: 'add' | 'update' | 'delete';
  data: T;
}
