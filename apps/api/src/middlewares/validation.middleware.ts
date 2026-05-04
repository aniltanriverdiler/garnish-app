/**
 * Zod şema doğrulama middleware'i.
 * Route handler'lardan önce çalışır ve request body/query/params verilerini
 * belirtilen Zod şemasına karşı doğrular.
 * Geçersiz veri geldiğinde ZodError fırlatır, bu hata error.middleware tarafından
 * alan bazlı mesajlarla 400 yanıtına dönüştürülür.
 * Başarılı parse sonucu req.body/query/params üzerine yazılır (strip + transform uygulanır).
 */

import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

// Validates request data against provided Zod schemas
export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as typeof req.query;
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
