import User, { IUserDocument } from '../models/user.model';
import { IUserCreate, IUserUpdate } from '../types/user.types';
import { AppError } from '../utils/appError';

export class UserService {
  // Get all users
  static async getAllUsers(): Promise<IUserDocument[]> {
    return await User.find();
  }

  // Get user by ID
  static async getUserById(id: string): Promise<IUserDocument> {
    const user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  // Create user
  static async createUser(userData: IUserCreate): Promise<IUserDocument> {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    return await User.create(userData);
  }

  // Update user
  static async updateUser(id: string, userData: IUserUpdate): Promise<IUserDocument> {
    const user = await User.findByIdAndUpdate(
      id,
      userData,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    return user;
  }

  // Delete user
  static async deleteUser(id: string): Promise<void> {
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
  }
}