import { cn } from "@/lib/utils";
import { MailIcon } from "lucide-react";
import Link from "next/link";
import { GithubIcon } from "../icons/github";
import { LinkedinIcon } from "../icons/linkedin";
import { XIcon } from "../icons/x";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

export interface IWebFooterContact {
  title: string;
  email: string;
  xURL: string;
  githubURL: string;
  linkedinURL: string;
}

export const kFooterContact: IWebFooterContact = {
  title: "fimidara",
  email: "abayomi@softkave.com",
  xURL: "https://x.com/ywordk",
  githubURL: "https://github.com/softkave",
  linkedinURL: "https://www.linkedin.com/in/akintomide-abayomi-05/",
};

function FooterContackLink(props: { href: string; icon: React.ReactNode }) {
  return (
    <Link href={props.href}>
      <Button variant="ghost" size="icon">
        {props.icon}
      </Button>
    </Link>
  );
}

export function WebFooterContact(props: {
  contact: IWebFooterContact;
  className?: string;
}) {
  return (
    <div className={cn("flex gap-2", props.className)}>
      <h3 className="text-md font-black text-muted-foreground flex-1 flex items-center">
        {props.contact.title}
      </h3>
      <div className="flex gap-2 items-center">
        <FooterContackLink
          href={`mailto:${props.contact.email}`}
          icon={<MailIcon className="w-4 h-4" />}
        />
        <Separator orientation="vertical" />
        <FooterContackLink
          href={props.contact.xURL}
          icon={<XIcon className="size-3" />}
        />
        <Separator orientation="vertical" />
        <FooterContackLink
          href={props.contact.githubURL}
          icon={<GithubIcon className="w-4 h-4" />}
        />
        <Separator orientation="vertical" />
        <FooterContackLink
          href={props.contact.linkedinURL}
          icon={<LinkedinIcon className="w-4 h-4" />}
        />
      </div>
    </div>
  );
}
