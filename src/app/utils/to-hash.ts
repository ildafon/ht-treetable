import { htFmsItemI, htHashItemC, htHashTableI} from '../models';

export  function toHash (rows: htFmsItemI[]): htHashTableI {
    return rows.reduce( (obj, cur, idx, src) => {
      const hashItem = new htHashItemC();
      hashItem.id = cur.id;
      hashItem.parentId = getParentId(cur, src);
      hashItem.childrenIds = getChildrenIds(cur, src);
      hashItem.row = cur;
      
      hashItem.row.level = getLevel(cur);
      hashItem.row.hidden = false;

      if (hashItem.childrenIds.length > 0) {
        hashItem.row.hasChildren = true;
      }
        
      obj[hashItem.id] = hashItem;
      return obj;
    }, {});
  }
  
function getSortedRows(data: htFmsItemI[]){
    return [...data].sort((a,b) => (a.code > b.code) ? 1 : ((b.code > a.code) ? -1 : 0)); 
}

function getLevel( row: htFmsItemI): number {
    return ((<string>row.code).match(/\./g) || []).length + 1
}
  
function getParentId(row: htFmsItemI, array: htFmsItemI[]): string|null {
    const index = row.code.lastIndexOf('.');
    if (index > -1) {
      const parentCode = row.code.substring(0, index);
      const parentIndex = array.findIndex(t => t.code === parentCode);
      if (parentIndex > -1) {
        const parentRow = array[parentIndex];
       return  parentRow.id;
      }
    } else return null; // No dots in code, then this row hasn`t parent
}

function getChildrenIds(row: htFmsItemI, array: htFmsItemI[]): string[] | null {
    return array.filter( elem => elem.code.startsWith(row.code) 
        && (elem.code.match(/\./g) || []).length === (row.code.match(/\./g) || []).length + 1 )
    .map( elem => elem.id)
}



