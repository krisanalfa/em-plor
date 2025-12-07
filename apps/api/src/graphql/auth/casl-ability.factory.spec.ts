import { Test } from '@nestjs/testing';
import { CaslAbilityFactory } from './casl-ability.factory';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Role, EmployeeInput, Action } from '@em-plor/contracts';
import { PositionEntity } from 'src/db/entities';
import { EmployeeModel } from '../models';

describe('CaslAbilityFactory', () => {
  let caslAbilityFactory: CaslAbilityFactory;
  let positionRepositoryMock: Partial<Repository<PositionEntity>>;

  const mockPositions: PositionEntity[] = [
    {
      id: 'pos-1',
      name: 'Junior Developer',
      rankIndex: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      employees: [],
    },
    {
      id: 'pos-2',
      name: 'Senior Developer',
      rankIndex: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      employees: [],
    },
    {
      id: 'pos-3',
      name: 'Team Lead',
      rankIndex: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
      employees: [],
    },
    {
      id: 'pos-4',
      name: 'Manager',
      rankIndex: 4,
      createdAt: new Date(),
      updatedAt: new Date(),
      employees: [],
    },
  ];

  beforeEach(async () => {
    const PositionRepositoryMock = jest.fn<
      Partial<Repository<PositionEntity>>,
      unknown[]
    >(() => ({
      find: jest.fn().mockReturnValue(mockPositions),
    }));

    const module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(PositionEntity),
          useClass: PositionRepositoryMock,
        },
        CaslAbilityFactory,
      ],
    }).compile();

    caslAbilityFactory = module.get<CaslAbilityFactory>(CaslAbilityFactory);
    positionRepositoryMock = module.get(getRepositoryToken(PositionEntity));
  });

  it('should be defined', () => {
    expect(caslAbilityFactory).toBeDefined();
  });

  describe('createForEmployee', () => {
    describe(Role.ADMIN, () => {
      const adminAccount = {
        id: 'admin-1',
        email: 'admin@example.com',
        role: Role.ADMIN,
        password: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      it.each([
        [Action.Manage, 'all'],
        [Action.Create, 'all'],
        [Action.Read, 'all'],
        [Action.Update, 'all'],
        [Action.Delete, 'all'],
      ])(
        'should grant admin %s access to %s resources',
        async (action, subject) => {
          const ability = await caslAbilityFactory.create(adminAccount);
          expect(ability.can(action, subject)).toBe(true);
        },
      );

      it('should allow admin to read EmployeeModel', async () => {
        const ability = await caslAbilityFactory.create(adminAccount);
        expect(ability.can(Action.Read, new EmployeeModel())).toBe(true);
      });
    });

    describe(Role.MANAGER, () => {
      const managerAccount = {
        id: 'manager-1',
        email: 'manager@example.com',
        role: Role.MANAGER,
        password: 'hashed',
        employee: {
          id: 'emp-1',
          name: 'Manager Name',
          departmentId: 'dept-1',
          positionId: 'pos-4',
          position: mockPositions[3],
          dob: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      it('should allow manager to read EmployeeModel', async () => {
        const ability = await caslAbilityFactory.create(managerAccount);
        expect(ability.can(Action.Read, new EmployeeModel())).toBe(true);
      });

      it.each([
        ['pos-1', 'Junior Developer', 1],
        ['pos-2', 'Senior Developer', 2],
        ['pos-3', 'Team Lead', 3],
      ])(
        'should allow manager to update EmployeeInput with lower rank position %s (%s, rank %i)',
        async (positionId) => {
          const ability = await caslAbilityFactory.create(managerAccount);

          const input = Object.assign(new EmployeeInput(), {
            departmentId: 'dept-1',
            positionId,
          });
          expect(ability.can(Action.Update, input)).toBe(true);
        },
      );

      it('should not allow manager to update EmployeeInput with same or higher rank positions', async () => {
        const ability = await caslAbilityFactory.create(managerAccount);

        const input = Object.assign(new EmployeeInput(), {
          departmentId: 'dept-1',
          positionId: 'pos-4', // Manager (rank 4 = 4)
        });
        expect(ability.can(Action.Update, input)).toBe(false);
      });

      it('should not allow manager to update EmployeeInput in different department', async () => {
        const ability = await caslAbilityFactory.create(managerAccount);

        const input = Object.assign(new EmployeeInput(), {
          departmentId: 'dept-2', // Different department
          positionId: 'pos-1',
        });
        expect(ability.can(Action.Update, input)).toBe(false);
      });

      it('should fetch positions from repository', async () => {
        await caslAbilityFactory.create(managerAccount);

        expect(positionRepositoryMock.find).toHaveBeenCalled();
      });
    });

    describe(Role.EMPLOYEE, () => {
      const employeeAccount = {
        id: 'emp-account-1',
        email: 'employee@example.com',
        role: Role.EMPLOYEE,
        password: 'hashed',
        employee: {
          id: 'emp-1',
          name: 'Employee Name',
          departmentId: 'dept-1',
          positionId: 'pos-1',
          dob: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      it('should allow employee to read EmployeeModel', async () => {
        const ability = await caslAbilityFactory.create(employeeAccount);
        expect(ability.can(Action.Read, new EmployeeModel())).toBe(true);
      });

      it.each([
        ['emp-1', true, 'own'],
        ['emp-2', false, 'other'],
      ])(
        'should %s allow employee to update %s employee EmployeeModel (id: %s)',
        async (employeeId, expected) => {
          const ability = await caslAbilityFactory.create(employeeAccount);

          const employee = new EmployeeModel();
          employee.id = employeeId;

          expect(ability.can(Action.Update, employee)).toBe(expected);
        },
      );

      it.each([
        ['pos-1', 'dept-1', true, 'same position and department'],
        ['pos-2', 'dept-1', false, 'different position'],
        ['pos-1', 'dept-2', false, 'different department'],
      ])(
        'should correctly handle employee updating EmployeeInput with %s (positionId: %s, departmentId: %s, expected: %s)',
        async (positionId, departmentId, expected) => {
          const ability = await caslAbilityFactory.create(employeeAccount);

          const input = Object.assign(new EmployeeInput(), {
            positionId,
            departmentId,
          });
          expect(ability.can(Action.Update, input)).toBe(expected);
        },
      );
    });
  });
});
