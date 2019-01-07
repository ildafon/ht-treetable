export interface htFmsItemI {
    id: string;
    code: string;
    text: string;
    criterion: string | null;
    hidden: boolean;
    open: boolean;
    flag: boolean;
    level?: number;
  }

  export interface fmsItem {
    id: string;
    code: string;
    text: string;
    criterion: string | null;
    hidden: boolean;
    open: boolean;
    flag: boolean;
  }


export class htHashItemC {
    id: string;
    row: htFmsItemI;
    parentId: string | null;
    childrenIds: string[] = []; 
}

export interface htHashTableI {
  [id:string]: htHashItemC
}