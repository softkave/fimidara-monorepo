import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/utils/FormAlert";
import LabeledNode from "@/components/utils/LabeledNode";
import ListHeader from "@/components/utils/list/ListHeader";
import { ObfuscateText } from "@/components/utils/ObfuscateText";
import { toast } from "@/hooks/use-toast";
import { useWorkspaceAgentTokenEncodeTokenMutationHook } from "@/lib/hooks/mutationHooks";
import { formatDateTime } from "@/lib/utils/dateFns";
import { AgentToken } from "fimidara";
import { useCallback } from "react";

export interface IAgentTokenJWTTokenProps {
  token: AgentToken;
}

export function AgentTokenJWTToken(props: IAgentTokenJWTTokenProps) {
  const { token } = props;
  const encodeTokenHook = useWorkspaceAgentTokenEncodeTokenMutationHook({
    onSuccess(data, params) {
      toast({ title: "JWT Token Generated" });
    },
  });

  const onGenerateToken = useCallback(() => {
    encodeTokenHook.runAsync({
      tokenId: token.resourceId,
    });
  }, [encodeTokenHook, token.resourceId]);

  return (
    <div className="space-y-8">
      <FormAlert error={encodeTokenHook.error} />
      <ListHeader
        label="JWT Token"
        buttons={
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={onGenerateToken}
              loading={encodeTokenHook.loading}
            >
              {token.jwtToken ? "Regenerate Token" : "Generate Token"}
            </Button>
          </div>
        }
      />
      <LabeledNode
        direction="vertical"
        label="Encoded JWT Token"
        node={
          <ObfuscateText
            text={token.jwtToken || ""}
            canCopy
            defaultText={"Click Generate Token to generate a JWT token"}
          />
        }
      />
      <LabeledNode
        direction="vertical"
        label="JWT Refresh Token"
        node={
          <ObfuscateText
            text={token.refreshToken || ""}
            canCopy
            defaultText={"Click Generate Token to generate a JWT refresh token"}
          />
        }
      />
      <LabeledNode
        direction="vertical"
        label="JWT Token Expires"
        node={
          <p className="line-clamp-2">
            {token.jwtTokenExpiresAt ? (
              formatDateTime(token.jwtTokenExpiresAt)
            ) : (
              <span className="text-muted-foreground">Not Applicable</span>
            )}
          </p>
        }
      />
    </div>
  );
}
