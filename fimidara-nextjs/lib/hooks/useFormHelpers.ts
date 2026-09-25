"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { toAppErrorList } from "../utils/errors";

export const useFormHelpers = (
  form: UseFormReturn<any, any, any>,
  other: { errors?: unknown }
) => {
  const lastErrorRef = React.useRef<any>(undefined);

  React.useEffect(() => {
    if (other.errors && other.errors !== lastErrorRef.current) {
      lastErrorRef.current = other.errors;
      const errorArr = toAppErrorList(other.errors);
      errorArr.forEach((err) => {
        if (err.field) form.setError(err.field, err);
      });
    }
  }, [other.errors, form]);
};
