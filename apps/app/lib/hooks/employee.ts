import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  IEmployee,
  IEmployeeInput,
  SortableEmployeeField,
} from "@em-plor/contracts";

export const useEmployees = () => {
  const {
    refetch: fetchEmployees,
    data,
    loading,
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
          }
        }
      }
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
  };
};

export const useEmployee = (id: string) => {
  const [
    updateEmployee,
    { data: updatedEmployee, loading: isUpdatingEmployee },
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
      }
    }
  `);

  const [
    createEmployee,
    { data: createdEmployee, loading: isCreatingEmployee },
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
      }
    }
  `);

  return {
    updateEmployee: (input: IEmployeeInput) =>
      updateEmployee({ variables: { id, ...input } }),
    employee:
      updatedEmployee?.updateEmployee ?? createdEmployee?.createEmployee,
    loading: isUpdatingEmployee || isCreatingEmployee,
    createEmployee: (input: Omit<IEmployeeInput, "accountId">) => {
      createEmployee({ variables: { ...input } });
    },
  };
};
