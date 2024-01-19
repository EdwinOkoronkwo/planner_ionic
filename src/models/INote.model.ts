export interface INote {
  id: number;
  uuid: string;
  name: string;
  details: string;
  taskId: number;
  taskEndDate: Date;
  importance: string;
}
