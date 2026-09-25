import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import FieldDescription from "./FieldDescription";
import { useContainedFieldObjects } from "./hooks";
import { getTypeNameID } from "./utils";

export interface FieldObjectAsTableProps {
  propName?: string;
  isForJsSdk?: boolean;
  fieldObject: MfdocFieldObjectTypePrimitive<any>;
}

const FieldObjectAsTable: React.FC<FieldObjectAsTableProps> = (props) => {
  const { propName, fieldObject, isForJsSdk } = props;
  const objectsToProcess = useContainedFieldObjects({ fieldObject });
  const nodes = React.useMemo(() => {
    const nodes: React.ReactNode[] = [];
    objectsToProcess.forEach((nextObject, index) => {
      nodes.push(
        renderFieldObjectAsTable(
          nextObject,
          isForJsSdk ?? false,
          index,
          nextObject === fieldObject ? propName : undefined
        )
      );
    });

    return nodes;
  }, [objectsToProcess, fieldObject, isForJsSdk, propName]);

  return <div className="space-y-4">{nodes}</div>;
};

export default FieldObjectAsTable;

type FieldObjectTableColumns = {
  field: string;
  fieldbase: any;
  required?: boolean;
  description?: React.ReactNode;
};

export function renderTableFieldType(
  data: any,
  isForJsSdk: boolean
): React.ReactNode {
  if (isMfdocFieldString(data)) {
    return <code>string</code>;
  } else if (isMfdocFieldNumber(data)) {
    return <code>number</code>;
  } else if (isMfdocFieldBoolean(data)) {
    return <code>boolean</code>;
  } else if (isMfdocFieldNull(data)) {
    return <code>null</code>;
  } else if (isMfdocFieldUndefined(data)) {
    return <code>undefined</code>;
  } else if (isMfdocFieldDate(data)) {
    return <code>number</code>;
  } else if (isMfdocFieldArray(data)) {
    if (!data.type) return "";
    const containedTypeNode = renderTableFieldType(data.type, isForJsSdk);
    return (
      <span className="inline-flex items-center gap-1 leading-none">
        <code>array</code>
        <span className="inline-flex items-center">of</span>
        <span className="inline-flex items-center">{containedTypeNode}</span>
      </span>
    );
  } else if (isMfdocFieldObject(data)) {
    return data.name ? (
      <a
        href={`#${getTypeNameID(data.name)}`}
        className="inline-flex items-center leading-none"
      >
        <code>{data.name}</code>
      </a>
    ) : null;
  } else if (isMfdocFieldOrCombination(data)) {
    if (!data.types) return "";
    const nodes: React.ReactNode[] = [];

    forEach(data.types, (type, typeIndex) => {
      const node = renderTableFieldType(type, isForJsSdk);
      if (nodes.length) {
        nodes.push(
          <span
            key={`sep-${typeIndex}`}
            className="inline-flex items-center"
          >
            or
          </span>,
          <span
            key={`type-${typeIndex}`}
            className="inline-flex items-center"
          >
            {node}
          </span>
        );
      } else {
        nodes.push(
          <span
            key={`type-${typeIndex}`}
            className="inline-flex items-center"
          >
            {node}
          </span>
        );
      }
    });

    return (
      <span className="inline-flex flex-wrap items-center gap-1 leading-none">
        {nodes}
      </span>
    );
  } else if (isMfdocFieldBinary(data)) {
    return (
      <span className="inline-flex flex-col items-center gap-0.5 leading-none">
        <code>string</code>
        <span className="inline-flex items-center">|</span>
        <a
          href="https://nodejs.org/api/stream.html#class-streamreadable"
          className="inline-flex items-center"
        >
          <code>Node.js Readable</code>
        </a>
        <span className="inline-flex items-center">|</span>
        <a
          href="https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream"
          className="inline-flex items-center"
        >
          <code>Browser ReadableStream</code>
        </a>
      </span>
    );
  } else if (isMfdocCustomType(data)) {
    if (data.descriptionLink) {
      return (
        <a
          href={data.descriptionLink}
          className="inline-flex items-center leading-none"
        >
          <code>{data.name}</code>
        </a>
      );
    } else {
      return <code>{data.name}</code>;
    }
  }

  return <code>unknown</code>;
}

function renderFieldObjectAsTable(
  nextObject: MfdocFieldObjectTypePrimitive<any>,
  isForJsSdk: boolean,
  index: number | string | undefined,
  propName?: string
) {
  const rows = map(
    nextObject.fields,
    (fieldbase, key): FieldObjectTableColumns => {
      return {
        field: key,
        fieldbase: fieldbase.data,
        required: fieldbase.required,
        description: fieldbase.data.description,
      };
    }
  );

  return (
    <div key={nextObject.name || index} className="flex flex-col gap-2">
      <div className="space-x-2 flex">
        {propName && <code>{propName}</code>}
        {nextObject.name && (
          <h5 id={getTypeNameID(nextObject.name)} className="text-secondary">
            {nextObject.name}
          </h5>
        )}
      </div>
      <FieldDescription fieldbase={nextObject} style={{ margin: 0 }} />
      <div className="relative left-1/2 w-[100cqw] max-w-[100cqw] -translate-x-1/2 px-4 md:px-8">
        <div className="overflow-hidden rounded-md border">
          <Table className="table-fixed">
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[22%]" />
              <col className="w-[12%]" />
              <col className="w-[44%]" />
            </colgroup>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Required</TableHead>
                <TableHead className="text-muted-foreground">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell className="font-mono whitespace-normal break-all">
                    <code>{row.field}</code>
                  </TableCell>
                  <TableCell className="align-middle whitespace-normal break-words">
                    {renderTableFieldType(row.fieldbase, isForJsSdk)}
                  </TableCell>
                  <TableCell>{row.required ? "Yes" : "No"}</TableCell>
                  <TableCell className="whitespace-normal break-words text-muted-foreground">
                    <FieldDescription fieldbase={row.fieldbase} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
