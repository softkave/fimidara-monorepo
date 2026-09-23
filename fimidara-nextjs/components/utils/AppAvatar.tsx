import { systemConstants } from "@/lib/definitions/system";
import { cn } from "@/lib/utils";
import { useRequest } from "ahooks";
import assert from "assert";
import { cva, VariantProps } from "class-variance-authority";
import { getFimidaraReadFileURL } from "fimidara";
import { first } from "lodash-es";
import { getPublicFimidaraEndpointsUsingUserToken } from "../../lib/api/fimidaraEndpoints";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar.tsx";

const avatarVariants = cva("", {
  variants: {
    shape: {
      rounded: "rounded-full",
      square: "rounded-md",
    },
  },
  defaultVariants: {
    shape: "rounded",
  },
});

export interface IAppAvatarProps extends VariantProps<typeof avatarVariants> {
  alt: string;
  filepath?: string;
  fallback?: React.ReactNode;
  className?: string;
}

export default function AppAvatar(props: IAppAvatarProps) {
  const { filepath, alt, fallback, className, shape } = props;

  const getPresignedPath = async () => {
    if (!filepath) return undefined;

    const endpoints = await getPublicFimidaraEndpointsUsingUserToken();
    const getResult = await endpoints.presignedPaths.getPresignedPaths({
      files: [{ filepath }],
    });

    if (getResult.paths.length) {
      const p = first(getResult.paths);
      assert.ok(p);
      return p.path;
    }

    const issueResult = await endpoints.presignedPaths.issuePresignedPath({
      filepath,
    });
    return issueResult.path;
  };

  const pathHook = useRequest(getPresignedPath);
  const src = pathHook.data
    ? getFimidaraReadFileURL({
        serverURL: systemConstants.serverAddr,
        filepath: "/" + pathHook.data,
        // width: appDimensions.avatar.width,
        // height: appDimensions.avatar.height,
      })
    : undefined;

  return (
    <Avatar className={cn(avatarVariants({ shape }), className, "border-0")}>
      <AvatarImage
        src={src}
        alt={alt}
        className={cn(avatarVariants({ shape }))}
      />
      {fallback && (
        <AvatarFallback className={cn(avatarVariants({ shape }))}>
          {fallback}
        </AvatarFallback>
      )}
    </Avatar>
  );
}
