export interface JsonViewProps {
  src: any;
  name?: string | false | null;
  theme?: string;
  style?: object;
  iconStyle?: string;
  indentWidth?: number;
  collapsed?: boolean | number;
  collapseStringsAfterLength?: number | false;
  shouldCollapse?: (fields: any) => {};
  groupArraysAfterLength?: number;
  enableClipboard?: boolean | ((copy: any) => any);
  displayObjectSize?: boolean;
  displayDataTypes?: boolean;
  onEdit?: boolean | ((edit: any) => any);
  onDelete?: boolean | ((deleteP: any) => any);
  onAdd?: boolean | ((add: any) => any);
  onSelect?: boolean | ((select: any) => any);
  defaultValue?: string | number | boolean | Array<any> | null;
  sortKeys?: boolean;
  quotesOnKeys?: boolean;
  validationMessage?: string;
  displayArrayKey?: boolean;
}
