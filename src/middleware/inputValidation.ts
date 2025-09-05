import { RequestHandler } from 'express';
import { validationResult } from 'express-validator/lib/validation-result';


export const validate: RequestHandler = (req, res, next) => {
  const errors:any = validationResult(req);

  if (!errors.isEmpty()) {
    // If Multer uploaded a file and validation fails, delete the file
    // if (req.file) {
    //   fs.unlinkSync(req.file.path);
    // }
    console.log(errors);
    
    

    return res.status(400).json({
      success: false,
      errors: errors.array().map((err : any) => ({
        field: err.param,
        message: err.msg
      }))
    });

    // const error = new AppError("Invalid or expired token.");
    // error.statusCode = 401;
    // return next(error);

  }

  next();
};
