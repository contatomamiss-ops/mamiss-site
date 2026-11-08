import {digest} from './resend-core.js';
// Durable atomic UPSERT: concurrent D1 writes serialize per (bucket,slot).
export async function allow(db,identifier,{limit=5,windowSeconds=3600,now=Date.now()}={}){
 const slot=Math.floor(now/(windowSeconds*1000));
 const bucket=await digest(identifier);
 const row=await db.prepare('INSERT INTO lead_rate_limits(bucket,slot,count) VALUES(?,?,1) ON CONFLICT(bucket,slot) DO UPDATE SET count=count+1 WHERE count < ? RETURNING count').bind(bucket,slot,limit).first();
 return Boolean(row);
}
