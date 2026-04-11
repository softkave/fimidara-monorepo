export interface IRawNavItem {
  key: string;
  label: React.ReactNode;
  tooltip?: string;
  icon?: React.ReactNode;
  children?: IRawNavItem[];
  href?: string;
  isDivider?: boolean;
}

export interface ISomeNavItem {
  tooltip?: string;
  icon?: React.ReactNode;
  label?: React.ReactNode;
  href?: string;
  key: string;
  children?: Array<ISomeNavItem>;
  isDivider?: boolean;
}
