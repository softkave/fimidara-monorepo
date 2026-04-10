import { MaybeScroll } from "@/components/internal/maybe-scroll";
import { Button } from "@/components/ui/button.tsx";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet.tsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.tsx";
import { FormAlertList } from "@/components/utils/FormAlertList";
import { useToast } from "@/hooks/use-toast.ts";
import {
  clearOutResolvedPermissionFetchStore,
  useMergeMutationHookStates,
  usePermissionsAddMutationHook,
  usePermissionsDeleteMutationHook,
} from "@/lib/hooks/mutationHooks";
import {
  AgentToken,
  Collaborator,
  DeletePermissionItemInput,
  FimidaraPermissionAction,
  FimidaraResourceType,
  PermissionGroup,
  PermissionItemInput,
} from "fimidara";
import { forEach, isBoolean, merge } from "lodash-es";
import { FC, useState } from "react";
import AgentTokenListContainer from "../agentTokens/AgentTokenListContainer";
import CollaboratorListContainer from "../collaborators/CollaboratorListContainer";
import PermissionGroupListContainer from "../permissionGroups/PermissionGroupListContainer";
import TargetGrantPermissionFormEntityList, {
  splitKey,
} from "./TargetGrantPermissionFormEntityList";
import { ResolvedPermissionsMap, TargetIdPermissions } from "./types";

export interface TargetGrantPermissionFormProps {
  workspaceId: string;
  targetId: string;
  actionTargetType: FimidaraResourceType;
  onClose: () => void;
  actionType: "item" | "group" | "both";
}

enum TabKey {
  Collaborator = "collaborator",
  AgentToken = "agent-token",
  PermissionGroup = "permission-group",
}

const TargetGrantPermissionForm: FC<TargetGrantPermissionFormProps> = (
  props
) => {
  const { workspaceId, targetId, actionTargetType, onClose, actionType } =
    props;
  const { toast } = useToast();

  const [activeKey] = useState(TabKey.PermissionGroup);
  const [targetPermissions, setTargetPermissions] =
    useState<TargetIdPermissions>({ original: {}, updated: {} });

  const handleTargetPermissionsOnChange = (
    updated: ResolvedPermissionsMap,
    original: ResolvedPermissionsMap
  ) => {
    const newPermissions = merge({}, targetPermissions, {
      original,
      updated,
    });
    setTargetPermissions(newPermissions);
  };

  const addHook = usePermissionsAddMutationHook();
  const deleteHook = usePermissionsDeleteMutationHook();
  const { loading, error } = useMergeMutationHookStates(addHook, deleteHook);

  const handleOnSave = async () => {
    const { addItems, deleteItems } = getAddedAndDeletedPermissions(
      targetId,
      targetPermissions
    );

    await Promise.all([
      addItems.length && addHook.runAsync({ workspaceId, items: addItems }),
      deleteItems && deleteHook.runAsync({ workspaceId, items: deleteItems }),
    ]);

    if (addItems.length || deleteItems.length) {
      toast({ title: "Permissions updated" });
    }

    // Close first, to prevent a refetch of resolved permissions in this
    // session/modal Assuming once the user saves, we're already done with
    // permission updates.
    onClose();

    // Forces a refetch of resolved permissions. Resolved permission params are
    // quite complex so it's easier just to clear out and refetch.
    clearOutResolvedPermissionFetchStore();
  };

  const renderPermissionGroupList = (items: PermissionGroup[]) => {
    return (
      <TargetGrantPermissionFormEntityList
        key={actionTargetType}
        workspaceId={workspaceId}
        entities={items}
        targetId={targetId}
        actionTargetType={actionTargetType}
        disabled={loading}
        defaultUpdatedPermissions={targetPermissions.updated}
        getInfoFromItem={(item) => ({ name: item.name })}
        onChange={handleTargetPermissionsOnChange}
        actionType={actionType}
      />
    );
  };

  const renderAgentTokenList = (items: AgentToken[]) => {
    return (
      <TargetGrantPermissionFormEntityList
        key={actionTargetType}
        workspaceId={workspaceId}
        entities={items}
        targetId={targetId}
        actionTargetType={actionTargetType}
        disabled={loading}
        defaultUpdatedPermissions={targetPermissions.updated}
        getInfoFromItem={(item) => ({ name: item.name ?? item.resourceId })}
        onChange={handleTargetPermissionsOnChange}
        actionType={actionType}
      />
    );
  };

  const renderCollaboratorList = (items: Collaborator[]) => {
    return (
      <TargetGrantPermissionFormEntityList
        key={actionTargetType}
        workspaceId={workspaceId}
        entities={items}
        targetId={targetId}
        actionTargetType={actionTargetType}
        disabled={loading}
        defaultUpdatedPermissions={targetPermissions.updated}
        getInfoFromItem={(item) => ({
          name: item.firstName + " " + item.lastName,
        })}
        onChange={handleTargetPermissionsOnChange}
        actionType={actionType}
      />
    );
  };

  const tabsNode = (
    <Tabs defaultValue={activeKey} className="w-full">
      <TabsList>
        <TabsTrigger
          value={TabKey.PermissionGroup}
          key={TabKey.PermissionGroup}
        >
          Permission Group
        </TabsTrigger>
        <TabsTrigger value={TabKey.Collaborator} key={TabKey.Collaborator}>
          Collaborator
        </TabsTrigger>
        <TabsTrigger value={TabKey.AgentToken} key={TabKey.AgentToken}>
          Agent Token
        </TabsTrigger>
      </TabsList>
      <TabsContent value={TabKey.PermissionGroup}>
        <PermissionGroupListContainer
          workspaceId={workspaceId}
          renderList={renderPermissionGroupList}
        />
      </TabsContent>
      <TabsContent value={TabKey.Collaborator}>
        <CollaboratorListContainer
          workspaceId={workspaceId}
          renderList={renderCollaboratorList}
        />
      </TabsContent>
      <TabsContent value={TabKey.AgentToken}>
        <AgentTokenListContainer
          workspaceId={workspaceId}
          renderList={renderAgentTokenList}
        />
      </TabsContent>
    </Tabs>
  );

  const errorNode = error.length ? <FormAlertList error={error} /> : null;

  return (
    <Sheet open onOpenChange={onClose}>
      <SheetContent className="w-full max-w-[420px] p-0">
        <MaybeScroll>
          <SheetHeader className="p-6 space-y-2">
            <SheetTitle>Update Permissions</SheetTitle>
            <SheetDescription>
              Update the permissions for the target.
            </SheetDescription>
          </SheetHeader>
          <div className="p-6 pt-0 space-y-6">
            {errorNode}
            {tabsNode}
            <div>
              <Button
                loading={loading}
                onClick={() => handleOnSave()}
                type="button"
                className="w-full"
              >
                Save Permissions
              </Button>
            </div>
          </div>
        </MaybeScroll>
      </SheetContent>
    </Sheet>
  );
};

function getAddedAndDeletedTargetIdPermissions(
  targetId: string,
  targetIdPermissions: TargetIdPermissions
) {
  const { original, updated } = targetIdPermissions;
  const addItems: Array<PermissionItemInput> = [];
  const deleteItems: Array<DeletePermissionItemInput> = [];

  forEach(updated, (updatedPermitted, key) => {
    const [entityId, action] = splitKey(key);
    const originalPermitted = original[key];

    // Target ID permitted is always boolean
    if (!isBoolean(updatedPermitted?.access)) return;

    // No need to update if permission is same and access entity is same as
    // entity
    if (
      originalPermitted &&
      originalPermitted.access === updatedPermitted.access &&
      originalPermitted.entityId === entityId
    )
      return;

    deleteItems.push({
      entityId,
      action: action as FimidaraPermissionAction,
      targetId,

      // Delete opposite of permission
      access: !updatedPermitted.access,
    });
    addItems.push({
      entityId,
      action: action as FimidaraPermissionAction,
      targetId,
      access: updatedPermitted.access,
    });
  });

  return { addItems, deleteItems };
}

function getAddedAndDeletedPermissions(
  targetId: string,
  targetIdPermissions: TargetIdPermissions
) {
  const { addItems, deleteItems } = getAddedAndDeletedTargetIdPermissions(
    targetId,
    targetIdPermissions
  );

  return { addItems, deleteItems };
}

export default TargetGrantPermissionForm;
