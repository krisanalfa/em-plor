import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { IAccount } from "@em-plor/contracts";

export const useAuth = () => {
  const [authenticate, { data: authData, loading, error }] = useMutation<
    { login: { token: string } },
    { email: string; password: string }
  >(gql`
    mutation Login($email: String!, $password: String!) {
      login(credentials: { email: $email, password: $password }) {
        token
      }
    }
  `);

  const storeToken = (token: string) => {
    localStorage.setItem("auth-token", token);
  };

  const getToken = () => {
    return localStorage.getItem("auth-token");
  };

  return {
    authenticate,
    token: authData?.login.token,
    loading,
    error,
    storeToken,
    getToken,
  };
};

export const useProfile = () => {
  const { refetch: whoami, data } = useQuery<{ whoami: IAccount }>(
    gql`
      query WhoAmI {
        whoami {
          email
          employee {
            name
          }
        }
      }
    `,
    {
      fetchPolicy: "network-only",
    },
  );

  return {
    whoami,
    account: data?.whoami,
  };
};
