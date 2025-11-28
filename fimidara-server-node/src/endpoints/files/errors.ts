import OperationError, {
  getErrorMessageFromParams,
  OperationErrorParameters,
} from '../../utils/OperationError.js';
import {kEndpointConstants} from '../constants.js';

export class FileNotWritableError extends OperationError {
  name = 'FileNotWritableError';
  statusCode = kEndpointConstants.httpStatusCode.conflict;
  constructor(props?: OperationErrorParameters | string) {
    super(props);
    this.message = getErrorMessageFromParams(
      props,
      'File not writable because it is currently being written to.'
    );
  }
}

export class RangeNotSatisfiableError extends OperationError {
  name = 'RangeNotSatisfiableError';
  statusCode = kEndpointConstants.httpStatusCode.rangeNotSatisfiable;
  fileSize?: number;

  constructor(
    props?: (OperationErrorParameters & {fileSize?: number}) | string
  ) {
    super(props);
    if (typeof props === 'object' && props !== null && 'fileSize' in props) {
      this.fileSize = props.fileSize;
      this.value = JSON.stringify({fileSize: props.fileSize});
    }
    this.message = getErrorMessageFromParams(
      props,
      'The requested range is not satisfiable.'
    );
  }
}
