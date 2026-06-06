import Joi from 'joi';
import fileValidationSchemas from '../validation.js';
import {AbortUploadEndpointParams} from './types.js';

export const abortUploadJoiSchema = Joi.object<AbortUploadEndpointParams>()
  .keys({
    ...fileValidationSchemas.fileMatcherParts,
    clientMultipartId: fileValidationSchemas.clientMultipartId,
    part: fileValidationSchemas.part,
  })
  .required();
