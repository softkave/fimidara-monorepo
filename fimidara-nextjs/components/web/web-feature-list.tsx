import { cn } from "@/lib/utils";
import {
  FileCheck2Icon,
  FileLock2Icon,
  FileStackIcon,
  FileUpIcon,
  ImageIcon,
  LinkIcon,
  SquareActivityIcon,
  UsersIcon,
} from "lucide-react";
import { WebFeatureItem } from "./web-feature-item";

export interface IWebFeature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const kFeatureListItems: IWebFeature[] = [
  {
    title: "Reliably Store Files",
    description:
      "Store files reliably and securely in a distributed and decentralized way.",
    icon: <FileCheck2Icon />,
  },
  {
    title: "Powerful Access Controls",
    description:
      "Implement simple and complex access controls using agent tokens and permission groups.",
    icon: <FileLock2Icon />,
  },
  {
    title: "Secure Client Access",
    description:
      "Build clients that securely access files without going through your servers.",
    icon: <FileUpIcon />,
  },
  {
    title: "Collaborate with Others",
    description:
      "Invite others to collaborate on files and folders. Use permission groups to control access.",
    icon: <UsersIcon />,
  },
  {
    title: "Resumable Uploads",
    description: "Upload files in chunks and resume if interrupted.",
    icon: <FileStackIcon />,
  },
  {
    title: "Monitor Usage",
    description: "Monitor usage and storage costs in real-time.",
    icon: <SquareActivityIcon />,
  },
  {
    title: "Presigned URLs",
    description: "Generate presigned URLs to share files with others.",
    icon: <LinkIcon />,
  },
  {
    title: "Image Transformation",
    description: "Transform images on the fly using a URL query string.",
    icon: <ImageIcon />,
  },
];

export function WebFeatureList(props: {
  items: IWebFeature[];
  className?: string;
}) {
  return (
    <div className={cn("w-full", props.className)}>
      <div className="flex flex-col gap-4 md:max-w-4xl mx-auto">
        <h2 className="text-lg md:text-2xl font-bold">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {props.items.map((item) => (
            <WebFeatureItem key={item.title} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}
