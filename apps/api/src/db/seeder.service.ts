import { access, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';

import { Role } from '@em-plor/contracts';

import {
  AccountEntity,
  EmployeeEntity,
  DepartmentEntity,
  PositionEntity,
  EmployeeAttendanceEntity,
  EmployeeHistoryEntity,
} from './entities';
import { HashService } from '../hash/hash.service';

@Injectable()
export class SeederService {
  private readonly jsonFilePath = join(process.cwd(), 'employees.json');

  constructor(
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(EmployeeEntity)
    private readonly employeeRepository: Repository<EmployeeEntity>,
    @InjectRepository(DepartmentEntity)
    private readonly departmentRepository: Repository<DepartmentEntity>,
    @InjectRepository(PositionEntity)
    private readonly positionRepository: Repository<PositionEntity>,
    @InjectRepository(EmployeeAttendanceEntity)
    private readonly attendanceRepository: Repository<EmployeeAttendanceEntity>,
    @InjectRepository(EmployeeHistoryEntity)
    private readonly historyRepository: Repository<EmployeeHistoryEntity>,
    private readonly hashService: HashService,
  ) {}

  async seed() {
    // Check if seed data already exists
    const existingSeedData = await this.readJsonFile();

    if (existingSeedData && existingSeedData.length > 0) {
      Logger.log('Using existing seed data from JSON file', SeederService.name);
      await this.seedFromJson(existingSeedData);
      return;
    }

    Logger.log('Generating new seed data', SeederService.name);

    // Create departments and positions in parallel
    const [departments, positions] = await Promise.all([
      this.createDepartments(),
      this.createPositions(),
    ]);

    // Hash password once instead of 101 times
    const hashedPassword = await this.hashService.encrypt('password');

    // Create Genesys admin account and employee
    const genesysAccount = await this.accountRepository.save(
      this.getGenesysAccount(hashedPassword),
    );
    const genesysEmployee = this.getGenesysEmployee();
    genesysEmployee.accountId = genesysAccount.id;
    genesysEmployee.departmentId = departments[0].id;
    genesysEmployee.positionId = positions[positions.length - 1].id;
    await this.employeeRepository.save(genesysEmployee);

    // Pre-generate all accounts and employees data
    const accounts: AccountEntity[] = [];
    const employeesData: Array<{
      name: string;
      email: string;
      dob: string;
      departmentName: string;
      positionName: string;
      role: Role;
    }> = [];

    for (let i = 0; i < 100; i++) {
      const yearsOld = faker.number.int({ min: 23, max: 55 });
      const dob = faker.date.birthdate({
        mode: 'age',
        min: yearsOld,
        max: yearsOld,
      });

      const selectedPosition = faker.helpers.arrayElement(positions);
      const positionIndex = positions.findIndex(
        (p) => p.id === selectedPosition.id,
      );
      const role = positionIndex >= 6 ? Role.MANAGER : Role.EMPLOYEE;
      const email = faker.internet.email().toLowerCase();
      const departmentName = faker.helpers.arrayElement(departments).name;

      accounts.push(
        this.accountRepository.create({
          email,
          password: hashedPassword,
          role,
        }),
      );

      employeesData.push({
        name: faker.person.fullName(),
        email,
        dob: dob.toISOString(),
        departmentName,
        positionName: selectedPosition.name,
        role,
      });
    }

    // Save seed data to JSON file
    await this.saveJsonFile(employeesData);

    // Bulk insert accounts
    const savedAccounts = await this.accountRepository.save(accounts);

    // Create employees with saved account IDs
    const employees = employeesData.map((data, index) => {
      const department = departments.find(
        (d) => d.name === data.departmentName,
      );
      const position = positions.find((p) => p.name === data.positionName);

      return this.employeeRepository.create({
        name: data.name,
        dob: new Date(data.dob),
        accountId: savedAccounts[index].id,
        departmentId: department!.id,
        positionId: position!.id,
      });
    });

    // Bulk insert employees
    const savedEmployees = await this.employeeRepository.save(employees);

    // Create employee histories
    const histories = savedEmployees.map((employee) =>
      this.historyRepository.create({
        employeeId: employee.id,
        positionId: employee.positionId,
        departmentId: employee.departmentId,
        startDate: faker.date.past({ years: 2 }),
      }),
    );

    // Bulk insert histories
    await this.historyRepository.save(histories);

    // Generate 1 year of attendance for each employee
    await this.createAttendances(savedEmployees);

    Logger.log('Database seeded successfully!', SeederService.name);
    Logger.log(`Created ${departments.length} departments`, SeederService.name);
    Logger.log(`Created ${positions.length} positions`, SeederService.name);
    Logger.log(
      `Created ${savedEmployees.length + 1} employees (including Genesys admin)`,
      SeederService.name,
    );
    Logger.log(
      `Created attendance records for the past year`,
      SeederService.name,
    );
  }

  private async seedFromJson(
    seedData: Array<{
      name: string;
      email: string;
      dob: string;
      departmentName: string;
      positionName: string;
      role: Role;
    }>,
  ) {
    // Create departments and positions in parallel
    const [departments, positions] = await Promise.all([
      this.createDepartments(),
      this.createPositions(),
    ]);

    // Hash password once
    const hashedPassword = await this.hashService.encrypt('password');

    // Create Genesys admin account and employee
    const genesysAccount = await this.accountRepository.save(
      this.getGenesysAccount(hashedPassword),
    );
    const genesysEmployee = this.getGenesysEmployee();
    genesysEmployee.accountId = genesysAccount.id;
    genesysEmployee.departmentId = departments[0].id;
    genesysEmployee.positionId = positions[positions.length - 1].id;
    await this.employeeRepository.save(genesysEmployee);

    // Create accounts from JSON data
    const accounts = seedData.map((data) =>
      this.accountRepository.create({
        email: data.email,
        password: hashedPassword,
        role: data.role,
      }),
    );

    const savedAccounts = await this.accountRepository.save(accounts);

    // Create employees from JSON data
    const employees = seedData.map((data, index) => {
      const department = departments.find(
        (d) => d.name === data.departmentName,
      );
      const position = positions.find((p) => p.name === data.positionName);

      return this.employeeRepository.create({
        name: data.name,
        dob: new Date(data.dob),
        accountId: savedAccounts[index].id,
        departmentId: department!.id,
        positionId: position!.id,
      });
    });

    const savedEmployees = await this.employeeRepository.save(employees);

    // Create employee histories
    const histories = savedEmployees.map((employee) =>
      this.historyRepository.create({
        employeeId: employee.id,
        positionId: employee.positionId,
        departmentId: employee.departmentId,
        startDate: faker.date.past({ years: 2 }),
      }),
    );

    await this.historyRepository.save(histories);

    // Generate 1 year of attendance for each employee
    await this.createAttendances(savedEmployees);

    Logger.log('Database seeded from JSON file!', SeederService.name);
    Logger.log(`Created ${departments.length} departments`, SeederService.name);
    Logger.log(`Created ${positions.length} positions`, SeederService.name);
    Logger.log(
      `Created ${savedEmployees.length + 1} employees (including Genesys admin)`,
      SeederService.name,
    );
    Logger.log(
      `Created attendance records for the past year`,
      SeederService.name,
    );
  }

  private async createDepartments(): Promise<DepartmentEntity[]> {
    const departmentNames = [
      'Executive',
      'Engineering',
      'Product',
      'Sales',
      'Marketing',
      'Human Resources',
      'Finance',
      'Customer Support',
      'Operations',
      'Legal',
    ];

    const departments = departmentNames.map((name) =>
      this.departmentRepository.create({ name }),
    );

    return this.departmentRepository.save(departments);
  }

  private async createPositions(): Promise<PositionEntity[]> {
    const positionNames = [
      'Intern',
      'Junior Developer',
      'Developer',
      'Senior Developer',
      'Lead Developer',
      'Staff Engineer',
      'Engineering Manager',
      'Senior Engineering Manager',
      'Director of Engineering',
      'VP of Engineering',
      'CTO',
    ];

    const positions = positionNames.map((name) =>
      this.positionRepository.create({ name }),
    );

    return this.positionRepository.save(positions);
  }

  private async createAttendances(employees: EmployeeEntity[]): Promise<void> {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Generate all workdays once
    const workdays: Date[] = [];
    const currentDate = new Date(oneYearAgo);
    while (currentDate <= today) {
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        workdays.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Batch size for bulk inserts
    const BATCH_SIZE = 500;
    const allAttendances: EmployeeAttendanceEntity[] = [];

    for (const employee of employees) {
      for (const workday of workdays) {
        // 90% chance the employee shows up
        if (faker.datatype.boolean({ probability: 0.9 })) {
          const checkInHour = faker.number.int({ min: 7, max: 10 });
          const checkInMinute = faker.number.int({ min: 0, max: 59 });

          const checkInTime = new Date(workday);
          checkInTime.setHours(checkInHour, checkInMinute, 0, 0);

          // Check out time (8-10 hours after check in)
          const workHours = faker.number.int({ min: 8, max: 10 });
          const checkOutTime = new Date(checkInTime);
          checkOutTime.setHours(checkOutTime.getHours() + workHours);

          allAttendances.push(
            this.attendanceRepository.create({
              employeeId: employee.id,
              date: new Date(workday),
              checkInTime,
              checkOutTime,
            }),
          );
        }
      }
    }

    // Bulk insert in batches to avoid overwhelming the database
    for (let i = 0; i < allAttendances.length; i += BATCH_SIZE) {
      const batch = allAttendances.slice(i, i + BATCH_SIZE);
      await this.attendanceRepository.save(batch);
    }
  }

  private getGenesysEmployee(): EmployeeEntity {
    return this.employeeRepository.create({
      name: 'Genesys Admin',
      dob: new Date('1991-07-16'),
    });
  }

  private getGenesysAccount(hashedPassword: string): AccountEntity {
    return this.accountRepository.create({
      email: 'genesys.admin@example.com',
      password: hashedPassword,
      role: Role.ADMIN,
    });
  }

  private async isJsonFileExists(): Promise<boolean> {
    try {
      await access(this.jsonFilePath);
      return true;
    } catch {
      return false;
    }
  }

  private async readJsonFile(): Promise<
    Array<{
      name: string;
      email: string;
      dob: string;
      departmentName: string;
      positionName: string;
      role: Role;
    }>
  > {
    const fileExists = await this.isJsonFileExists();
    if (!fileExists) {
      return [];
    }

    const fileContent = await readFile(this.jsonFilePath, 'utf-8');
    return JSON.parse(fileContent) as Array<{
      name: string;
      email: string;
      dob: string;
      departmentName: string;
      positionName: string;
      role: Role;
    }>;
  }

  private async saveJsonFile(data: unknown[]): Promise<void> {
    try {
      await writeFile(
        this.jsonFilePath,
        JSON.stringify(data, null, 2),
        'utf-8',
      );
      Logger.log(`Seed data saved to ${this.jsonFilePath}`, SeederService.name);
    } catch (error) {
      Logger.error(`Failed to save seed data to ${this.jsonFilePath}`, error);
    }
  }
}
