export interface IUser {
    name: string;
    email: string;
    role: 'user' | 'admin';
    isActive: boolean;
  }
  
  export interface IUserCreate {
    name: string;
    email: string;
    role?: 'user' | 'admin';
  }
  
  export interface IUserUpdate {
    name?: string;
    email?: string;
    role?: 'user' | 'admin';
    isActive?: boolean;
  }