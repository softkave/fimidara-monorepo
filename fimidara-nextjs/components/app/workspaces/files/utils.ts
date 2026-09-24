import { fileValidationParts } from "@/lib/validation/file";
import { debounce } from "lodash-es";
import { SingleFileFormValue } from "./types";

export function getNewFileLocalId() {
  return Math.random().toString();
}

/** Strip characters that fail file/folder name validation, preserving path segments. */
export function normalizeFimidaraName(name: string): string {
  return name
    .replace(/\\/g, "/")
    .split("/")
    .map((part) =>
      part
        .replace(new RegExp(fileValidationParts.notNameRegex, "g"), " ")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter((part) => part.length > 0 && part !== "." && part !== "..")
    .join("/");
}

export function getFirstFoldername(names: string[]) {
  for (const name of names) {
    const foldername = name
      .replace(/\\/g, "/")
      .split("/")
      .find((segment) => !!segment && segment !== "." && segment !== "..");

    if (foldername) {
      return foldername;
    }
  }

  return undefined;
}

export const replaceBaseFoldername = <
  T extends Pick<SingleFileFormValue, "name">
>(
  files: T[],
  foldername: string
) => {
  return files.map((file) => {
    let names = file.name.split("/");
    const baseFoldernameIndex = names.findIndex(
      (name) => !!name && name !== "." && name !== ".."
    );

    if (baseFoldernameIndex === -1) {
      //  do nothing
    } else if (baseFoldernameIndex === names.length - 1) {
      names = names
        .slice(0, Math.max(0, baseFoldernameIndex))
        .concat(foldername, names.slice(baseFoldernameIndex));
    } else {
      names[baseFoldernameIndex] = foldername;
    }

    return { ...file, name: names.join("/") };
  });
};

export const debouncedReplaceBaseFolderName = debounce(
  replaceBaseFoldername,
  500
);
