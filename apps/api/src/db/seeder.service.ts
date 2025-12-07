import { access, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { v4 as uuid } from 'uuid';

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

interface SeedData {
  departments: Array<{
    id: string;
    name: string;
  }>;
  positions: Array<{
    id: string;
    name: string;
    rankIndex: number;
    defaultRole: Role;
  }>;
  genesysAccount: {
    id: string;
    email: string;
    role: Role;
  };
  genesysEmployee: {
    id: string;
    name: string;
    dob: string;
    departmentId: string;
    positionId: string;
    accountId: string;
    reportsToId?: string;
  };
  accounts: Array<{
    id: string;
    email: string;
    role: Role;
  }>;
  employees: Array<{
    id: string;
    name: string;
    dob: string;
    departmentId: string;
    positionId: string;
    accountId: string;
    reportsToId?: string;
  }>;
  attendances: Array<{
    id: string;
    employeeId: string;
    date: string;
    checkInTime: string;
    checkOutTime: string;
  }>;
  histories: Array<{
    id: string;
    employeeId: string;
    positionId: string;
    departmentId: string;
    startDate: string;
  }>;
}

@Injectable()
export class SeederService {
  private readonly jsonFilePath = join(process.cwd(), 'data.json');

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

    if (existingSeedData) {
      Logger.log('Using existing seed data from JSON file', SeederService.name);
      await this.seedFromJson(existingSeedData);
      return;
    }

    Logger.log('Generating new seed data', SeederService.name);

    // Generate departments with stable IDs
    const departmentsData: SeedData['departments'] = [
      { id: uuid(), name: 'Executive' },
      { id: uuid(), name: 'Engineering' },
      { id: uuid(), name: 'Product' },
      { id: uuid(), name: 'Sales' },
      { id: uuid(), name: 'Marketing' },
      { id: uuid(), name: 'Human Resources' },
      { id: uuid(), name: 'Finance' },
      { id: uuid(), name: 'Customer Support' },
      { id: uuid(), name: 'Operations' },
      { id: uuid(), name: 'Legal' },
    ];

    // Generate positions with stable IDs
    const positionsData: SeedData['positions'] = [
      { id: uuid(), name: 'Intern', rankIndex: 0, defaultRole: Role.EMPLOYEE },
      {
        id: uuid(),
        name: 'Junior',
        rankIndex: 1,
        defaultRole: Role.EMPLOYEE,
      },
      {
        id: uuid(),
        name: 'Mid',
        rankIndex: 2,
        defaultRole: Role.EMPLOYEE,
      },
      {
        id: uuid(),
        name: 'Senior',
        rankIndex: 3,
        defaultRole: Role.EMPLOYEE,
      },
      {
        id: uuid(),
        name: 'Lead',
        rankIndex: 4,
        defaultRole: Role.EMPLOYEE,
      },
      {
        id: uuid(),
        name: 'Staff',
        rankIndex: 5,
        defaultRole: Role.EMPLOYEE,
      },
      {
        id: uuid(),
        name: 'Manager',
        rankIndex: 6,
        defaultRole: Role.MANAGER,
      },
      {
        id: uuid(),
        name: 'Senior Manager',
        rankIndex: 7,
        defaultRole: Role.MANAGER,
      },
      {
        id: uuid(),
        name: 'Director',
        rankIndex: 8,
        defaultRole: Role.MANAGER,
      },
      {
        id: uuid(),
        name: 'VP',
        rankIndex: 9,
        defaultRole: Role.MANAGER,
      },
      { id: uuid(), name: 'Chief', rankIndex: 10, defaultRole: Role.MANAGER },
    ];

    // Create departments and positions in database
    const departments = await this.departmentRepository.save(
      departmentsData.map((data) => this.departmentRepository.create(data)),
    );
    const positions = await this.positionRepository.save(
      positionsData.map((data) => this.positionRepository.create(data)),
    );

    // Hash password once instead of 101 times
    const hashedPassword = await this.hashService.encrypt('password');

    // Prepare Genesys admin data with stable IDs
    const genesysAccountId = uuid();
    const genesysEmployeeId = uuid();
    const genesysAccountData = {
      id: genesysAccountId,
      email: 'genesys.admin@example.com',
      role: Role.ADMIN,
    };
    const genesysEmployeeData = {
      id: genesysEmployeeId,
      name: 'Genesys Admin',
      dob: new Date('1991-07-16').toISOString(),
      departmentId: departmentsData[0].id,
      positionId: positionsData[positionsData.length - 1].id,
      accountId: genesysAccountId,
    };

    // Create Genesys admin account and employee in database
    await this.accountRepository.save(
      this.accountRepository.create({
        ...genesysAccountData,
        password: hashedPassword,
      }),
    );
    await this.employeeRepository.save(
      this.employeeRepository.create({
        ...genesysEmployeeData,
        dob: new Date(genesysEmployeeData.dob),
      }),
    );

    // Pre-generate all data with stable IDs
    const accountsData: SeedData['accounts'] = [];
    const employeesData: SeedData['employees'] = [];
    const attendancesData: SeedData['attendances'] = [];
    const historiesData: SeedData['histories'] = [];

    // Generate employees data
    for (let i = 0; i < 100; i++) {
      const employeeId = uuid();
      const accountId = uuid();
      const yearsOld = faker.number.int({ min: 23, max: 55 });
      const dob = faker.date.birthdate({
        mode: 'age',
        min: yearsOld,
        max: yearsOld,
      });

      const selectedDepartment = faker.helpers.arrayElement(departments);
      const selectedPosition = faker.helpers.arrayElement(positions);
      const role = this.determineRoleBasedOnDepartmentAndPosition(
        selectedDepartment,
        selectedPosition,
      );
      const email = faker.internet.email().toLowerCase();

      accountsData.push({ id: accountId, email, role });

      employeesData.push({
        id: employeeId,
        accountId,
        name: faker.person.fullName(),
        dob: dob.toISOString(),
        departmentId: selectedDepartment.id,
        positionId: selectedPosition.id,
      });

      // Generate history for this employee
      historiesData.push({
        id: uuid(),
        employeeId,
        positionId: selectedPosition.id,
        departmentId: selectedDepartment.id,
        startDate: faker.date.past({ years: 2 }).toISOString(),
      });

      // Generate attendances for this employee
      const today = new Date();
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const currentDate = new Date(oneYearAgo);
      while (currentDate <= today) {
        // Skip weekends (Saturday = 6, Sunday = 0)
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
          // 90% chance the employee shows up
          if (faker.datatype.boolean({ probability: 0.9 })) {
            const checkInHour = faker.number.int({ min: 7, max: 10 });
            const checkInMinute = faker.number.int({ min: 0, max: 59 });

            const checkInTime = new Date(currentDate);
            checkInTime.setHours(checkInHour, checkInMinute, 0, 0);

            // Check out time (8-10 hours after check in)
            const workHours = faker.number.int({ min: 8, max: 10 });
            const checkOutTime = new Date(checkInTime);
            checkOutTime.setHours(checkOutTime.getHours() + workHours);

            attendancesData.push({
              id: uuid(),
              employeeId,
              date: new Date(currentDate).toISOString(),
              checkInTime: checkInTime.toISOString(),
              checkOutTime: checkOutTime.toISOString(),
            });
          }
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // Assign reporting relationships based on position hierarchy and department
    this.assignReportingHierarchy(employeesData, positionsData);

    // Save all seed data to JSON file
    await this.saveJsonFile({
      departments: departmentsData,
      positions: positionsData,
      genesysAccount: genesysAccountData,
      genesysEmployee: genesysEmployeeData,
      accounts: accountsData,
      employees: employeesData,
      attendances: attendancesData,
      histories: historiesData,
    });

    // Insert data into database
    await this.insertDataFromSeed(
      {
        departments: departmentsData,
        positions: positionsData,
        genesysAccount: genesysAccountData,
        genesysEmployee: genesysEmployeeData,
        accounts: accountsData,
        employees: employeesData,
        attendances: attendancesData,
        histories: historiesData,
      },
      hashedPassword,
    );

    Logger.log('Database seeded successfully!', SeederService.name);
    Logger.log(
      `Created ${departmentsData.length} departments`,
      SeederService.name,
    );
    Logger.log(`Created ${positionsData.length} positions`, SeederService.name);
    Logger.log(
      `Created ${accountsData.length + 1} accounts (including Genesys admin)`,
      SeederService.name,
    );
    Logger.log(
      `Created ${employeesData.length + 1} employees (including Genesys admin)`,
      SeederService.name,
    );
    Logger.log(
      `Created ${attendancesData.length} attendance records`,
      SeederService.name,
    );
    Logger.log(
      `Created ${historiesData.length} history records`,
      SeederService.name,
    );
  }

  private determineRoleBasedOnDepartmentAndPosition(
    department: DepartmentEntity,
    position: PositionEntity,
  ) {
    if (department.name !== 'Human Resources')
      return position.defaultRole ?? Role.EMPLOYEE;

    // Manager HR or higher has ADMIN role
    if (position.rankIndex >= 6) {
      return Role.ADMIN;
    }

    return Role.EMPLOYEE;
  }

  private async seedFromJson(seedData: SeedData) {
    // Create departments and positions from JSON data
    await this.departmentRepository.save(
      seedData.departments.map((data) =>
        this.departmentRepository.create(data),
      ),
    );
    await this.positionRepository.save(
      seedData.positions.map((data) => this.positionRepository.create(data)),
    );

    // Hash password once
    const hashedPassword = await this.hashService.encrypt('password');

    // Create Genesys admin account and employee from JSON data
    await this.accountRepository.save(
      this.accountRepository.create({
        id: seedData.genesysAccount.id,
        email: seedData.genesysAccount.email,
        role: seedData.genesysAccount.role,
        password: hashedPassword,
      }),
    );
    await this.employeeRepository.save(
      this.employeeRepository.create({
        id: seedData.genesysEmployee.id,
        name: seedData.genesysEmployee.name,
        dob: new Date(seedData.genesysEmployee.dob),
        accountId: seedData.genesysEmployee.accountId,
        departmentId: seedData.genesysEmployee.departmentId,
        positionId: seedData.genesysEmployee.positionId,
        reportsToId: seedData.genesysEmployee.reportsToId,
      }),
    );

    // Insert data from seed
    await this.insertDataFromSeed(seedData, hashedPassword);

    Logger.log('Database seeded from JSON file!', SeederService.name);
    Logger.log(
      `Created ${seedData.departments.length} departments`,
      SeederService.name,
    );
    Logger.log(
      `Created ${seedData.positions.length} positions`,
      SeederService.name,
    );
    Logger.log(
      `Created ${seedData.accounts.length + 1} accounts (including Genesys admin)`,
      SeederService.name,
    );
    Logger.log(
      `Created ${seedData.employees.length + 1} employees (including Genesys admin)`,
      SeederService.name,
    );
    Logger.log(
      `Created ${seedData.attendances.length} attendance records`,
      SeederService.name,
    );
    Logger.log(
      `Created ${seedData.histories.length} history records`,
      SeederService.name,
    );
  }

  private async insertDataFromSeed(
    seedData: SeedData,
    hashedPassword: string,
  ): Promise<void> {
    // Create accounts from JSON data
    const accounts = seedData.accounts.map((data) =>
      this.accountRepository.create({
        id: data.id,
        email: data.email,
        password: hashedPassword,
        role: data.role,
      }),
    );

    await this.accountRepository.save(accounts);

    // Create employees from JSON data (without reportsToId first to avoid FK constraint issues)
    const employees = seedData.employees.map((data) =>
      this.employeeRepository.create({
        id: data.id,
        name: data.name,
        dob: new Date(data.dob),
        accountId: data.accountId,
        departmentId: data.departmentId,
        positionId: data.positionId,
      }),
    );

    await this.employeeRepository.save(employees);

    // Update employees with reporting relationships after all employees are inserted
    await Promise.all(
      seedData.employees.map(async (data) => {
        if (!data.reportsToId) return;

        await this.employeeRepository.update(data.id, {
          reportsToId: data.reportsToId,
        });
      }),
    );

    // Create employee histories from JSON data
    const histories = seedData.histories.map((data) =>
      this.historyRepository.create({
        id: data.id,
        employeeId: data.employeeId,
        positionId: data.positionId,
        departmentId: data.departmentId,
        startDate: new Date(data.startDate),
      }),
    );

    await this.historyRepository.save(histories);

    // Create attendances from JSON data
    const attendances = seedData.attendances.map((data) =>
      this.attendanceRepository.create({
        id: data.id,
        employeeId: data.employeeId,
        date: new Date(data.date),
        checkInTime: new Date(data.checkInTime),
        checkOutTime: new Date(data.checkOutTime),
      }),
    );

    await this.attendanceRepository.save(attendances);
  }

  private async isJsonFileExists(): Promise<boolean> {
    try {
      await access(this.jsonFilePath);
      return true;
    } catch {
      return false;
    }
  }

  private async readJsonFile(): Promise<SeedData | null> {
    const fileExists = await this.isJsonFileExists();
    if (!fileExists) {
      return null;
    }

    const fileContent = await readFile(this.jsonFilePath, 'utf-8');
    return JSON.parse(fileContent) as SeedData;
  }

  private async saveJsonFile(data: SeedData): Promise<void> {
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

  /**
   * Assign reporting hierarchy based on position ranks and departments.
   * Lower rank employees report to higher rank employees in the same department.
   */
  private assignReportingHierarchy(
    employees: SeedData['employees'],
    positions: SeedData['positions'],
  ): void {
    // Create position rank map (higher index = higher rank)
    const positionRankMap = new Map<string, number>();
    positions.forEach((position, index) => {
      positionRankMap.set(position.id, index);
    });

    // Group employees by department
    const employeesByDepartment = new Map<string, SeedData['employees']>();
    employees.forEach((employee) => {
      const dept = employee.departmentId;
      if (!employeesByDepartment.has(dept)) {
        employeesByDepartment.set(dept, []);
      }
      employeesByDepartment.get(dept)!.push(employee);
    });

    // For each department, assign reporting relationships
    employeesByDepartment.forEach((deptEmployees) => {
      // Sort by position rank (descending - highest rank first)
      deptEmployees.sort((a, b) => {
        const rankA = positionRankMap.get(a.positionId) ?? 0;
        const rankB = positionRankMap.get(b.positionId) ?? 0;
        return rankB - rankA;
      });

      // For each employee, find a manager (someone with higher rank in same dept)
      deptEmployees.forEach((employee) => {
        const employeeRank = positionRankMap.get(employee.positionId) ?? 0;

        // Find potential managers (higher rank in same department)
        const potentialManagers = deptEmployees.filter((potentialManager) => {
          const managerRank =
            positionRankMap.get(potentialManager.positionId) ?? 0;
          return (
            potentialManager.id !== employee.id && managerRank > employeeRank
          );
        });

        // If there are potential managers, randomly assign one
        if (potentialManagers.length > 0) {
          const manager = faker.helpers.arrayElement(potentialManagers);
          employee.reportsToId = manager.id;
        }
        // Top-level employees (highest rank) will have no reportsToId
      });
    });
  }
}
