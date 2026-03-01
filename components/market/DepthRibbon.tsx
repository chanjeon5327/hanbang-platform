'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Row = { priceKrw: number; qty: number };

function krw(n:number){ return new Intl.NumberFormat('ko-KR').format(Math.round(n)); }
function clamp(n:number,min:number,max:number){ return Math.max(min, Math.min(max,n)); }

function makeMock(mid:number){
  const asks:Row[] = [];
  const bids:Row[] = [];
  for(let i=1;i<=10;i++){
    asks.push({ priceKrw: mid + i*10, qty: 20 + Math.round(Math.random()*80) });
    bids.push({ priceKrw: mid - i*10, qty: 20 + Math.round(Math.random()*80) });
  }
  return { asks, bids };
}

export default function DepthRibbon({
  midPriceKrw = 13500,
  asks,
  bids,
  dense = false,
}:{
  midPriceKrw?: number;
  asks?: Row[];
  bids?: Row[];
  dense?: boolean;
}) {
  const [tick, setTick] = useState(0);

  const data = useMemo(() => {
    const m = makeMock(midPriceKrw);
    const a = (asks?.length ? asks : m.asks).slice(0,10);
    const b = (bids?.length ? bids : m.bids).slice(0,10);
    return { a, b };
  }, [asks, bids, midPriceKrw, tick]);

  const maxQty = useMemo(() => {
    const aa = Math.max(...data.a.map(x=>x.qty), 1);
    const bb = Math.max(...data.b.map(x=>x.qty), 1);
    return Math.max(aa, bb);
  }, [data]);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 900); // "움직이는" 느낌
    return () => clearInterval(id);
  }, []);

  const rowH = dense ? 22 : 26;
  const font = dense ? 12 : 13;

  return (
    <div style={{ marginTop: 12, borderRadius: 16, border: '1px solid #eee', overflow: 'hidden', background: '#fff' }}>
      {/* ASK (빨강, 위) */}
      <div style={{ padding: 10 }}>
        {data.a.map((r, i) => {
          const w = clamp(Math.round((r.qty / maxQty) * 100), 3, 100);
          return (
            <div key={'a'+i} style={{ position:'relative', height: rowH, marginBottom: 4, borderRadius: 10, overflow:'hidden' }}>
              <div
                style={{
                  position:'absolute', right:0, top:0, bottom:0,
                  width: `${w}%`,
                  background: 'linear-gradient(90deg, rgba(239,68,68,0.18), rgba(239,68,68,0.35))',
                  transform: `translateX(${(tick%6)-3}px)`,
                  transition: 'transform 300ms ease'
                }}
              />
              <div style={{ position:'relative', height:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 10px', fontSize: font, fontWeight: 700 }}>
                <span style={{ color:'#ef4444' }}>₩{krw(r.priceKrw)}</span>
                <span style={{ opacity:0.75 }}>{krw(r.qty)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* MID */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', borderTop:'1px solid #f0f0f0', borderBottom:'1px solid #f0f0f0', background:'#fafafa' }}>
        <span style={{ fontSize: 12, fontWeight: 900, opacity:0.7 }}>현재가</span>
        <span style={{ fontSize: 14, fontWeight: 900 }}>₩{krw(midPriceKrw)}</span>
      </div>

      {/* BID (파랑, 아래) */}
      <div style={{ padding: 10 }}>
        {data.b.map((r, i) => {
          const w = clamp(Math.round((r.qty / maxQty) * 100), 3, 100);
          return (
            <div key={'b'+i} style={{ position:'relative', height: rowH, marginBottom: 4, borderRadius: 10, overflow:'hidden' }}>
              <div
                style={{
                  position:'absolute', left:0, top:0, bottom:0,
                  width: `${w}%`,
                  background: 'linear-gradient(90deg, rgba(37,99,235,0.18), rgba(37,99,235,0.35))',
                  transform: `translateX(${3-(tick%6)}px)`,
                  transition: 'transform 300ms ease'
                }}
              />
              <div style={{ position:'relative', height:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 10px', fontSize: font, fontWeight: 700 }}>
                <span style={{ color:'#2563eb' }}>₩{krw(r.priceKrw)}</span>
                <span style={{ opacity:0.75 }}>{krw(r.qty)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
