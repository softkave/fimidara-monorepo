"use client";

import {
  isMfdocFieldBinary,
  isMfdocFieldObject,
  isMfdocMultipartFormdata,
  MfdocFieldObjectTypePrimitive,
  MfdocHttpEndpointDefinitionTypePrimitive,
} from "mfdoc/mfdoc-core";
import React from "react";
import { Separator } from "../ui/separator.tsx";
import { cn } from "../utils.ts";
import PageMessage from "../utils/page/PageMessage";
import { htmlCharacterCodes } from "../utils/utils";
import FieldObjectAsTable from "./FieldObjectAsTable";
import FieldObjectRender from "./FieldObjectRender";

export interface HttpEndpointDocProps {
  endpoint: MfdocHttpEndpointDefinitionTypePrimitive;
}

const HttpEndpointDoc: React.FC<HttpEndpointDocProps> = (props) => {
  const { endpoint } = props;
  const notApplicableNode = (
    <PageMessage title="Not Applicable" className="py-4 px-0" />
  );

  return (
    <div
      style={{ width: "100%" }}
      className={cn(
        "space-y-8 [&_table]:font-[var(--font-default),-apple-system,BlinkMacSystemFont,'Work_Sans','Segoe_UI',Roboto,'Helvetica_Neue',Arial,'Noto_Sans',sans-serif,'Apple_Color_Emoji','Segoe_UI_Emoji','Segoe_UI_Symbol','Noto_Color_Emoji']"
      )}
    >
      <div>
        <h5 className="inline-block m-0">
          <code className="text-base">{endpoint.path}</code>
        </h5>{" "}
        {htmlCharacterCodes.doubleDash}{" "}
        <h5 className="inline-block m-0">
          <code className="text-base uppercase">{endpoint.method}</code>
        </h5>
      </div>
      <div className="space-y-4">
        <h5>Path Parameters</h5>
        {endpoint.pathParamaters ? (
          <FieldObjectAsTable
            fieldObject={
              endpoint.pathParamaters as MfdocFieldObjectTypePrimitive<any>
            }
          />
        ) : (
          notApplicableNode
        )}
      </div>
      <Separator />
      <div className="space-y-4">
        <h5>Request Headers</h5>
        {endpoint.requestHeaders ? (
          <FieldObjectAsTable
            fieldObject={
              endpoint.requestHeaders as MfdocFieldObjectTypePrimitive<any>
            }
          />
        ) : (
          notApplicableNode
        )}
      </div>
      <Separator />
      <div className="space-y-4">
        <h5>Request Query</h5>
        {endpoint.query ? (
          <FieldObjectAsTable
            fieldObject={endpoint.query as MfdocFieldObjectTypePrimitive<any>}
          />
        ) : (
          notApplicableNode
        )}
      </div>
      <Separator />
      <div className="space-y-4">
        <h5>Request Body</h5>
        {isMfdocFieldObject(endpoint.requestBody) ? (
          <FieldObjectRender fieldObject={endpoint.requestBody} />
        ) : isMfdocMultipartFormdata(endpoint.requestBody) &&
          endpoint.requestBody.items ? (
          <FieldObjectAsTable fieldObject={endpoint.requestBody.items} />
        ) : (
          notApplicableNode
        )}
      </div>
      <Separator />
      <div className="space-y-4">
        <h5>200 {htmlCharacterCodes.doubleDash} Response Headers</h5>
        {endpoint.responseHeaders ? (
          <FieldObjectAsTable
            fieldObject={
              endpoint.responseHeaders as MfdocFieldObjectTypePrimitive<any>
            }
          />
        ) : (
          notApplicableNode
        )}
      </div>
      <Separator />
      <div className="space-y-4">
        <h5>200 {htmlCharacterCodes.doubleDash} Response Body</h5>
        {isMfdocFieldObject(endpoint.responseBody) ? (
          <FieldObjectRender fieldObject={endpoint.responseBody} />
        ) : isMfdocFieldBinary(endpoint.responseBody) ? (
          <code>binary</code>
        ) : (
          notApplicableNode
        )}
      </div>
      <Separator />
      <div className="space-y-4">
        <h5>4XX or 5XX {htmlCharacterCodes.doubleDash} Response Headers</h5>
        {endpoint.errorResponseHeaders ? (
          <FieldObjectAsTable
            fieldObject={
              endpoint.errorResponseHeaders as MfdocFieldObjectTypePrimitive<any>
            }
          />
        ) : (
          notApplicableNode
        )}
      </div>
      <Separator />
      <div className="space-y-4">
        <h5>4XX or 5XX {htmlCharacterCodes.doubleDash} Response Body</h5>
        {endpoint.errorResponseBody ? (
          <FieldObjectRender fieldObject={endpoint.errorResponseBody} />
        ) : (
          notApplicableNode
        )}
      </div>
    </div>
  );
};

export default HttpEndpointDoc;
