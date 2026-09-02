export interface LayoutNode{id:string;x:number;y:number;width:number;height:number}
export function grid(ids:string[],width=900):LayoutNode[]{const cols=Math.max(1,Math.ceil(Math.sqrt(ids.length)));const cell=Math.max(150,Math.floor(width/cols));return ids.map((id,i)=>({id,x:30+(i%cols)*cell,y:40+Math.floor(i/cols)*130,width:Math.min(180,cell-30),height:80}))}
