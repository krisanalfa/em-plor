import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  IEmployee,
  IEmployeeInput,
  SortableEmployeeField,
} from "@em-plor/contracts";

const EMPLOYEE_FRAGMENT = gql`
  fragment EmployeeFragment on EmployeeModel {
    id
    name
    dob
    accountId
    account {
      email
    }
    departmentId
    department {
      name
    }
    positionId
    position {
      name
    }
    attendances {
      date
      checkInTime
      checkOutTime
    }
    histories {
      id
      position {
        name
      }
      department {
        name
      }
      startDate
      endDate
    }
    reportsTo {
      id
      name
    }
  }
`;

export const useGetEmployees = () => {
  const {
    refetch: fetchEmployees,
    data,
    loading,
    error,
  } = useQuery<
    {
      employees: {
        total: number;
        totalPage: number;
        items: IEmployee[];
      };
    },
    {
      skip?: number;
      take?: number;
      filter?: string;
      sortby?: SortableEmployeeField;
    }
  >(
    gql`
      query Employees(
        $skip: Float
        $take: Float
        $filter: String
        $sortby: SortableEmployeeField
      ) {
        employees(skip: $skip, take: $take, filter: $filter, sortby: $sortby) {
          total
          totalPage
          items {
            ...EmployeeFragment
          }
        }
      }

      ${EMPLOYEE_FRAGMENT}
    `,
    {
      variables: {
        skip: 0,
        take: 15,
        filter: "",
        sortby: SortableEmployeeField.NAME,
      },
      fetchPolicy: "network-only",
    },
  );

  return {
    fetchEmployees,
    data: data?.employees,
    loading,
    error,
  };
};

export const useGetEmployee = (id: string, options?: { skip?: boolean }) => {
  const {
    data: employeeData,
    loading: isFetchingEmployee,
    error: fetchEmployeeError,
    refetch,
  } = useQuery<{ employee: IEmployee }, { id: string }>(
    gql`
      query Employee($id: ID!) {
        employee(id: $id) {
          ...EmployeeFragment
        }
      }

      ${EMPLOYEE_FRAGMENT}
    `,
    {
      variables: { id },
      fetchPolicy: "network-only",
      skip: options?.skip || !id,
    },
  );

  return {
    employee: employeeData?.employee,
    isFetchingEmployee,
    fetchEmployeeError,
    refetchEmployee: refetch,
  };
};

export const useUpdateEmployee = () => {
  const [
    updateEmployeeMutation,
    {
      data: updatedEmployeeData,
      loading: isUpdatingEmployee,
      error: updateEmployeeError,
      reset,
    },
  ] = useMutation<
    { updateEmployee: IEmployee },
    IEmployeeInput & { id: string }
  >(gql`
    mutation UpdateEmployee(
      $id: ID!
      $email: String!
      $name: String!
      $dob: DateTime!
      $accountId: ID!
      $departmentId: ID!
      $positionId: ID!
    ) {
      updateEmployee(
        id: $id
        employee: {
          email: $email
          name: $name
          dob: $dob
          accountId: $accountId
          departmentId: $departmentId
          positionId: $positionId
        }
      ) {
        ...EmployeeFragment
      }
    }

    ${EMPLOYEE_FRAGMENT}
  `);

  const updateEmployee = (id: string, input: IEmployeeInput) =>
    updateEmployeeMutation({ variables: { id, ...input } });

  return {
    updateEmployee,
    updatedEmployee: updatedEmployeeData?.updateEmployee,
    isUpdatingEmployee,
    updateEmployeeError,
    resetUpdateEmployee: reset,
  };
};

export const useCreateEmployee = () => {
  const [
    createEmployeeMutation,
    {
      data: createdEmployeeData,
      loading: isCreatingEmployee,
      error: createEmployeeError,
      reset,
    },
  ] = useMutation<
    { createEmployee: IEmployee },
    Omit<IEmployeeInput, "accountId">
  >(gql`
    mutation CreateEmployee(
      $email: String!
      $name: String!
      $dob: DateTime!
      $departmentId: ID!
      $positionId: ID!
    ) {
      createEmployee(
        employee: {
          email: $email
          name: $name
          dob: $dob
          departmentId: $departmentId
          positionId: $positionId
        }
      ) {
        ...EmployeeFragment
      }
    }

    ${EMPLOYEE_FRAGMENT}
  `);

  const createEmployee = (input: Omit<IEmployeeInput, "accountId">) =>
    createEmployeeMutation({ variables: { ...input } });

  return {
    createEmployee,
    createdEmployee: createdEmployeeData?.createEmployee,
    isCreatingEmployee,
    createEmployeeError,
    resetCreateEmployee: reset,
  };
};
