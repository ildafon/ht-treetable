export interface htFmsItem {
    id: string;
    code: string;
    text: string;
    criterion: string | null;
    hidden: boolean;
    open: boolean;
    flag: boolean;
    level?: number;
    hasChildren?: boolean;
    extend?: boolean;
    loading?: boolean;
  }

export class htHashItem {
    id: string;
    row: htFmsItem;
    parentId: string | null;
    childrenIds: string[] = []; 
}


export interface htHashTable {
  [id:string]: htHashItem;
}