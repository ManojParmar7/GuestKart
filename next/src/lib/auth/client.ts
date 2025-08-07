
'use client';

import type { User } from '@/types/user';

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

const API_URL = 'http://localhost:8000/graphql'; // ✅ Change this to your backend GraphQL URL

async function graphqlRequest(query: string, variables: any = {}, token?: string) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

class AuthClient {
  async signUp(params: SignUpParams): Promise<{ error?: string }> {
    const query = `
      mutation SignUp($firstName: String!, $lastName: String!, $email: String!, $password: String!) {
        signUp(firstName: $firstName, lastName: $lastName, email: $email, password: $password) {
          token
          user {
            id
            email
            firstName
            lastName
          }
        }
      }
    `;

    try {
      const data = await graphqlRequest(query, params);
      localStorage.setItem('custom-auth-token', data.signUp.token);
      return {};
    } catch (err: any) {
      return { error: err.message };
    }
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
   const query = `
    mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        success
        message
        token
        user {
          id
          name
        }
      }
    }
  `;

    try {
      const data = await graphqlRequest(query, params);
      console.log('data: ', data);
      localStorage.setItem('custom-auth-token', data.login.token);
      localStorage.setItem('login_id', data.login.user.id);

      return {};
    } catch (err: any) {
      return { error: err.message };
    }
  }

  async getUser(): Promise<{ data?: any | null; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
        const loginUser = localStorage.getItem('login_id');

    if (!token) return { data: null };

    const query = `
      query GetUser($getUserId: ID!) {
  getUser(id: $getUserId) {
    id
    name
    username
    email
    phone
    website
    password
    role {
      id 
      name
    }
    createdBy
    superadmin_id
    country
    currency
    createdAt
    updatedAt
    token
    image
  }
}
    `;

    try {

 const  variables=    {
  "getUserId":loginUser
}
      const data = await graphqlRequest(query, variables, token);
      console.log('data: ', data);
      return { data: data?.getUser };
    } catch (err: any) {
      return { error: err.message };
    }
  }

  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem('custom-auth-token');
    localStorage.removeItem('login_id');

    return {};
  }

  async resetPassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Password reset not implemented yet.' };
  }

  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Password update not implemented yet.' };
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'OAuth login not implemented yet.' };
  }
}

export const authClient = new AuthClient();
