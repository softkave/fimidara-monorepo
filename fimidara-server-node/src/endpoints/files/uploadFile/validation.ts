import Joi from 'joi';
import {kValidationSchemas} from '../../../utils/validationUtils.js';
import fileValidationSchemas from '../validation.js';
import {UploadFileEndpointParams} from './types.js';

export const uploadFileJoiSchema = Joi.object<UploadFileEndpointParams>()
  .keys({
    ...fileValidationSchemas.fileMatcherParts,
    data: fileValidationSchemas.readable.required(),
    size: fileValidationSchemas.fileSizeInBytes.required(),
    description: kValidationSchemas.description.allow(null, ''),
    mimetype: fileValidationSchemas.mimetype.allow(null, ''),
    encoding: fileValidationSchemas.encoding.allow(null),
    clientMultipartId: fileValidationSchemas.clientMultipartId,
    part: fileValidationSchemas.part,
    append: Joi.boolean().optional(),
    onAppendCreateIfNotExists: Joi.boolean().optional().default(false),
  })
  .custom((value, helpers) => {
    // Append cannot be used with multipart uploads
    if (value.append === true && value.clientMultipartId) {
      return helpers.error('any.invalid', {
        message: 'Append operation cannot be used with multipart uploads',
      });
    }
    return value;
  })
  .required();
