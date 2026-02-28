'use client';

import React, { useState, useMemo } from 'react';

function krw(n:number){
  return new Intl.NumberFormat('ko-KR').format(Math.round(n));
}

export default function TradingPanelV2({ currentPriceKrw = 13500 }) {

  const [type,setType] = useState<'limit'|'market'>('limit');
  const [side,setSide] = useState<'buy'|'sell'>('buy');
  const [price,setPrice] = useState(currentPriceKrw);
  const [qty,setQty] = useState(1);

  const subtotal = useMemo(()=>price*qty,[price,qty]);
  const fee = subtotal*0.0003;
  const total = subtotal+fee;

  return(
    <div style={{background:'#fff',padding:16,borderRadius:16,border:'1px solid #eee'}}>

      {/* 지정가/시장가 */}
      <div style={{display:'flex',gap:8,marginBottom:12}}>
        <button
          onClick={()=>setType('limit')}
          style={{
            flex:1,
            height:44,
            borderRadius:12,
            border:'1px solid #e5e5e5',
            background:type==='limit'?'#111827':'#f5f5f5',
            color:type==='limit'?'#fff':'#111',
            fontWeight:700,
            fontSize:'0.77rem'
          }}>
          지정가
        </button>
        <button
          onClick={()=>setType('market')}
          style={{
            flex:1,
            height:44,
            borderRadius:12,
            border:'1px solid #e5e5e5',
            background:type==='market'?'#111827':'#f5f5f5',
            color:type==='market'?'#fff':'#111',
            fontWeight:700,
            fontSize:'0.77rem'
          }}>
          시장가
        </button>
      </div>

      {/* 매수/매도 */}
      <div style={{display:'flex',gap:8,marginBottom:12}}>
        <button
          onClick={()=>setSide('buy')}
          style={{
            flex:1,
            height:44,
            borderRadius:12,
            border:'1px solid #e5e5e5',
            background:side==='buy'?'#2563eb':'#f5f5f5',
            color:side==='buy'?'#fff':'#111',
            fontWeight:800,
            fontSize:'0.77rem'
          }}>
          매수
        </button>
        <button
          onClick={()=>setSide('sell')}
          style={{
            flex:1,
            height:44,
            borderRadius:12,
            border:'1px solid #e5e5e5',
            background:side==='sell'?'#ef4444':'#f5f5f5',
            color:side==='sell'?'#fff':'#111',
            fontWeight:800,
            fontSize:'0.77rem'
          }}>
          매도
        </button>
      </div>

      {/* 가격 */}
      <div style={{marginBottom:12}}>
        <div style={{fontSize:13,fontWeight:700,marginBottom:6}}>가격 (KRW)</div>
        <input
          type="number"
          disabled={type==='market'}
          value={type==='market'?currentPriceKrw:price}
          onChange={e=>setPrice(Number(e.target.value))}
          style={{
            width:'100%',
            height:44,
            borderRadius:12,
            border:'1px solid #e5e5e5',
            padding:'0 12px',
            fontWeight:700
          }}
        />
      </div>

      {/* 수량 */}
      <div style={{marginBottom:12}}>
        <div style={{fontSize:13,fontWeight:700,marginBottom:6}}>수량</div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>setQty(q=>Math.max(1,q-1))}
            style={{width:44,height:44,borderRadius:12,border:'1px solid #e5e5e5'}}>−</button>
          <input
            type="number"
            value={qty}
            onChange={e=>setQty(Number(e.target.value))}
            style={{flex:1,height:44,borderRadius:12,border:'1px solid #e5e5e5',textAlign:'center',fontWeight:800}}
          />
          <button onClick={()=>setQty(q=>q+1)}
            style={{width:44,height:44,borderRadius:12,border:'1px solid #e5e5e5'}}>+</button>
        </div>
      </div>

      {/* 예상 체결금액 */}
      <div style={{background:'#f9fafb',padding:14,borderRadius:14,border:'1px solid #eee',marginBottom:12}}>
        <div style={{display:'flex',justifyContent:'space-between'}}>
          <span style={{fontWeight:700}}>예상 체결금액</span>
          <span style={{fontWeight:900,fontSize:18}}>₩{krw(subtotal)}</span>
        </div>
        <div style={{marginTop:6,fontSize:12,color:'#6b7280'}}>
          수수료 ₩{krw(fee)}
        </div>
        <div style={{marginTop:8,display:'flex',justifyContent:'space-between'}}>
          <span style={{fontWeight:800}}>총액</span>
          <span style={{fontWeight:900}}>₩{krw(total)}</span>
        </div>
      </div>

      {/* 실행 버튼 */}
      <button
        style={{
          width:'100%',
          height:50,
          borderRadius:14,
          border:'none',
          fontWeight:900,
          background:side==='buy'?'#2563eb':'#ef4444',
          color:'#fff',
          fontSize:'0.77rem'
        }}>
        {side==='buy'?'매수하기':'매도하기'}
      </button>

    </div>
  );
}
