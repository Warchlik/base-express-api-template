import type { Request, Response } from 'express';

const UserController = {
  list: (req: Request, res: Response) => { },
  get: (req: Request, res: Response) => { },
  create: (req: Request, res: Response) => { },
  update: (req: Request, res: Response) => { },
  destroy: (req: Request, res: Response) => { },
};

const UserService = {
  getAll: () => { },
  getById: (id: string) => { },
  create: (userData: any) => { },
  update: (id: string, userData: any) => { },
  delete: (id: string) => { },
};

const UserRepository = {
  findAll: () => { },
  findById: (id: string) => { },
  save: (userData: any) => { },
  updateById: (id: string, userData: any) => { },
  deleteById: (id: string) => { },
};

export { UserController, UserRepository, UserService };
