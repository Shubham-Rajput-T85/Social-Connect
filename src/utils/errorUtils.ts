// utils/AppError.ts
export class AppError extends Error {
    statusCode?: number;
    data?: any;
  
    constructor(message: string, statusCode?: number, data?: any) {
      super(message);
      this.statusCode = statusCode;
      this.data = data;
      Object.setPrototypeOf(this, AppError.prototype);
    }
  }
  