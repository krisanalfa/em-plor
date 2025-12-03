export enum Role {
  /**
   * Administrator with full access
   */
  ADMIN = "ADMIN",

  /**
   * Manager with limited access.
   * Only manage employees.
   */
  MANAGER = "MANAGER",

  /**
   * Regular employee with basic access.
   * Can only view and manage their own data.
   */
  EMPLOYEE = "EMPLOYEE",
}

export enum SortableEmployeeField {
  NAME = "NAME",
  JOIN_DATE_ASC = "JOIN_DATE_ASC",
  JOIN_DATE_DESC = "JOIN_DATE_DESC",
}

interface IHasId {
  id: string;
}

interface ITimestamped {
  createdAt: Date;
  updatedAt: Date;
}

export interface IAccount extends IHasId, ITimestamped {
  email: string;
  password: string;
  role: Role;
  employee?: IEmployee;
}

export interface IDepartment extends IHasId, ITimestamped {
  name: string;
  employees?: IEmployee[];
}

export interface IPosition extends IHasId, ITimestamped {
  name: string;
  employees?: IEmployee[];
}

export interface IEmployee extends IHasId, ITimestamped {
  name: string;
  dob: Date;

  departmentId: string;
  department?: IDepartment;

  positionId: string;
  position?: IPosition;

  /**
   * Employee's account ID.
   * If this is not set, the employee cannot log in.
   */
  accountId?: string;
  account?: IAccount;

  /**
   * ID of the manager this employee reports to.
   * If not set, the employee has no manager.
   */
  reportsToId?: string;
  reportsTo?: IEmployee;

  attendances?: IEmployeeAttendance[];

  histories?: IEmployeeHistory[];
}

export interface IEmployeeAttendance extends IHasId, ITimestamped {
  employeeId: string;
  employee?: IEmployee;

  date: Date;
  checkInTime: Date;

  /**
   * If not set, the employee has not checked out yet.
   */
  checkOutTime?: Date;
}

export interface IEmployeeHistory extends IHasId, ITimestamped {
  employeeId: string;
  employee?: IEmployee;

  positionId: string;
  position?: IPosition;

  departmentId: string;
  department?: IDepartment;

  startDate: Date;

  /**
   * If not set, the history is ongoing.
   */
  endDate?: Date;
}

export interface IEmployeeInput {
  email: string;
  name: string;
  dob: Date;
  accountId?: string;
  departmentId?: string;
  positionId?: string;
}