import {validate} from '../../../utils/validate.js';
import {
  getAuthorizedFileForRead,
  getReadFileAgent,
} from './getAuthorizedFileForRead.js';
import {resolveReadRanges} from './resolveReadRanges.js';
import {
  getImageTransformFingerprint,
  hasImageTransformRequest,
  readRawFile,
  readTransformedImage,
} from './serveReadFile.js';
import {ReadFileEndpoint} from './types.js';
import {generateETag} from './utils.js';
import {readFileJoiSchema} from './validation.js';

const readFile: ReadFileEndpoint = async reqData => {
  const data = validate(reqData.data, readFileJoiSchema);
  const agent = await getReadFileAgent(reqData);
  const file = await getAuthorizedFileForRead({
    reqData,
    matcher: data,
    agent,
  });

  const lastModified = file.lastUpdatedAt;
  const fileSize = file.size ?? 0;
  const wantsTransform = hasImageTransformRequest({
    imageResize: data.imageResize,
    imageFormat: data.imageFormat,
  });

  const transformFingerprint = wantsTransform
    ? getImageTransformFingerprint({
        file,
        imageResize: data.imageResize,
        imageFormat: data.imageFormat,
      })
    : undefined;

  const etag = generateETag(lastModified, fileSize, transformFingerprint);
  const ranges = resolveReadRanges({
    ranges: data.ranges,
    rangeHeader: data.rangeHeader,
    ifRangeHeader: data.ifRangeHeader,
    lastModified,
    etag,
    fileSize,
    disableRanges: wantsTransform,
  });

  if (wantsTransform) {
    return readTransformedImage({
      agent,
      file,
      requestId: reqData.requestId,
      lastModified,
      etag,
      imageResize: data.imageResize,
      imageFormat: data.imageFormat,
    });
  }

  return readRawFile({
    agent,
    file,
    requestId: reqData.requestId,
    lastModified,
    etag,
    ranges,
  });
};

export default readFile;
