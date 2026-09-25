import { forEach, map } from "lodash-es";
import {
  isMfdocCustomType,
  isMfdocFieldArray,
  isMfdocFieldBinary,
  isMfdocFieldBoolean,
  isMfdocFieldDate,
  isMfdocFieldNull,
  isMfdocFieldNumber,
  isMfdocFieldObject,
  isMfdocFieldOrCombination,
  isMfdocFieldString,
  isMfdocFieldUndefined,
  MfdocFieldObjectTypePrimitive,
} from "mfdoc/mfdoc-core";
import React from "react";
import { cn } from "../utils.ts";
import FieldDescription from "./FieldDescription";
import { useContainedFieldObjects } from "./hooks";
import { getTypeNameID } from "./utils";

export interface FieldObjectAsJsonProps {
  fieldObject: MfdocFieldObjectTypePrimitive<any>;
  propName?: string;
  isForJsSdk?: boolean;
}

const FieldObjectAsJson: React.FC<FieldObjectAsJsonProps> = (props) => {
  const { fieldObject, propName, isForJsSdk } = props;
  const objectsToProcess = useContainedFieldObjects({ fieldObject });
  const nodes = React.useMemo(() => {
    const nodes: React.ReactNode[] = [];
    let counter = 0;
    objectsToProcess.forEach((nextObject, index) => {
      nodes.push(
        renderFieldObjectAsJson(
          nextObject,
          isForJsSdk || false,
          nextObject === fieldObject ? propName : undefined,
          nextObject.name || counter++
        )
      );
    });

    return nodes;
  }, [objectsToProcess, isForJsSdk, fieldObject, propName]);

  return <React.Fragment>{nodes}</React.Fragment>;
};

export default FieldObjectAsJson;

export function renderJsonFieldType(
  data: any,
  isForJsSdk: boolean
): React.ReactNode {
  if (isMfdocFieldString(data)) {
    return "string";
  } else if (isMfdocFieldNumber(data)) {
    return "number";
  } else if (isMfdocFieldBoolean(data)) {
    return "boolean";
  } else if (isMfdocFieldNull(data)) {
    return "null";
  } else if (isMfdocFieldUndefined(data)) {
    return "undefined";
  } else if (isMfdocFieldDate(data)) {
    return "number";
  } else if (isMfdocFieldArray(data)) {
    if (!data.type) return "[]";
    const containedTypeNode = renderJsonFieldType(data.type, isForJsSdk);
    return (
      <span>
        Array{"<"}
        {containedTypeNode}
        {">"}
      </span>
    );
  } else if (isMfdocFieldObject(data)) {
    return data.name ? (
      <a href={`#${getTypeNameID(data.name)}`} className="underline">
        {data.name}
      </a>
    ) : null;
  } else if (isMfdocFieldOrCombination(data)) {
    if (!data.types) return "";
    const nodes: React.ReactNode[] = [];
    forEach(data.types, (nextType, index) => {
      if (Number(index) > 0) nodes.push(" | ");
      nodes.push(renderJsonFieldType(nextType, isForJsSdk));
    });
    return nodes;
  } else if (isMfdocFieldBinary(data)) {
    if (isForJsSdk)
      return (
        <span>
          {isForJsSdk ? <span>string</span> : <code>string</code>}|{" "}
          <a
            href="https://nodejs.org/api/stream.html#class-streamreadable"
            className="underline"
          >
            {isForJsSdk ? <span>Readable</span> : <code>Readable</code>}|{" "}
          </a>{" "}
          |{" "}
          <a
            href="https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream"
            className="underline"
          >
            {isForJsSdk ? (
              <span>ReadableStream</span>
            ) : (
              <code>ReadableStream</code>
            )}
          </a>
        </span>
      );
    return "binary";
  } else if (isMfdocCustomType(data)) {
    if (data.descriptionLink) {
      return (
        <a href={data.descriptionLink} className="underline">
          {data.name}
        </a>
      );
    } else {
      return data.name;
    }
  }

  return "unknown";
}

function renderFieldObjectAsJson(
  nextObject: MfdocFieldObjectTypePrimitive<any>,
  isForJsSdk: boolean,
  propName: string | undefined,
  key: string | number
) {
  const rows = map(nextObject.fields, (fieldbase, key) => {
    const keyNode = <span>{key}</span>;
    const typeNode = renderJsonFieldType(fieldbase.data, isForJsSdk);
    const separator = fieldbase.required ? ":" : "?:";
    return (
      <div className="mx-4" key={key}>
        {keyNode}
        {separator} {typeNode}
      </div>
    );
  });

  return (
    <div className="flex flex-col gap-2" key={key}>
      <div className="space-x-2 flex">
        {propName && <code>{propName}</code>}
        {nextObject.name && (
          <h5 id={getTypeNameID(nextObject.name)} className="text-secondary">{nextObject.name}</h5>
        )}
      </div>
      <FieldDescription fieldbase={nextObject} type="secondary" className="my-0" />
      <div
        className={cn("p-4 rounded font-mono text-sm bg-gray-100 w-full")}
      >
        &#123;
        {rows}
        &#125;
      </div>
    </div>
  );
}
