export interface Definition {
  key: string;
  value: string;
  pageName: string;
}

export type Page = {
  name: string;
  definitions: Array<Omit<Definition, 'pageName'>>;
};
