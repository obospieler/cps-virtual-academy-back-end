import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';
import { catchAsync } from '../utils/catchAsync';

export class UserController {
  // Get all users
  static getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const users = await UserService.getAllUsers();
    
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: { users }
    });
  });

  // Get user by ID
  static getUserById = catchAsync(async (req: Request, res: Response) => {
    const user = await UserService.getUserById(req.params.id);
    
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  });

  // Create user
  static createUser = catchAsync(async (req: Request, res: Response) => {
    const user = await UserService.createUser(req.body);
    
    res.status(201).json({
      status: 'success',
      data: { user }
    });
  });

  // Update user
  static updateUser = catchAsync(async (req: Request, res: Response) => {
    const user = await UserService.updateUser(req.params.id, req.body);
    
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  });

  // Delete user
  static deleteUser = catchAsync(async (req: Request, res: Response) => {
    await UserService.deleteUser(req.params.id);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  });
}