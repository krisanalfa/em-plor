import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { IDepartment, IPosition } from "@em-plor/contracts";

export const useConfig = () => {
  const { data, loading } = useQuery<{
    departments: IDepartment[];
    positions: IPosition[];
  }>(gql`
    query Config {
      departments {
        id
        name
      }
      positions {
        id
        name
      }
    }
  `);

  return {
    departments: data?.departments || [],
    positions: data?.positions || [],
    loading,
  };
};
