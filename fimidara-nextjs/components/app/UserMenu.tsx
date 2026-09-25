import { kAppRootPaths } from "@/lib/definitions/paths/root.ts";
import { kAppWorkspacePaths } from "@/lib/definitions/paths/workspace.ts";
import { useRequestLogout } from "@/lib/hooks/session/useRequestLogout.ts";
import Link from "next/link";
import { useAssertGetUser } from "../hooks/useAssertGetUser.tsx";
import { DropdownItems, IDropdownItem } from "../ui/dropdown-items.tsx";
import UserAvatar from "./user/UserAvatar";

const kMenuKeys = {
  logout: "logout",
  docs: "docs",
  app: "app",
};

export default function UserMenu() {
  const { requestLogout } = useRequestLogout();
  const userNode = useAssertGetUser();

  const renderBtnNode = (userId: string, withError?: boolean) => {
    return (
      <UserAvatar userId={userId} alt="Your profile picture" shape="square" />
    );
  };

  const items: IDropdownItem[] = [
    {
      label: (
        <Link
          href={kAppWorkspacePaths.workspaces}
          className="w-full inline-block"
        >
          App
        </Link>
      ),
      key: kMenuKeys.app,
    },
    {
      label: (
        <Link href={kAppRootPaths.docs} className="w-full inline-block">
          Docs
        </Link>
      ),
      key: kMenuKeys.docs,
    },
    {
      // TODO: use a /logout page
      label: "Logout",
      key: kMenuKeys.logout,
    },
  ];

  const onClick = async (key: string) => {
    if (key === kMenuKeys.logout) {
      requestLogout();
    }
  };

  return (
    <DropdownItems items={items} onSelect={onClick}>
      {renderBtnNode(userNode.assertGet().user.resourceId)}
    </DropdownItems>
  );
}
