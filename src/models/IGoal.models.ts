export interface IGoal {
  id: number;
  uuid: string;
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  status: string;
}
