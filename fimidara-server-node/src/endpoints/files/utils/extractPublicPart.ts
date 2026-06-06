import {makeExtract, makeListExtract} from 'softkave-js-utils';
import {FilePart} from '../../../definitions/file.js';
import {getFields} from '../../../utils/extract.js';

type PublicPartFields = Pick<FilePart, 'part' | 'size'>;

const extractPartDetailFields = getFields<PublicPartFields>({
  part: true,
  size: true,
});

export const partDetailsExtractor = makeExtract(extractPartDetailFields);
export const partDetailsListExtractor = makeListExtract(
  extractPartDetailFields
);
